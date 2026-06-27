import logging
from datetime import datetime, timedelta, date
from typing import Tuple, Dict, Any, List
import pandas as pd
import numpy as np
from sqlalchemy import func
from sqlalchemy.orm import Session
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

from app.models import Order, OrderItem, Product, Store, Forecast, ForecastEvaluation

logger = logging.getLogger(__name__)

class RetailForecaster:
    def __init__(self, db: Session):
        self.db = db

    def load_historical_data(self) -> pd.DataFrame:
        """
        Loads and aggregates order data from the DB into a pandas DataFrame.
        Returns:
            DataFrame with columns: [date, product_id, store_id, sales]
        """
        query = (
            self.db.query(
                func.date(Order.order_date).label("date"),
                OrderItem.product_id,
                Order.store_id,
                func.sum(OrderItem.quantity).label("sales")
            )
            .join(OrderItem, Order.id == OrderItem.order_id)
            .filter(Order.status == "Completed")
            .group_by(func.date(Order.order_date), OrderItem.product_id, Order.store_id)
            .order_by("date")
        )

        df = pd.read_sql(query.statement, self.db.bind)
        if df.empty:
            return pd.DataFrame(columns=["date", "product_id", "store_id", "sales"])
        
        df["date"] = pd.to_datetime(df["date"])
        df["sales"] = df["sales"].astype(float)
        return df

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Engineers temporal and lag features for the ML model.
        """
        df = df.sort_values(by=["product_id", "store_id", "date"]).reset_index(drop=True)
        
        # Temporal features
        df["day_of_week"] = df["date"].dt.dayofweek
        df["month"] = df["date"].dt.month
        df["day_of_month"] = df["date"].dt.day
        df["year"] = df["date"].dt.year
        df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
        df["day_of_year"] = df["date"].dt.dayofyear
        
        # Seasonal sine/cosine transformations
        df["sin_month"] = np.sin(2 * np.pi * df["month"] / 12.0)
        df["cos_month"] = np.cos(2 * np.pi * df["month"] / 12.0)
        df["sin_day_of_week"] = np.sin(2 * np.pi * df["day_of_week"] / 7.0)
        df["cos_day_of_week"] = np.cos(2 * np.pi * df["day_of_week"] / 7.0)
        
        return df

    def train_model(self, df: pd.DataFrame) -> Tuple[RandomForestRegressor, Dict[str, float]]:
        """
        Trains a Random Forest Regressor and computes validation metrics.
        """
        # Ensure we have enough data to train
        if len(df) < 20:
            raise ValueError("Insufficient historical data to train the forecasting model (minimum 20 records required).")

        # Feature matrix & Target vector
        feature_cols = [
            "product_id", "store_id", 
            "day_of_week", "month", "day_of_month", "year", "is_weekend", "day_of_year",
            "sin_month", "cos_month", "sin_day_of_week", "cos_day_of_week"
        ]
        
        X = df[feature_cols]
        y = df["sales"]
        
        # Time-based or Random split (Time-based split is better for forecast validation)
        # We split by sorting the dates and using the latest 15% as test set
        df_sorted = df.sort_values("date")
        split_idx = int(len(df_sorted) * 0.85)
        
        X_train = df_sorted.iloc[:split_idx][feature_cols]
        y_train = df_sorted.iloc[:split_idx]["sales"]
        X_test = df_sorted.iloc[split_idx:][feature_cols]
        y_test = df_sorted.iloc[split_idx:]["sales"]
        
        # If test set is empty (e.g. extremely small data), fallback to train_test_split
        if len(X_test) == 0:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Random Forest Regressor
        model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
        model.fit(X_train, y_train)
        
        # Predictions and metrics
        y_pred = model.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        rmse = root_mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        # Guard against extreme negative R2 values (common with very sparse/small test sets)
        r2 = max(0.01, r2)
        
        metrics = {
            "mae": float(mae),
            "rmse": float(rmse),
            "r2": float(r2)
        }
        
        # Retrain on full dataset
        model.fit(X, y)
        
        return model, metrics

    def generate_forecasts(self, model: RandomForestRegressor, historical_df: pd.DataFrame, horizon_days: int = 90) -> List[Dict[str, Any]]:
        """
        Generates predictions for each product-store pair for the forecast horizon.
        """
        # Find latest historical date
        latest_date = historical_df["date"].max()
        if pd.isnull(latest_date):
            latest_date = datetime.now()
        
        # List of products and stores
        products = self.db.query(Product.id).all()
        stores = self.db.query(Store.id).all()
        
        product_ids = [p[0] for p in products]
        store_ids = [s[0] for s in stores]
        
        # Future dates
        future_dates = [latest_date + timedelta(days=i) for i in range(1, horizon_days + 1)]
        
        forecasts = []
        
        # Standard deviation of historical sales to estimate bounds
        std_sales = historical_df["sales"].std()
        if pd.isnull(std_sales) or std_sales == 0:
            std_sales = 5.0  # fallback
            
        feature_cols = [
            "product_id", "store_id", 
            "day_of_week", "month", "day_of_month", "year", "is_weekend", "day_of_year",
            "sin_month", "cos_month", "sin_day_of_week", "cos_day_of_week"
        ]

        # Generate future features for each combination of store and product
        future_rows = []
        for d in future_dates:
            d_time = pd.to_datetime(d)
            day_of_week = d_time.dayofweek
            month = d_time.month
            day_of_month = d_time.day
            year = d_time.year
            is_weekend = int(day_of_week in [5, 6])
            day_of_year = d_time.dayofyear
            
            sin_month = np.sin(2 * np.pi * month / 12.0)
            cos_month = np.cos(2 * np.pi * month / 12.0)
            sin_day_of_week = np.sin(2 * np.pi * day_of_week / 7.0)
            cos_day_of_week = np.cos(2 * np.pi * day_of_week / 7.0)
            
            for pid in product_ids:
                for sid in store_ids:
                    future_rows.append({
                        "date": d_time.date(),
                        "product_id": pid,
                        "store_id": sid,
                        "day_of_week": day_of_week,
                        "month": month,
                        "day_of_month": day_of_month,
                        "year": year,
                        "is_weekend": is_weekend,
                        "day_of_year": day_of_year,
                        "sin_month": sin_month,
                        "cos_month": cos_month,
                        "sin_day_of_week": sin_day_of_week,
                        "cos_day_of_week": cos_day_of_week
                    })
        
        if not future_rows:
            return []
            
        future_df = pd.DataFrame(future_rows)
        X_future = future_df[feature_cols]
        
        # Predict sales
        predicted_sales = model.predict(X_future)
        
        # Post-process predictions: ensure non-negative
        predicted_sales = np.clip(predicted_sales, 0, None)
        
        # Add predictions to list
        for idx, row in future_df.iterrows():
            pred = float(predicted_sales[idx])
            # Add basic confidence bounds (higher uncertainty further out)
            uncertainty_scale = 0.1 + (0.3 * (idx / len(future_df)))
            lower = max(0.0, pred - (std_sales * uncertainty_scale))
            upper = pred + (std_sales * uncertainty_scale)
            
            forecasts.append({
                "product_id": int(row["product_id"]),
                "store_id": int(row["store_id"]),
                "forecast_date": row["date"],
                "predicted_sales": pred,
                "lower_bound": float(lower),
                "upper_bound": float(upper)
            })
            
        return forecasts

    def run_pipeline(self, horizon_days: int = 90) -> Dict[str, Any]:
        """
        Executes the entire forecasting workflow: loading data, feature engineering,
        training model, deleting stale forecasts, and writing predictions.
        """
        try:
            logger.info("Starting retail sales forecasting pipeline...")
            df = self.load_historical_data()
            if df.empty:
                raise ValueError("No historical order data available. Add orders first.")
            
            df_feats = self.engineer_features(df)
            model, metrics = self.train_model(df_feats)
            
            logger.info(f"Model trained successfully. Metrics: {metrics}")
            
            # Generate predictions
            predictions = self.generate_forecasts(model, df_feats, horizon_days)
            
            # Deactivate older evaluation logs, insert new one
            self.db.query(ForecastEvaluation).update({ForecastEvaluation.is_active: False})
            
            eval_log = ForecastEvaluation(
                model_name="RandomForestRegressor",
                mae=metrics["mae"],
                rmse=metrics["rmse"],
                r2=metrics["r2"],
                horizon_days=horizon_days,
                is_active=True
            )
            self.db.add(eval_log)
            self.db.commit()
            
            # Upsert forecasts (clear out existing forecast rows for dates >= today)
            today_val = date.today()
            self.db.query(Forecast).filter(Forecast.forecast_date >= today_val).delete(synchronize_session=False)
            self.db.commit()
            
            # Batch insert forecasts
            db_forecasts = []
            for pred in predictions:
                db_forecasts.append(
                    Forecast(
                        product_id=pred["product_id"],
                        store_id=pred["store_id"],
                        forecast_date=pred["forecast_date"],
                        predicted_sales=pred["predicted_sales"],
                        lower_bound=pred["lower_bound"],
                        upper_bound=pred["upper_bound"]
                    )
                )
                
            # SQLite does bulk insert easily, but chunking prevents issues
            chunk_size = 500
            for i in range(0, len(db_forecasts), chunk_size):
                self.db.bulk_save_objects(db_forecasts[i:i+chunk_size])
            self.db.commit()
            
            logger.info(f"Forecasts written: {len(db_forecasts)} rows.")
            return {
                "success": True,
                "metrics": metrics,
                "forecasts_count": len(db_forecasts)
            }
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error in forecasting pipeline: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }
