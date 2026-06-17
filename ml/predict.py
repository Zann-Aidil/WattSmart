"""Inference wrapper around the trained XGBoost model.

Loads the persisted preprocessing pipeline + model and exposes a single
`predict()` function that the FastAPI backend (and any CLI scripts) consume.
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

# Ensure repository root is importable when this file runs as a script.
_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

import joblib
import numpy as np
import pandas as pd

from ml.preprocessing import PreprocessingPipeline, build_inference_frame


DEFAULT_MODEL_PATH = Path("ml/models/xgboost_model.pkl")
DEFAULT_SCALER_PATH = Path("ml/models/scaler.pkl")
DEFAULT_FEATURE_NAMES_PATH = Path("ml/models/feature_names.json")


@dataclass
class PredictionResult:
    """Result returned by :func:`predict`."""

    predicted_kwh: float
    feature_frame: pd.DataFrame  # post-scaling, useful for debugging


class EnergyPredictor:
    """Thin object wrapping the model + pipeline.

    Instantiate once at app startup, call :meth:`predict` per request.
    """

    def __init__(
        self,
        model_path: str | Path = DEFAULT_MODEL_PATH,
        scaler_path: str | Path = DEFAULT_SCALER_PATH,
        feature_names_path: str | Path = DEFAULT_FEATURE_NAMES_PATH,
    ) -> None:
        self.model_path = Path(model_path)
        self.scaler_path = Path(scaler_path)
        self.feature_names_path = Path(feature_names_path)
        self.model = joblib.load(self.model_path)
        self.pipeline: PreprocessingPipeline = joblib.load(self.scaler_path)
        with self.feature_names_path.open("r", encoding="utf-8") as fh:
            self.feature_names: list[str] = json.load(fh)

    def predict(
        self,
        *,
        tanggal: str | pd.Timestamp,
        jam: int,
        suhu_celsius: float,
        hari_libur: int,
        jumlah_penghuni: int,
        jumlah_perangkat_aktif: int,
        jam_penggunaan_rata_rata: float,
        history_kwh: Sequence[float] | None = None,
    ) -> PredictionResult:
        df = build_inference_frame(
            tanggal=tanggal,
            jam=jam,
            suhu_celsius=suhu_celsius,
            hari_libur=hari_libur,
            jumlah_penghuni=jumlah_penghuni,
            jumlah_perangkat_aktif=jumlah_perangkat_aktif,
            jam_penggunaan_rata_rata=jam_penggunaan_rata_rata,
            history_kwh=history_kwh,
        )
        X = self.pipeline.transform(df)
        y_hat = float(self.model.predict(X.values)[0])
        # Clamp - consumption cannot be negative.
        y_hat = max(0.0, y_hat)
        return PredictionResult(predicted_kwh=y_hat, feature_frame=X)


def predict_one(**kwargs) -> float:
    """Convenience wrapper for ad-hoc CLI use."""
    predictor = EnergyPredictor()
    return predictor.predict(**kwargs).predicted_kwh


if __name__ == "__main__":
    # Smoke test against a saved model.
    result = predict_one(
        tanggal="2025-01-15",
        jam=19,
        suhu_celsius=31.0,
        hari_libur=0,
        jumlah_penghuni=4,
        jumlah_perangkat_aktif=8,
        jam_penggunaan_rata_rata=9.0,
        history_kwh=[18.2, 17.9, 19.1, 21.0, 18.5, 19.4, 20.0],
    )
    print(f"Predicted kWh: {result:.3f}")
