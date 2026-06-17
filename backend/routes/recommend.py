"""Standalone recommendation endpoint (when user already has a prediction)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.schemas import PredictionInput, RecommendationResponse
from backend.services.prediction_service import predict_consumption
from backend.services.recommendation_service import build_recommendations
from backend.utils.logger import get_logger


router = APIRouter(tags=["recommend"])
_logger = get_logger(__name__)


class RecommendInput(PredictionInput):
    """Same fields as PredictionInput, but `prediksi_kwh` is optional.

    If callers supply a prediction the engine uses it directly; otherwise we
    run the model first.
    """

    prediksi_kwh: float | None = Field(
        default=None, ge=0, le=500, description="Prediksi kWh manual (opsional). Jika kosong, model akan dijalankan."
    )


@router.post(
    "/recommend",
    response_model=RecommendationResponse,
    summary="Rekomendasi efisiensi energi berdasarkan input + prediksi",
)
async def recommend(payload: RecommendInput) -> RecommendationResponse:
    try:
        if payload.prediksi_kwh is None:
            kwh = predict_consumption(payload).prediksi_kwh
        else:
            kwh = float(payload.prediksi_kwh)
        return build_recommendations(payload, predicted_kwh=kwh)
    except Exception as exc:
        _logger.exception("recommend failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Gagal menghasilkan rekomendasi: {exc}") from exc
