from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.database import get_db
from app.models import Customer
from app.schemas import CustomerResponse, CustomerCreate
from app.auth import require_viewer, require_manager, require_admin

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=List[CustomerResponse])
def get_customers(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = None,
    sort_by: str = Query(default="id", pattern="^(id|name|email|city|region|segment)$"),
    sort_dir: str = Query(default="asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user=Depends(require_viewer)
):
    """
    Retrieves customers with pagination, sorting, and search matching name, email, or city.
    """
    query = db.query(Customer)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Customer.name.like(search_filter),
                Customer.email.like(search_filter),
                Customer.city.like(search_filter)
            )
        )

    col = getattr(Customer, sort_by)
    if sort_dir == "desc":
        query = query.order_by(col.desc())
    else:
        query = query.order_by(col.asc())

    offset = (page - 1) * limit
    return query.offset(offset).limit(limit).all()

@router.get("/count", response_model=int)
def get_customers_count(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_viewer)
):
    """
    Returns total count of customers.
    """
    query = db.query(Customer)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Customer.name.like(search_filter),
                Customer.email.like(search_filter),
                Customer.city.like(search_filter)
            )
        )
    return query.count()

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db), current_user=Depends(require_viewer)):
    """
    Retrieves a single customer by ID.
    """
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    return cust

@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager)
):
    """
    Creates a new customer record.
    """
    existing = db.query(Customer).filter(Customer.email == customer_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Customer email already exists")

    new_cust = Customer(**customer_in.model_dump())
    db.add(new_cust)
    db.commit()
    db.refresh(new_cust)
    return new_cust

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager)
):
    """
    Updates an existing customer profile.
    """
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    update_data = customer_in.model_dump()
    
    if update_data["email"] != cust.email:
        existing = db.query(Customer).filter(Customer.email == update_data["email"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="Customer email already exists")

    for key, value in update_data.items():
        setattr(cust, key, value)

    db.commit()
    db.refresh(cust)
    return cust

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    """
    Deletes a customer profile (Admin only).
    """
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(cust)
    db.commit()
    return None
