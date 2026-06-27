from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

# Configure engine arguments based on db type
engine_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    # MySQL tuning parameters
    engine_args["pool_pre_ping"] = True
    engine_args["pool_size"] = 10
    engine_args["max_overflow"] = 20

engine = create_engine(settings.DATABASE_URL, **engine_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    """
    Modern SQLAlchemy 2.x declarative base.
    """
    pass

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
