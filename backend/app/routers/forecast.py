from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.models import Forecast, ForecastEvaluation, Order, OrderItem, Product, Store
from app.schemas import ForecastResponse, ForecastEvaluationResponse, ForecastRequest
from app.forecaster import RetailForecaster
from app.auth import require_viewer, require_manager

router = APIRouter(prefix="/forecast", tags=["Forecasting"])

@router.get("", response_model=List[ForecastResponse])
def get_forecasts(
    store_id: Optional[int] = None,
    product_id: Optional[int] = None,
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user=Depends(require_viewer)
):
    """
    Returns predictions from the forecast table with optional store/product filters.
    """
    query = db.query(
        Forecast.id,
        Forecast.product_id,
        Forecast.store_id,
        Forecast.forecast_date,
        Forecast.predicted_sales,
        Forecast.lower_bound,
        Forecast.upper_bound,
        Forecast.created_at,
        Product.name.label("product_name"),
        Store.name.label("store_name")
    ).join(Product, Forecast.product_id == Product.id)\
     .join(Store, Forecast.store_id == Store.id)

    if store_id:
        query = query.filter(Forecast.store_id == store_id)
    if product_id:
        query = query.filter(Forecast.product_id == product_id)

    # Order by date
    results = query.order_by(Forecast.forecast_date.asc()).limit(limit).all()
    
    return [
        ForecastResponse(
            id=r.id,
            product_id=r.product_id,
            store_id=r.store_id,
            forecast_date=r.forecast_date,
            predicted_sales=r.predicted_sales,
            lower_bound=r.lower_bound,
            upper_bound=r.upper_bound,
            created_at=r.created_at,
            product_name=r.product_name,
            store_name=r.store_name
        ) for r in results
    ]

@router.get("/metrics", response_model=ForecastEvaluationResponse)
def get_forecast_metrics(db: Session = Depends(get_db), current_user=Depends(require_viewer)):
    """
    Returns the performance metrics of the active trained machine learning model.
    """
    metrics = db.query(ForecastEvaluation).filter(ForecastEvaluation.is_active == True).order_by(ForecastEvaluation.training_date.desc()).first()
    if not metrics:
        raise HTTPException(status_code=404, detail="No active forecast metrics found. Train the model first.")
    return metrics

@router.post("/retrain", status_code=status.HTTP_200_OK)
def retrain_model(
    req: ForecastRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager)
):
    """
    Triggers model retraining (Manager or Admin required) and generates new forecasts.
    """
    forecaster = RetailForecaster(db)
    result = forecaster.run_pipeline(horizon_days=req.horizon_days)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forecasting pipeline failure: {result.get('error')}"
        )
    return {
        "message": "Model retrained and forecasts updated successfully.",
        "metrics": result["metrics"],
        "forecasts_count": result["forecasts_count"]
    }

@router.get("/chart", response_model=List[Dict[str, Any]])
def get_forecast_chart_data(
    store_id: Optional[int] = None,
    product_id: Optional[int] = None,
    history_days: int = Query(default=120, ge=30, le=365),
    db: Session = Depends(get_db),
    current_user=Depends(require_viewer)
):
    """
    Combines historical sales and future forecasts on a single chronological timeline for charts.
    """
    # 1. Fetch History
    # Get max date in DB to represent 'today' for demo datasets
    max_date_row = db.query(func.max(Order.order_date)).first()
    max_date = max_date_row[0] if max_date_row and max_date_row[0] else datetime.now()
    if isinstance(max_date, str):
        max_date = datetime.fromisoformat(max_date)
        
    start_history = max_date - timedelta(days=history_days)
    
    hist_query = db.query(
        func.date(Order.order_date).label("date_val"),
        func.sum(OrderItem.quantity).label("actual_sales")
    ).join(OrderItem, Order.id == OrderItem.order_id)\
     .filter(Order.status == "Completed", Order.order_date >= start_history, Order.order_date <= max_date)
     
    if store_id:
        hist_query = hist_query.filter(Order.store_id == store_id)
    if product_id:
        hist_query = hist_query.filter(OrderItem.product_id == product_id)
        
    hist_results = hist_query.group_by(func.date(Order.order_date)).order_by("date_val").all()
    
    chart_data = []
    # Add historical points
    for r in hist_results:
        dt = r.date_val
        if isinstance(dt, str):
            dt = date.fromisoformat(dt)
        chart_data.append({
            "date": dt.isoformat(),
            "actual": float(r.actual_sales or 0.0),
            "predicted": None,
            "lower": None,
            "upper": None
        })
        
    # 2. Fetch Forecasts
    fore_query = db.query(
        Forecast.forecast_date,
        func.sum(Forecast.predicted_sales).label("predicted_sales"),
        func.sum(Forecast.lower_bound).label("lower_bound"),
        func.sum(Forecast.upper_bound).label("upper_bound")
    )
    
    if store_id:
        fore_query = fore_query.filter(Forecast.store_id == store_id)
    if product_id:
        fore_query = fore_query.filter(Forecast.product_id == product_id)
        
    fore_results = fore_query.group_by(Forecast.forecast_date).order_by(Forecast.forecast_date.asc()).all()
    
    # Add forecast points
    for r in fore_results:
        chart_data.append({
            "date": r.forecast_date.isoformat(),
            "actual": None,
            "predicted": float(r.predicted_sales or 0.0),
            "lower": float(r.lower_bound or 0.0),
            "upper": float(r.upper_bound or 0.0)
        })
        
    return chart_data
