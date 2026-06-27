from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, date

# ----------------- AUTH & USER SCHEMAS -----------------

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = Field(default="Viewer", description="Viewer, Manager, Admin")

class UserCreate(UserBase):
    password: str = Field(min_length=6, description="Password must be at least 6 characters")

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# ----------------- CATEGORY SCHEMAS -----------------

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# ----------------- PRODUCT SCHEMAS -----------------

class ProductBase(BaseModel):
    name: str
    category_id: int
    price: float = Field(gt=0)
    cost: float = Field(gt=0)
    sku: str
    current_stock: int = Field(ge=0)
    reorder_point: int = Field(ge=0)
    description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    sku: Optional[str] = None
    current_stock: Optional[int] = None
    reorder_point: Optional[int] = None
    description: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProductDetailResponse(ProductResponse):
    category: CategoryResponse

    model_config = ConfigDict(from_attributes=True)

# ----------------- CUSTOMER SCHEMAS -----------------

class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    city: str
    region: str
    segment: str = Field(default="Consumer", description="Consumer, Corporate, Home Office")

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- STORE SCHEMAS -----------------

class StoreBase(BaseModel):
    name: str
    city: str
    region: str

class StoreCreate(StoreBase):
    pass

class StoreResponse(StoreBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# ----------------- ORDER & ORDER ITEM SCHEMAS -----------------

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_price: float = Field(gt=0)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    product: ProductResponse

    model_config = ConfigDict(from_attributes=True)

class OrderBase(BaseModel):
    customer_id: int
    store_id: int
    order_date: datetime
    status: str = Field(default="Completed")

class OrderCreate(BaseModel):
    customer_id: int
    store_id: int
    order_date: datetime
    items: List[OrderItemCreate]

class OrderResponse(OrderBase):
    id: int
    total_amount: float

    model_config = ConfigDict(from_attributes=True)

class OrderDetailResponse(OrderResponse):
    customer: CustomerResponse
    store: StoreResponse
    order_items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)

# ----------------- INVENTORY SCHEMAS -----------------

class InventoryStatus(BaseModel):
    total_products: int
    total_stock: int
    stock_value: float
    potential_revenue: float
    reorder_warnings_count: int
    low_stock_items: List[ProductResponse]

# ----------------- FORECAST SCHEMAS -----------------

class ForecastBase(BaseModel):
    product_id: int
    store_id: int
    forecast_date: date
    predicted_sales: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None

class ForecastResponse(ForecastBase):
    id: int
    created_at: datetime
    product_name: Optional[str] = None
    store_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ForecastRequest(BaseModel):
    horizon_days: int = Field(default=90, description="Forecast horizon in days: 30, 90, 180, 365")
    retrain_model: bool = Field(default=False, description="Trigger model retraining before forecasting")

class ForecastEvaluationResponse(BaseModel):
    id: int
    model_name: str
    training_date: datetime
    mae: float
    rmse: float
    r2: float
    horizon_days: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

# ----------------- DASHBOARD & ANALYTICS SCHEMAS -----------------

class KPIOverview(BaseModel):
    total_sales: float
    total_revenue: float
    total_orders: int
    total_customers: int
    avg_order_value: float
    profit_margin_pct: float
    growth_pct: float

class TrendPoint(BaseModel):
    date: str
    sales: float
    revenue: float
    profit: float

class TopEntitySales(BaseModel):
    name: str
    value: float
    percentage: Optional[float] = None

class DashboardCharts(BaseModel):
    sales_trend: List[TrendPoint]
    top_products: List[TopEntitySales]
    top_categories: List[TopEntitySales]
    top_cities: List[TopEntitySales]
    top_regions: List[TopEntitySales]
    top_customers: List[TopEntitySales]
