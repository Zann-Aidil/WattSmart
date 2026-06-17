"""Glue between the FastAPI layer and the trained model."""

from __future__ import annotations

import json
import threading
from pathlib import Path

from backend.config import get_settings
from backend.schemas import PredictionInput, PredictionResponse
from backend.services.cost_calculator import calculate_cost, classify_consumption, format_rupiah
from backend.utils.logger import get_logger
from ml.predict import EnergyPredictor


_logger = get_logger(__name__)
_predictor_lock = threading.Lock()
_predictor: EnergyPredictor | None = None
_training_report_cache: dict | None = None


def _load_predictor() -> EnergyPredictor:
    settings = get_settings()
    return EnergyPredictor(
        model_path=settings.resolve_path(settings.model_path),
        scaler_path=settings.resolve_path(settings.scaler_path),
        feature_names_path=settings.resolve_path(settings.feature_names_path),
    )


def get_predictor() -> EnergyPredictor:
    """Lazy, thread-safe access to a singleton predictor."""
    global _predictor
    if _predictor is None:
        with _predictor_lock:
            if _predictor is None:
                _logger.info("Loading XGBoost model and preprocessing pipeline...")
                _predictor = _load_predictor()
                _logger.info("Model loaded successfully (features=%d)", len(_predictor.feature_names))
    return _predictor


def get_training_report() -> dict:
    global _training_report_cache
    if _training_report_cache is None:
        path = Path(get_settings().training_report_path)
        if path.exists():
            with path.open("r", encoding="utf-8") as fh:
                _training_report_cache = json.load(fh)
        else:
            _training_report_cache = {}
    return _training_report_cache


def predict_consumption(payload: PredictionInput) -> PredictionResponse:
    settings = get_settings()
    predictor = get_predictor()

    history = list(payload.konsumsi_7_hari_terakhir or [])

    result = predictor.predict(
        tanggal=str(payload.tanggal),
        jam=payload.jam,
        suhu_celsius=payload.suhu_celsius,
        hari_libur=payload.hari_libur,
        jumlah_penghuni=payload.jumlah_penghuni,
        jumlah_perangkat_aktif=payload.jumlah_perangkat_aktif,
        jam_penggunaan_rata_rata=payload.jam_penggunaan_rata_rata,
        history_kwh=history if history else None,
    )

    kwh = round(result.predicted_kwh, 3)
    biaya = calculate_cost(kwh, settings.tariff_per_kwh)

    avg_hist = round(sum(history) / len(history), 3) if history else None

    return PredictionResponse(
        tanggal=payload.tanggal,
        prediksi_kwh=kwh,
        estimasi_biaya_rp=biaya,
        estimasi_biaya_rp_formatted=format_rupiah(biaya, symbol=settings.currency_symbol),
        kategori_konsumsi=classify_consumption(kwh),  # type: ignore[arg-type]
        tarif_per_kwh=settings.tariff_per_kwh,
        rata_rata_historis_kwh=avg_hist,
    )
