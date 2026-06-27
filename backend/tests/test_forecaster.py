import pandas as pd
import numpy as np
from app.forecaster import RetailForecaster

def test_feature_engineering_transforms(db_session):
    forecaster = RetailForecaster(db_session)
    
    # Create mock aggregated sales dataframe
    df = pd.DataFrame([
        {"date": "2024-01-01", "product_id": 1, "store_id": 1, "sales": 10.0},
        {"date": "2024-01-02", "product_id": 1, "store_id": 1, "sales": 12.0},
        {"date": "2024-01-06", "product_id": 1, "store_id": 1, "sales": 15.0}, # Saturday
    ])
    df["date"] = pd.to_datetime(df["date"])
    
    df_feats = forecaster.engineer_features(df)
    
    # Assert temporal features are created
    assert "day_of_week" in df_feats.columns
    assert "month" in df_feats.columns
    assert "is_weekend" in df_feats.columns
    assert "sin_month" in df_feats.columns
    assert "cos_month" in df_feats.columns
    
    # Verify is_weekend flag values (Jan 6 2024 is Saturday -> weekend)
    assert df_feats.loc[df_feats["date"] == "2024-01-06", "is_weekend"].values[0] == 1
    assert df_feats.loc[df_feats["date"] == "2024-01-01", "is_weekend"].values[0] == 0
