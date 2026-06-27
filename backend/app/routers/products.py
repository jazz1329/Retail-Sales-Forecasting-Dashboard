from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.database import get_db
from app.models import Product, Category
from app.schemas import ProductResponse, ProductCreate, ProductUpdate, ProductDetailResponse
from app.auth import require_viewer, require_manager, require_admin

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductDetailResponse])
def get_products(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    sort_by: str = Query(default="id", pattern="^(id|name|price|current_stock|sku)$"),
    sort_dir: str = Query(default="asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user=Depends(require_viewer)
):
    """
    Retrieves a list of products with pagination, search, category filter, and sorting.
    """
    query = db.query(Product).join(Category)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.like(search_filter),
                Product.sku.like(search_filter)
            )
        )

    if category_id:
        query = query.filter(Product.category_id == category_id)

    # Sorting
    col = getattr(Product, sort_by)
    if sort_dir == "desc":
        query = query.order_by(col.desc())
    else:
        query = query.order_by(col.asc())

    # Pagination
    offset = (page - 1) * limit
    return query.offset(offset).limit(limit).all()

@router.get("/count", response_model=int)
def get_products_count(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_viewer)
):
    """
    Returns total count of products matching search & category filters.
    """
    query = db.query(Product)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.like(search_filter),
                Product.sku.like(search_filter)
            )
        )
    if category_id:
        query = query.filter(Product.category_id == category_id)
    return query.count()

@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product(product_id: int, db: Session = Depends(get_db), current_user=Depends(require_viewer)):
    """
    Retrieves a single product by its ID.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate, 
    db: Session = Depends(get_db), 
    current_user=Depends(require_manager)
):
    """
    Creates a new product (Manager or Admin required).
    """
    # Check if SKU already exists
    existing = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")
        
    # Check category
    cat = db.query(Category).filter(Category.id == product_in.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Invalid category ID")

    new_product = Product(**product_in.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager)
):
    """
    Updates a product's fields (Manager or Admin required).
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_in.model_dump(exclude_unset=True)
    
    if "sku" in update_data and update_data["sku"] != product.sku:
        existing = db.query(Product).filter(Product.sku == update_data["sku"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="SKU already exists")
            
    if "category_id" in update_data and update_data["category_id"] != product.category_id:
        cat = db.query(Category).filter(Category.id == update_data["category_id"]).first()
        if not cat:
            raise HTTPException(status_code=400, detail="Invalid category ID")

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    """
    Deletes a product by ID (Admin only).
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return None
