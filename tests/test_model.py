"""Tests for `ml.evaluate` and the trained model artifact (if present)."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pytest

from ml.evaluate import (
    RegressionMetrics,
    evaluate,
    format_metrics_table,
    mean_absolute_percentage_error,
)


def test_evaluate_returns_finite_metrics():
    rng = np.random.default_rng(0)
    y = rng.uniform(10, 30, size=100)
    y_hat = y + rng.normal(0, 0.5, size=100)
    m = evaluate(y, y_hat)
    assert isinstance(m, RegressionMetrics)
    assert m.mae > 0
    assert m.rmse >= m.mae
    assert 0.0 < m.r2 <= 1.0
    assert m.mape >= 0


def test_mape_avoids_division_by_zero():
    y = np.array([0.0, 0.0, 0.0])
    y_hat = np.array([0.01, 0.0, -0.01])
    val = mean_absolute_percentage_error(y, y_hat)
    assert np.isfinite(val)


def test_evaluate_perfect_predictions_give_r2_one():
    y = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
    m = evaluate(y, y.copy())
    assert m.mae == pytest.approx(0.0)
    assert m.rmse == pytest.approx(0.0)
    assert m.r2 == pytest.approx(1.0)


def test_metrics_to_dict_roundtrip():
    m = RegressionMetrics(mae=1.234567, rmse=2.345678, r2=0.91234, mape=4.567)
    d = m.to_dict()
    assert d == {"mae": 1.2346, "rmse": 2.3457, "r2": 0.9123, "mape": 4.567}


def test_format_table_renders_all_rows():
    metrics = {
        "XGBoost": RegressionMetrics(1, 2, 0.9, 5),
        "RandomForest": RegressionMetrics(1.5, 2.5, 0.88, 6),
    }
    txt = format_metrics_table(metrics)
    assert "XGBoost" in txt and "RandomForest" in txt


@pytest.mark.skipif(
    not Path("ml/models/xgboost_model.pkl").exists(),
    reason="Model artifact not trained yet - run `python ml/train.py` first.",
)
def test_trained_model_inference_smoke():
    """If the model has been trained, ensure inference works end-to-end."""
    from ml.predict import EnergyPredictor

    predictor = EnergyPredictor()
    result = predictor.predict(
        tanggal="2025-05-12",
        jam=19,
        suhu_celsius=30.0,
        hari_libur=0,
        jumlah_penghuni=4,
        jumlah_perangkat_aktif=10,
        jam_penggunaan_rata_rata=8.0,
        history_kwh=[17.0, 18.0, 17.5, 18.5, 17.0, 18.0, 17.5],
    )
    assert 0 < result.predicted_kwh < 100
