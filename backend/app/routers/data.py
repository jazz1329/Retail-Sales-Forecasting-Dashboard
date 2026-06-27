from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd
import io
import os
from datetime import datetime
from typing import List, Dict, Any

from app.database import get_db
from app.models import Product, Customer, Category, Order, OrderItem
from app.auth import require_manager, require_viewer
from app.config import settings

router = APIRouter(prefix="/data", tags=["Data Import/Export"])

@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_file(
    type: str = Query(..., pattern="^(products|customers)$"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_manager)
):
    """
    Parses and imports products or customers from a uploaded CSV or Excel file (Manager or Admin required).
    """
    contents = await file.read()
    filename = file.filename or "upload"
    
    # Identify format
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a CSV or Excel (.xlsx) file.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    imported_count = 0
    errors = []

    # 1. Product Upload
    if type == "products":
        required_cols = ["name", "category_name", "price", "cost", "sku", "current_stock", "reorder_point"]
        # Standardize columns
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing required columns in sheet: {', '.join(missing)}")
            
        for idx, row in df.iterrows():
            try:
                sku_val = str(row["sku"]).strip()
                # Check SKU
                existing = db.query(Product).filter(Product.sku == sku_val).first()
                if existing:
                    errors.append(f"Row {idx + 1}: SKU '{sku_val}' already exists. Skipped.")
                    continue
                
                # Check Category, create if not exists
                cat_name = str(row["category_name"]).strip()
                category = db.query(Category).filter(Category.name == cat_name).first()
                if not category:
                    category = Category(name=cat_name, description=f"Imported category: {cat_name}")
                    db.add(category)
                    db.commit()
                    db.refresh(category)
                
                new_prod = Product(
                    name=str(row["name"]).strip(),
                    category_id=category.id,
                    price=float(row["price"]),
                    cost=float(row["cost"]),
                    sku=sku_val,
                    current_stock=int(row["current_stock"]),
                    reorder_point=int(row["reorder_point"]),
                    description=str(row.get("description", "")) if pd.notnull(row.get("description")) else None
                )
                db.add(new_prod)
                imported_count += 1
            except Exception as ex:
                errors.append(f"Row {idx + 1}: Error - {str(ex)}")
                
        db.commit()

    # 2. Customer Upload
    elif type == "customers":
        required_cols = ["name", "email", "city", "region", "segment"]
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing required columns in sheet: {', '.join(missing)}")
            
        for idx, row in df.iterrows():
            try:
                email_val = str(row["email"]).strip()
                existing = db.query(Customer).filter(Customer.email == email_val).first()
                if existing:
                    errors.append(f"Row {idx + 1}: Email '{email_val}' already exists. Skipped.")
                    continue
                
                new_cust = Customer(
                    name=str(row["name"]).strip(),
                    email=email_val,
                    city=str(row["city"]).strip(),
                    region=str(row["region"]).strip(),
                    segment=str(row["segment"]).strip()
                )
                db.add(new_cust)
                imported_count += 1
            except Exception as ex:
                errors.append(f"Row {idx + 1}: Error - {str(ex)}")
                
        db.commit()

    return {
        "success": True,
        "filename": filename,
        "imported_records": imported_count,
        "errors": errors
    }

@router.get("/export/orders", response_class=StreamingResponse)
def export_orders_csv(db: Session = Depends(get_db), current_user=Depends(require_viewer)):
    """
    Streams all completed orders and details as a CSV file.
    """
    # Fetch orders
    orders = db.query(Order).order_by(Order.order_date.desc()).all()
    
    # Construct CSV in-memory
    output = io.StringIO()
    # CSV Header
    output.write("Order ID,Customer Name,Customer Email,Store Name,Order Date,Status,Quantity,Product Name,SKU,Unit Price,Total Amount\n")
    
    for order in orders:
        cust_name = order.customer.name.replace('"', '""')
        cust_email = order.customer.email
        store_name = order.store.name.replace('"', '""')
        ord_date = order.order_date.strftime("%Y-%m-%d %H:%M:%S")
        status_val = order.status
        total_amt = order.total_amount
        
        for item in order.order_items:
            prod_name = item.product.name.replace('"', '""')
            sku_val = item.product.sku
            qty = item.quantity
            u_price = item.unit_price
            
            row = f'{order.id},"{cust_name}",{cust_email},"{store_name}",{ord_date},{status_val},{qty},"{prod_name}",{sku_val},{u_price},{total_amt}\n'
            output.write(row)
            
    # Reset stream pointer
    output.seek(0)
    
    # Stream response
    response = StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")), 
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = "attachment; filename=retail_orders_export.csv"
    return response
