from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from app.database import get_db
from app.models import Product, Category
from app.schemas import InventoryStatus, ProductResponse
from app.auth import require_viewer, require_manager

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=InventoryStatus)
def get_inventory_status(db: Session = Depends(get_db), current_user=Depends(require_viewer)):
    """
    Returns general inventory valuations and list of low-stock alert items.
    """
    products = db.query(Product).all()
    
    total_products = len(products)
    total_stock = sum(p.current_stock for p in products)
    stock_value = sum(p.current_stock * p.cost for p in products)
    potential_revenue = sum(p.current_stock * p.price for p in products)
    
    low_stock_items = [p for p in products if p.current_stock <= p.reorder_point]
    reorder_warnings_count = len(low_stock_items)
    
    return {
        "total_products": total_products,
        "total_stock": total_stock,
        "stock_value": stock_value,
        "potential_revenue": potential_revenue,
        "reorder_warnings_count": reorder_warnings_count,
        "low_stock_items": low_stock_items
    }

@router.post("/reorder/{product_id}", response_model=ProductResponse)
def trigger_reorder(product_id: int, quantity: int = Query(default=50, ge=1), db: Session = Depends(get_db), current_user=Depends(require_manager)):
    """
    Restocks/reorders a product by adding quantity to its current stock (Manager or Admin required).
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product.current_stock += quantity
    db.commit()
    db.refresh(product)
    
    return product

@router.post("/reorder-all-low-stock", response_model=Dict[str, Any])
def reorder_all_low_stock(db: Session = Depends(get_db), current_user=Depends(require_manager)):
    """
    Restocks all low stock items automatically to their reorder_point + 50 units (Manager or Admin required).
    """
    low_stock = db.query(Product).filter(Product.current_stock <= Product.reorder_point).all()
    
    count = 0
    restocked_items = []
    for product in low_stock:
        added_stock = product.reorder_point + 50 - product.current_stock
        if added_stock > 0:
            product.current_stock += added_stock
            count += 1
            restocked_items.append({"sku": product.sku, "name": product.name, "added": added_stock})
            
    db.commit()
    return {
        "success": True,
        "restocked_count": count,
        "items": restocked_items
    }
