from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Order, OrderItem, Product, Customer, Store
from app.schemas import OrderResponse, OrderCreate, OrderDetailResponse
from app.auth import require_viewer, require_manager, require_admin

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("", response_model=List[OrderDetailResponse])
def get_orders(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    store_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    status_filter: Optional[str] = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user=Depends(require_viewer)
):
    """
    Retrieves orders with pagination, store/customer filters, and details.
    """
    query = db.query(Order).join(Customer).join(Store)

    if store_id:
        query = query.filter(Order.store_id == store_id)
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    if status_filter:
        query = query.filter(Order.status == status_filter)

    # Order by date descending by default
    query = query.order_by(Order.order_date.desc())

    offset = (page - 1) * limit
    return query.offset(offset).limit(limit).all()

@router.get("/count", response_model=int)
def get_orders_count(
    store_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    status_filter: Optional[str] = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user=Depends(require_viewer)
):
    """
    Returns total count of orders matching filters.
    """
    query = db.query(Order)
    if store_id:
        query = query.filter(Order.store_id == store_id)
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    if status_filter:
        query = query.filter(Order.status == status_filter)
    return query.count()

@router.get("/{order_id}", response_model=OrderDetailResponse)
def get_order(order_id: int, db: Session = Depends(get_db), current_user=Depends(require_viewer)):
    """
    Gets detailed order by its ID.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("", response_model=OrderDetailResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager)
):
    """
    Creates an order, validating customer/store, deducting product stock (Manager or Admin required).
    """
    # Verify customer and store exist
    cust = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
    if not cust:
        raise HTTPException(status_code=400, detail="Invalid customer ID")
        
    store = db.query(Store).filter(Store.id == order_in.store_id).first()
    if not store:
        raise HTTPException(status_code=400, detail="Invalid store ID")

    if not order_in.items:
        raise HTTPException(status_code=400, detail="An order must contain at least one item")

    # Create order object
    order = Order(
        customer_id=order_in.customer_id,
        store_id=order_in.store_id,
        order_date=order_in.order_date,
        status="Completed",
        total_amount=0.0
    )
    
    db.add(order)
    db.flush() # gets order.id
    
    total_amount = 0.0
    
    # Process items
    for item in order_in.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if not prod:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Product with ID {item.product_id} not found")
            
        # Check stock levels
        if prod.current_stock < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for product '{prod.name}'. Available: {prod.current_stock}, Requested: {item.quantity}"
            )
            
        # Deduct stock
        prod.current_stock -= item.quantity
        
        # Calculate pricing
        item_total = item.quantity * item.unit_price
        total_amount += item_total
        
        order_item = OrderItem(
            order_id=order.id,
            product_id=prod.id,
            quantity=item.quantity,
            unit_price=item.unit_price
        )
        db.add(order_item)

    order.total_amount = total_amount
    db.commit()
    db.refresh(order)
    
    return order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_order(order_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    """
    Cancels/deletes an order and returns stock inventory to products (Admin only).
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Revert inventory stock
    for item in order.order_items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if prod:
            prod.current_stock += item.quantity
            
    db.delete(order)
    db.commit()
    return None
