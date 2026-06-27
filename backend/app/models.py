from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(50), default="Viewer", nullable=False)  # Admin, Manager, Viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)

    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    price = Column(Float, nullable=False)  # Selling price
    cost = Column(Float, nullable=False)   # Purchase/Manufacturing cost
    sku = Column(String(50), unique=True, index=True, nullable=False)
    current_stock = Column(Integer, default=0, nullable=False)
    reorder_point = Column(Integer, default=10, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
    forecasts = relationship("Forecast", back_populates="product", cascade="all, delete-orphan")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    city = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)  # e.g., North, South, East, West
    segment = Column(String(50), default="Consumer")  # Consumer, Corporate, Home Office
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    city = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)

    orders = relationship("Order", back_populates="store", cascade="all, delete-orphan")
    forecasts = relationship("Forecast", back_populates="store", cascade="all, delete-orphan")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    order_date = Column(DateTime(timezone=True), nullable=False, index=True)
    total_amount = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), default="Completed", nullable=False)  # Completed, Pending, Cancelled

    customer = relationship("Customer", back_populates="orders")
    store = relationship("Store", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    forecast_date = Column(Date, nullable=False, index=True)
    predicted_sales = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=True)
    upper_bound = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="forecasts")
    store = relationship("Store", back_populates="forecasts")

    # Add unique constraint to avoid double forecasting same product/store/date
    __table_args__ = (
        UniqueConstraint('product_id', 'store_id', 'forecast_date', name='uix_prod_store_date'),
    )

class ForecastEvaluation(Base):
    __tablename__ = "forecast_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    training_date = Column(DateTime(timezone=True), server_default=func.now())
    mae = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    r2 = Column(Float, nullable=False)
    horizon_days = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
