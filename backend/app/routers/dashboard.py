from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import List, Optional

from app.database import get_db
from app.models import Order, OrderItem, Product, Category, Store, Customer
from app.schemas import KPIOverview, DashboardCharts, TrendPoint, TopEntitySales
from app.auth import require_viewer

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

def apply_filters(query, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None,
                  year: Optional[int] = None, month: Optional[int] = None, quarter: Optional[int] = None,
                  store_id: Optional[int] = None, region: Optional[str] = None, category_id: Optional[int] = None,
                  product_id: Optional[int] = None, customer_id: Optional[int] = None):
    """
    Applies common retail filters to any order-based SQLAlchemy query.
    """
    if start_date:
        query = query.filter(Order.order_date >= start_date)
    if end_date:
        query = query.filter(Order.order_date <= end_date)
    if year:
        query = query.filter(extract('year', Order.order_date) == year)
    if month:
        query = query.filter(extract('month', Order.order_date) == month)
    if quarter:
        # Q1: 1-3, Q2: 4-6, Q3: 7-9, Q4: 10-12
        if quarter == 1:
            query = query.filter(extract('month', Order.order_date).in_([1, 2, 3]))
        elif quarter == 2:
            query = query.filter(extract('month', Order.order_date).in_([4, 5, 6]))
        elif quarter == 3:
            query = query.filter(extract('month', Order.order_date).in_([7, 8, 9]))
        elif quarter == 4:
            query = query.filter(extract('month', Order.order_date).in_([10, 11, 12]))
            
    if store_id:
        query = query.filter(Order.store_id == store_id)
    if region:
        query = query.join(Store, Order.store_id == Store.id).filter(Store.region == region)
    if category_id:
        # If not joined already, join items and products
        query = query.join(OrderItem, Order.id == OrderItem.order_id)\
                     .join(Product, OrderItem.product_id == Product.id)\
                     .filter(Product.category_id == category_id)
    elif product_id:
        query = query.join(OrderItem, Order.id == OrderItem.order_id)\
                     .filter(OrderItem.product_id == product_id)
                     
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
        
    return query

@router.get("/kpis", response_model=KPIOverview)
def get_kpis(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    quarter: Optional[int] = None,
    store_id: Optional[int] = None,
    region: Optional[str] = None,
    category_id: Optional[int] = None,
    product_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_viewer)
):
    """
    Returns high-level SaaS KPIs for retail operations with dynamic filtering.
    """
    # Base query for Completed orders
    order_query = db.query(Order).filter(Order.status == "Completed")
    order_query = apply_filters(
        order_query, start_date, end_date, year, month, quarter, 
        store_id, region, category_id, product_id, customer_id
    )
    
    # Calculate Total Revenue & Total Orders
    order_stats = order_query.with_entities(
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("orders_count")
    ).first()
    
    total_revenue = float(order_stats.revenue or 0.0)
    total_orders = int(order_stats.orders_count or 0)
    
    # Calculate Total Sales (units sold) & Total Cost
    item_query = db.query(OrderItem).join(Order, OrderItem.order_id == Order.id).filter(Order.status == "Completed")
    item_query = apply_filters(
        item_query, start_date, end_date, year, month, quarter, 
        store_id, region, category_id, product_id, customer_id
    )
    
    sales_stats = item_query.join(Product, OrderItem.product_id == Product.id).with_entities(
        func.sum(OrderItem.quantity).label("units_sold"),
        func.sum(OrderItem.quantity * Product.cost).label("total_cost")
    ).first()
    
    total_sales = int(sales_stats.units_sold or 0)
    total_cost = float(sales_stats.total_cost or 0.0)
    
    # Calculate Total Customers
    cust_query = db.query(Order.customer_id).filter(Order.status == "Completed").distinct()
    cust_query = apply_filters(
        cust_query, start_date, end_date, year, month, quarter, 
        store_id, region, category_id, product_id, customer_id
    )
    total_customers = cust_query.count()
    
    # Average Order Value
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0.0
    
    # Profit Margin %
    profit = total_revenue - total_cost
    profit_margin_pct = (profit / total_revenue) * 100 if total_revenue > 0 else 0.0
    
    # Calculate Growth % (Revenue in last 30 days vs previous 30 days)
    # Get max date in DB to represent the baseline 'today' for demo datasets
    max_date_row = db.query(func.max(Order.order_date)).first()
    max_date = max_date_row[0] if max_date_row and max_date_row[0] else datetime.now()
    
    period_1_start = max_date - timedelta(days=30)
    period_2_start = max_date - timedelta(days=60)
    
    rev_period_1 = db.query(func.sum(Order.total_amount))\
        .filter(Order.status == "Completed", Order.order_date >= period_1_start, Order.order_date <= max_date)
    # Apply standard filters (excluding date overrides)
    rev_period_1 = apply_filters(rev_period_1, store_id=store_id, region=region, category_id=category_id, product_id=product_id, customer_id=customer_id).scalar() or 0.0
    
    rev_period_2 = db.query(func.sum(Order.total_amount))\
        .filter(Order.status == "Completed", Order.order_date >= period_2_start, Order.order_date < period_1_start)
    rev_period_2 = apply_filters(rev_period_2, store_id=store_id, region=region, category_id=category_id, product_id=product_id, customer_id=customer_id).scalar() or 0.0
    
    if rev_period_2 > 0:
        growth_pct = ((rev_period_1 - rev_period_2) / rev_period_2) * 100
    else:
        growth_pct = 0.0
        
    return {
        "total_sales": total_sales,
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "avg_order_value": avg_order_value,
        "profit_margin_pct": profit_margin_pct,
        "growth_pct": growth_pct
    }

@router.get("/charts", response_model=DashboardCharts)
def get_charts(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    quarter: Optional[int] = None,
    store_id: Optional[int] = None,
    region: Optional[str] = None,
    category_id: Optional[int] = None,
    product_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_viewer)
):
    """
    Returns chart-friendly analytical breakdown data with dynamic filtering.
    """
    # 1. Sales, Revenue & Profit Trend (Monthly for the last 12 active months, or filtered period)
    # Let's group by Year-Month
    trend_query = db.query(
        func.strftime("%Y-%m", Order.order_date).label("month_str") if db.bind.dialect.name == "sqlite" 
        else func.date_format(Order.order_date, "%Y-%m").label("month_str"),
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("orders")
    ).filter(Order.status == "Completed")
    
    trend_query = apply_filters(
        trend_query, start_date, end_date, year, month, quarter, 
        store_id, region, category_id, product_id, customer_id
    )
    
    trend_results = trend_query.group_by("month_str").order_by("month_str").all()
    
    # Calculate costs to get profit trend
    # SQLite/MySQL queries for items to join costs
    trend_points = []
    for row in trend_results:
        month_label = row.month_str
        rev = float(row.revenue or 0.0)
        
        # Calculate cost for this specific month
        # Start and end datetimes for month
        try:
            m_date = datetime.strptime(month_label, "%Y-%m")
            next_m = (m_date.replace(day=28) + timedelta(days=4)).replace(day=1)
        except ValueError:
            m_date = datetime.now() - timedelta(days=30)
            next_m = datetime.now()
            
        cost_q = db.query(func.sum(OrderItem.quantity * Product.cost))\
            .join(Order, OrderItem.order_id == Order.id)\
            .join(Product, OrderItem.product_id == Product.id)\
            .filter(Order.status == "Completed", Order.order_date >= m_date, Order.order_date < next_m)
        cost_q = apply_filters(cost_q, store_id=store_id, region=region, category_id=category_id, product_id=product_id, customer_id=customer_id)
        cost = float(cost_q.scalar() or 0.0)
        
        profit = rev - cost
        trend_points.append(
            TrendPoint(
                date=month_label,
                sales=rev / 100,  # Proxy for volume metric or units
                revenue=rev,
                profit=profit
            )
        )
        
    # Limit to last 12 trend points if too many
    if len(trend_points) > 12 and not (start_date or year or quarter):
        trend_points = trend_points[-12:]

    # Helper for Entity Aggregation
    def get_top_entities(query_select, group_by_col, limit_val=5):
        q = db.query(query_select, func.sum(OrderItem.quantity * OrderItem.unit_price).label("sales_val"))\
              .join(OrderItem, Order.id == OrderItem.order_id)\
              .filter(Order.status == "Completed")
        q = apply_filters(q, start_date, end_date, year, month, quarter, store_id, region, category_id, product_id, customer_id)
        results = q.group_by(group_by_col).order_by(func.sum(OrderItem.quantity * OrderItem.unit_price).desc()).limit(limit_val).all()
        
        total_filtered_rev = sum(float(r[1] or 0.0) for r in results)
        entities = []
        for name, val in results:
            v = float(val or 0.0)
            pct = (v / total_filtered_rev * 100) if total_filtered_rev > 0 else 0.0
            entities.append(TopEntitySales(name=str(name), value=v, percentage=pct))
        return entities

    # 2. Top Products
    top_products = get_top_entities(Product.name, Product.name, 5)

    # 3. Top Categories
    top_categories = get_top_entities(Category.name, Category.name, 5)

    # 4. Top Cities (from Customers)
    top_cities = get_top_entities(Customer.city, Customer.city, 5)

    # 5. Top Regions (from Stores)
    top_regions = get_top_entities(Store.region, Store.region, 4)

    # 6. Top Customers
    top_customers = get_top_entities(Customer.name, Customer.name, 5)

    return {
        "sales_trend": trend_points,
        "top_products": top_products,
        "top_categories": top_categories,
        "top_cities": top_cities,
        "top_regions": top_regions,
        "top_customers": top_customers
    }
