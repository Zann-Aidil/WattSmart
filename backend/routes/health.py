"""Health & model-info endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from backend.config import get_settings
from backend.schemas import HealthResponse, ModelInfoResponse
from backend.services.prediction_service import get_predictor, get_training_report


router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse, summary="Liveness probe")
async def health() -> HealthResponse:
    settings = get_settings()
    model_ok = True
    try:
        get_predictor()
    except Exception:
        model_ok = False
    return HealthResponse(
        status="ok" if model_ok else "degraded",
        app=settings.app_name,
        version=settings.app_version,
        model_loaded=model_ok,
    )


@router.get("/model-info", response_model=ModelInfoResponse, summary="Model metadata")
async def model_info() -> ModelInfoResponse:
    settings = get_settings()
    predictor = get_predictor()
    report = get_training_report()

    metrics = report.get("models", {}).get(report.get("best_model", "XGBoost"), {})

    return ModelInfoResponse(
        app=settings.app_name,
        version=settings.app_version,
        model_name=report.get("best_model", "XGBoost"),
        trained_at=report.get("trained_at"),
        feature_count=len(predictor.feature_names),
        feature_names=predictor.feature_names,
        metrics=metrics,
        target_met=report.get("best_model_target_met"),
    )
