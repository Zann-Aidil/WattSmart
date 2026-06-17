"""Unit tests for `ml.preprocessing`."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from ml.preprocessing import (
    PreprocessingPipeline,
    TARGET_COL,
    add_calendar_features,
    add_interaction_features,
    add_lag_features,
    build_inference_frame,
    coerce_types,
    impute_missing,
    winsorize,
)


def _make_df(n: int = 50) -> pd.DataFrame:
    rng = np.random.default_rng(0)
    dates = pd.date_range("2025-01-01", periods=n, freq="D")
    df = pd.DataFrame(
        {
            "tanggal": dates,
            "jam": rng.integers(0, 24, n),
            "suhu_celsius": rng.normal(28, 2, n),
            "hari_libur": rng.integers(0, 2, n),
            "jumlah_penghuni": rng.integers(1, 7, n),
            "jumlah_perangkat_aktif": rng.integers(3, 16, n),
            "jam_penggunaan_rata_rata": rng.uniform(2, 14, n),
            "konsumsi_kwh": rng.uniform(8, 25, n),
        }
    )
    return df


def test_coerce_types_handles_string_dates():
    df = pd.DataFrame({"tanggal": ["2025-01-01", "not-a-date"], "suhu_celsius": ["28.0", "x"]})
    out = coerce_types(df)
    assert pd.api.types.is_datetime64_any_dtype(out["tanggal"])
    # invalid date became NaT, invalid float became NaN
    assert out["tanggal"].isna().sum() == 1
    assert out["suhu_celsius"].isna().sum() == 1


def test_impute_missing_uses_median_and_returns_learned():
    df = pd.DataFrame({"a": [1.0, 2.0, np.nan, 4.0], "b": [10.0, np.nan, 30.0, 40.0]})
    out, learned = impute_missing(df)
    assert out["a"].isna().sum() == 0
    assert out["b"].isna().sum() == 0
    assert learned["a"] == pytest.approx(2.0)
    assert learned["b"] == pytest.approx(30.0)


def test_impute_missing_reuses_supplied_medians():
    df = pd.DataFrame({"a": [np.nan, 5.0]})
    out, _ = impute_missing(df, medians={"a": 99.0})
    assert out["a"].iloc[0] == 99.0


def test_winsorize_clips_extremes_and_remembers_bounds():
    s = pd.DataFrame({"konsumsi_kwh": [10.0, 11.0, 12.0, 13.0, 14.0, 200.0]})
    out, bounds = winsorize(s, cols=["konsumsi_kwh"], k=1.5)
    assert out["konsumsi_kwh"].max() < 200.0
    lo, hi = bounds["konsumsi_kwh"]
    assert lo < hi
    # Applying the same bounds at "inference" is idempotent.
    out2, _ = winsorize(s, cols=["konsumsi_kwh"], bounds={"konsumsi_kwh": (lo, hi)})
    assert (out2["konsumsi_kwh"] == out["konsumsi_kwh"]).all()


def test_calendar_and_interaction_features():
    df = _make_df(7)
    out = add_calendar_features(df)
    for col in ("day_of_week", "month", "is_weekend", "quarter", "day_of_year"):
        assert col in out.columns
    out = add_interaction_features(out)
    assert "temp_x_appliances" in out.columns
    assert "occupants_x_hours" in out.columns


def test_lag_features_no_nans_after_fill():
    df = _make_df(30)
    out = add_lag_features(df)
    for c in ("lag_1", "lag_7", "roll_mean_7"):
        assert c in out.columns
        assert out[c].isna().sum() == 0


def test_pipeline_fit_transform_consistent_columns():
    df = _make_df(60)
    pipe = PreprocessingPipeline()
    X_train, y_train = pipe.fit_transform(df)
    assert y_train is not None
    assert len(pipe.feature_names) == X_train.shape[1]
    # Transform a fresh frame, columns must match.
    X_test = pipe.transform(df.head(5))
    assert list(X_test.columns) == pipe.feature_names
    # Target column must not leak into features.
    assert TARGET_COL not in pipe.feature_names


def test_pipeline_transform_before_fit_raises():
    with pytest.raises(RuntimeError):
        PreprocessingPipeline().transform(_make_df(5))


def test_build_inference_frame_shape_and_lags():
    df = build_inference_frame(
        tanggal="2025-05-12",
        jam=19,
        suhu_celsius=30.0,
        hari_libur=0,
        jumlah_penghuni=4,
        jumlah_perangkat_aktif=10,
        jam_penggunaan_rata_rata=8.0,
        history_kwh=[10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0],
    )
    assert len(df) == 1
    # lag_1 = most recent history, lag_7 = oldest in window
    assert df["lag_1"].iloc[0] == 16.0
    assert df["lag_7"].iloc[0] == 10.0
    # rolling mean of supplied window
    assert df["roll_mean_7"].iloc[0] == pytest.approx(13.0)


def test_build_inference_frame_handles_empty_history():
    df = build_inference_frame(
        tanggal="2025-05-12",
        jam=10,
        suhu_celsius=28.0,
        hari_libur=0,
        jumlah_penghuni=3,
        jumlah_perangkat_aktif=7,
        jam_penggunaan_rata_rata=6.0,
        history_kwh=None,
    )
    # Even with no history, lag/rolling are filled with fallback baseline.
    assert not df[["lag_1", "lag_7", "roll_mean_7"]].isna().any().any()
