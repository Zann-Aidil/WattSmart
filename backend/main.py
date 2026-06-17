"""SmartEnergy Predictor - FastAPI application entrypoint.

Run::

    uvicorn backend.main:app --reload --port 8000

Open the auto-generated API docs at::

    http://localhost:8000/docs       (Swagger UI)
    http://localhost:8000/redoc      (ReDoc)
"""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure repository root is on PYTHONPATH so `from ml.*` works regardless of
# the cwd from which uvicorn was launched.
_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import get_settings
from backend.routes import health, predict, recommend, auth, history
from backend.schemas import ErrorResponse
from backend.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

# Migrate existing tables — add columns that didn't exist before create_all
from sqlalchemy import text as _text
with engine.connect() as _conn:
    try:
        _conn.execute(_text("ALTER TABLE users ADD COLUMN email TEXT"))
        _conn.commit()
    except Exception:
        pass  # column already exists
from backend.utils.logger import get_logger, setup_logging


def create_app() -> FastAPI:
    settings = get_settings()
    setup_logging(level=settings.log_level)
    logger = get_logger("backend.main")

    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "API prediksi konsumsi listrik rumah tangga & UKM beserta rekomendasi "
            "efisiensi energi personal. Capstone PJK-GM096 (Pijak x IBM SkillsBuild)."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # ----- CORS -----
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ----- Request logger -----
    @application.middleware("http")
    async def log_requests(request: Request, call_next):
        response = await call_next(request)
        logger.info("%s %s -> %d", request.method, request.url.path, response.status_code)
        return response

    # ----- Routers -----
    application.include_router(health.router, prefix="/api")
    application.include_router(predict.router, prefix="/api")
    application.include_router(recommend.router, prefix="/api")
    application.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    application.include_router(history.router, prefix="/api")

    # ----- Root -----
    @application.get("/", include_in_schema=False)
    async def root():
        return {
            "app": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "endpoints": [
                "/api/health",
                "/api/model-info",
                "/api/predict",
                "/api/recommend",
                "/api/predict-with-recommendations",
            ],
        }

    # ----- Global exception handler (Pydantic validation, etc.) -----
    @application.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        return JSONResponse(
            status_code=400,
            content=ErrorResponse(error="ValidationError", detail=str(exc)).model_dump(),
        )

    return application


app = create_app()
