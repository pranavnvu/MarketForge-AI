from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import sessionmanager
from app.core.redis import init_redis, close_redis
from app.core.exceptions import setup_exception_handlers
from app.api.v1 import api_v1_router
from app.middleware.logging import RequestLoggingMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize resources
    await init_redis()
    yield
    # Cleanup resources
    await close_redis()
    if sessionmanager.engine is not None:
        await sessionmanager.engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging Middleware
app.add_middleware(RequestLoggingMiddleware)

# Exception Handlers
setup_exception_handlers(app)

# Include API v1 router
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)
