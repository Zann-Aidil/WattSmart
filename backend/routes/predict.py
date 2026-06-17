"""Prediction endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.deps import get_current_user, get_db
from backend.models import User, PredictionHistory

from backend.schemas import (
    PredictionInput,
    PredictionResponse,
    PredictionWithRecommendationsResponse,
)
from backend.services.prediction_service import predict_consumption
from backend.services.recommendation_service import build_recommendations
from backend.utils.logger import get_logger


router = APIRouter(tags=["predict"])
_logger = get_logger(__name__)


def _save_prediction_history(
    db: Session,
    user: User,
    payload: PredictionInput,
    result: PredictionResponse,
) -> PredictionHistory:
    """Persist a prediction result to the user's history."""
    history = PredictionHistory(
        user_id=user.id,
        tanggal=payload.tanggal.isoformat(),
        jam=payload.jam,
        suhu=payload.suhu_celsius,
        penghuni=payload.jumlah_penghuni,
        perangkat_aktif=payload.jumlah_perangkat_aktif,
        jam_pemakaian=payload.jam_penggunaan_rata_rata,
        is_holiday=bool(payload.hari_libur),
        is_weekend=payload.tanggal.weekday() >= 5,
        pred_kwh=result.prediksi_kwh,
        est_biaya=result.estimasi_biaya_rp,
        kategori=result.kategori_konsumsi,
        created_at=datetime.now(timezone.utc),
    )
    db.add(history)
    db.commit()
    return history


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Prediksi konsumsi listrik harian (kWh)",
)
async def predict(
    payload: PredictionInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> PredictionResponse:
    try:
        result = predict_consumption(payload)
        _save_prediction_history(db, current_user, payload, result)

        _logger.info(
            "predict ok tanggal=%s suhu=%.1f penghuni=%d -> %.2f kWh",
            payload.tanggal, payload.suhu_celsius, payload.jumlah_penghuni, result.prediksi_kwh,
        )
        return result
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=f"Model belum di-training: {exc}") from exc
    except Exception as exc:
        _logger.exception("predict failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Gagal melakukan prediksi: {exc}") from exc


@router.post(
    "/predict-with-recommendations",
    response_model=PredictionWithRecommendationsResponse,
    summary="Prediksi + rekomendasi efisiensi (one-shot)",
)
async def predict_with_recommendations(
    payload: PredictionInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> PredictionWithRecommendationsResponse:
    try:
        prediksi = predict_consumption(payload)
        rekomendasi = build_recommendations(payload, predicted_kwh=prediksi.prediksi_kwh)
        _save_prediction_history(db, current_user, payload, prediksi)

        return PredictionWithRecommendationsResponse(prediksi=prediksi, rekomendasi=rekomendasi)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=f"Model belum di-training: {exc}") from exc
    except Exception as exc:
        _logger.exception("predict-with-recommendations failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Gagal: {exc}") from exc
