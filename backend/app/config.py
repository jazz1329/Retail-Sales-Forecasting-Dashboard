import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Retail Sales Forecasting Dashboard API"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    
    # Security & Authentication
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super_secret_retail_forecast_dashboard_key_2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    # Database
    # Default is SQLite for easy local dev, but overridden by DATABASE_URL (e.g. MySQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./retail.db"
    )
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Upload Settings
    UPLOAD_DIR: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
        "uploads"
    )
    
    model_config = {
        "case_sensitive": True
    }

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
