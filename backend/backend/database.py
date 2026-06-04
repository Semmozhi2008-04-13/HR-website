# backend/database.py
import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Expect asyncpg URL, e.g.
# postgresql+asyncpg://user:pass@localhost:5432/sfrs_db
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://username:password@localhost:5432/sfrs_db",
)

# Async engine with connection pooling
engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
    max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "10")),
    pool_timeout=int(os.getenv("DB_POOL_TIMEOUT", "30")),
    pool_recycle=int(os.getenv("DB_POOL_RECYCLE", "1800")),
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

# Dependency to yield a database session per request safely
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            # session is closed by async context manager
            pass


