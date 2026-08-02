from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import sessionmanager
from app.core.redis import init_redis, close_redis
from app.core.exceptions import setup_exception_handlers
from app.api.v1.health import router as health_router
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
    title="DevForge AI API",
    version="1.0.0",
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

# Routers
app.include_router(health_router, prefix=f"{settings.API_V1_PREFIX}/health", tags=["Health"])
