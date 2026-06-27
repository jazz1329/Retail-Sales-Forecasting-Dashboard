
import logging
import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import (
    auth,
    dashboard,
    products,
    customers,
    orders,
    inventory,
    forecast,
    data,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()],
)

logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Performing application startup initializations...")

    from app.database import Base, engine, SessionLocal

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Schema tables created/verified successfully.")
    except Exception as e:
        logger.error(
            f"Failed to create schema tables on startup: {e}",
            exc_info=True,
        )

    db = SessionLocal()

    try:
        from app.models import User, Product

        user_count = db.query(User).count()
        product_count = db.query(Product).count()

        if user_count == 0 or product_count == 0:
            logger.info("Database is empty. Launching automated seeding process...")

            project_root = os.path.abspath(
                os.path.join(os.path.dirname(__file__), "../../")
            )

            if project_root not in sys.path:
                sys.path.append(project_root)

            from database.db_init import seed_database

            seed_database(db)

            logger.info("Automatic database seeding completed.")
        else:
            logger.info(
                f"Database contains existing data ({user_count} users, {product_count} products). Skipping seeding."
            )

    except Exception as e:
        logger.error(
            f"Error during auto-seeder execution: {e}",
            exc_info=True,
        )

    finally:
        db.close()

    yield

    logger.info("Shutting down application web server...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Production-quality REST API for the Retail Sales Forecasting SaaS Dashboard.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Global exception caught on request {request.url.path}: {exc}",
        exc_info=True,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected server error occurred. Please contact the administrator."
        },
    )


app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(customers.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(forecast.router, prefix=settings.API_V1_STR)
app.include_router(data.router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health Check"])
def health_check():
    return {
        "status": "online",
        "app_name": settings.APP_NAME,
        "version": "1.0.0",
    }

