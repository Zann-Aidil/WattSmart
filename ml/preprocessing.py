"""Preprocessing & feature engineering pipeline for SmartEnergy Predictor.

This module is reusable across training (`ml.train`) and inference
(`ml.predict` / `backend.services.prediction_service`).

Pipeline overview
-----------------

1. **Type coercion**: convert `tanggal` to datetime, ensure numeric dtypes.
2. **Missing value imputation**: numeric -> median, categorical -> mode.
3. **Outlier handling**: IQR-clipping (Winsorize) for `konsumsi_kwh` and
   `suhu_celsius` so we don't drop rows during inference time.
4. **Feature engineering**:
   - calendar features: `day_of_week`, `month`, `is_weekend`, `quarter`, `day_of_year`
   - lag features: `lag_1`, `lag_7` (previous day, previous week)
   - rolling mean: `roll_mean_7`
   - interaction: `temp_x_appliances`
5. **Scaling**: `StandardScaler` on numeric columns (excluding the target).

The public surface is the :class:`PreprocessingPipeline` class plus a few
convenience builders so unit tests can exercise individual steps.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, Sequence

import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler


TARGET_COL = "konsumsi_kwh"
DATE_COL = "tanggal"

# Columns expected in the raw dataset.
RAW_NUMERIC_COLS: tuple[str, ...] = (
    "jam",
    "suhu_celsius",
    "hari_libur",
    "jumlah_penghuni",
    "jumlah_perangkat_aktif",
    "jam_penggunaan_rata_rata",
)

# Columns that may contain extreme outliers worth winsorizing.
WINSORIZE_COLS: tuple[str, ...] = ("konsumsi_kwh", "suhu_celsius")


# -----------------------------------------------------------------------------
# Stateless helpers (easy to unit test)
# -----------------------------------------------------------------------------


def coerce_types(df: pd.DataFrame) -> pd.DataFrame:
    """Cast `tanggal` to datetime and numeric cols to numeric dtypes."""
    df = df.copy()
    if DATE_COL in df.columns:
        df[DATE_COL] = pd.to_datetime(df[DATE_COL], errors="coerce")
    for col in RAW_NUMERIC_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    if TARGET_COL in df.columns:
        df[TARGET_COL] = pd.to_numeric(df[TARGET_COL], errors="coerce")
    return df


def impute_missing(df: pd.DataFrame, *, medians: dict[str, float] | None = None) -> tuple[pd.DataFrame, dict[str, float]]:
    """Fill numeric NaNs with the column median.

    When `medians` is supplied (e.g. at inference time) those are reused so
    train/test/serve stay consistent.
    """
    df = df.copy()
    learned: dict[str, float] = {}
    for col in df.select_dtypes(include=[np.number]).columns:
        if medians is not None and col in medians:
            value = medians[col]
        else:
            value = float(df[col].median())
        learned[col] = value
        df[col] = df[col].fillna(value)
    return df, learned


def winsorize(
    df: pd.DataFrame,
    cols: Iterable[str] = WINSORIZE_COLS,
    *,
    k: float = 3.0,
    bounds: dict[str, tuple[float, float]] | None = None,
) -> tuple[pd.DataFrame, dict[str, tuple[float, float]]]:
    """Clip extreme values using `k * IQR` to keep all rows usable.

    Returns the (possibly-clipped) frame plus the learned per-column bounds so
    the same clipping can be re-applied at inference.
    """
    df = df.copy()
    learned: dict[str, tuple[float, float]] = {}
    for col in cols:
        if col not in df.columns:
            continue
        if bounds is not None and col in bounds:
            lower, upper = bounds[col]
        else:
            q1, q3 = df[col].quantile([0.25, 0.75])
            iqr = q3 - q1
            lower, upper = q1 - k * iqr, q3 + k * iqr
        learned[col] = (float(lower), float(upper))
        df[col] = df[col].clip(lower=lower, upper=upper)
    return df, learned


def add_calendar_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add `day_of_week`, `month`, `is_weekend`, `quarter`, `day_of_year`."""
    df = df.copy()
    if DATE_COL not in df.columns:
        return df
    dt = df[DATE_COL]
    df["day_of_week"] = dt.dt.dayofweek
    df["month"] = dt.dt.month
    df["is_weekend"] = (dt.dt.dayofweek >= 5).astype(int)
    df["quarter"] = dt.dt.quarter
    df["day_of_year"] = dt.dt.dayofyear
    return df


def add_lag_features(df: pd.DataFrame, target_col: str = TARGET_COL) -> pd.DataFrame:
    """Add `lag_1`, `lag_7`, and `roll_mean_7` aggregated over `tanggal`.

    For training we expect `tanggal` to be present and sorted. At inference
    time the caller supplies the recent-history series via the predictor.
    """
    df = df.copy()
    if DATE_COL in df.columns and target_col in df.columns:
        df = df.sort_values(DATE_COL).reset_index(drop=True)
        # Daily average so lag math works even with multiple rows per day.
        daily = df.groupby(DATE_COL)[target_col].mean()
        lag_1 = daily.shift(1)
        lag_7 = daily.shift(7)
        roll_7 = daily.shift(1).rolling(7, min_periods=1).mean()
        df["lag_1"] = df[DATE_COL].map(lag_1)
        df["lag_7"] = df[DATE_COL].map(lag_7)
        df["roll_mean_7"] = df[DATE_COL].map(roll_7)
    # Fill NaNs created by the shift with the column median so we keep rows.
    for col in ("lag_1", "lag_7", "roll_mean_7"):
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())
    return df


def add_interaction_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "suhu_celsius" in df.columns and "jumlah_perangkat_aktif" in df.columns:
        df["temp_x_appliances"] = df["suhu_celsius"] * df["jumlah_perangkat_aktif"]
    if "jumlah_penghuni" in df.columns and "jam_penggunaan_rata_rata" in df.columns:
        df["occupants_x_hours"] = df["jumlah_penghuni"] * df["jam_penggunaan_rata_rata"]
    return df


# -----------------------------------------------------------------------------
# Stateful pipeline (learns medians, bounds, scaler from training data)
# -----------------------------------------------------------------------------


@dataclass
class PreprocessingPipeline:
    """Fit/transform pipeline that can be persisted with joblib.

    Usage::

        pipe = PreprocessingPipeline()
        X_train, y_train = pipe.fit_transform(df_train)
        X_test = pipe.transform(df_test)            # y_test = df_test[target]
        pipe.save('ml/models/scaler.pkl')
    """

    feature_names: list[str] = field(default_factory=list)
    medians: dict[str, float] = field(default_factory=dict)
    winsor_bounds: dict[str, tuple[float, float]] = field(default_factory=dict)
    scaler: StandardScaler | None = None
    target_col: str = TARGET_COL

    # ------- Internal feature builder (no scaling, no target removal) -------

    def _build_features(self, df: pd.DataFrame, *, fit: bool) -> pd.DataFrame:
        df = coerce_types(df)
        if fit:
            df, self.medians = impute_missing(df)
            df, self.winsor_bounds = winsorize(df)
        else:
            df, _ = impute_missing(df, medians=self.medians)
            df, _ = winsorize(df, bounds=self.winsor_bounds)
        df = add_calendar_features(df)
        df = add_lag_features(df, target_col=self.target_col)
        df = add_interaction_features(df)
        return df

    # ----------------------------- Public API ------------------------------

    def fit(self, df: pd.DataFrame) -> "PreprocessingPipeline":
        df_feat = self._build_features(df, fit=True)
        X = self._drop_non_features(df_feat)
        self.feature_names = list(X.columns)
        self.scaler = StandardScaler().fit(X.values)
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        if self.scaler is None:
            raise RuntimeError("Pipeline must be fit before calling transform.")
        df_feat = self._build_features(df, fit=False)
        X = self._drop_non_features(df_feat)
        # Re-order columns to match training feature order.
        X = X.reindex(columns=self.feature_names, fill_value=0.0)
        scaled = self.scaler.transform(X.values)
        return pd.DataFrame(scaled, columns=self.feature_names, index=X.index)

    def fit_transform(self, df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series | None]:
        self.fit(df)
        X = self.transform(df)
        y = df[self.target_col] if self.target_col in df.columns else None
        return X, y

    # --------------------------- Persistence -------------------------------

    def save(self, path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self, path)

    @classmethod
    def load(cls, path: str | Path) -> "PreprocessingPipeline":
        return joblib.load(path)

    # -------------------------------------------------------------------

    def _drop_non_features(self, df: pd.DataFrame) -> pd.DataFrame:
        drop_cols: list[str] = []
        if DATE_COL in df.columns:
            drop_cols.append(DATE_COL)
        if self.target_col in df.columns:
            drop_cols.append(self.target_col)
        return df.drop(columns=drop_cols)


# -----------------------------------------------------------------------------
# Convenience for inference: build a single-row feature frame from a JSON-like
# request payload, supplying historical kWh series for lag / rolling features.
# -----------------------------------------------------------------------------


def build_inference_frame(
    *,
    tanggal: str | pd.Timestamp,
    jam: int,
    suhu_celsius: float,
    hari_libur: int,
    jumlah_penghuni: int,
    jumlah_perangkat_aktif: int,
    jam_penggunaan_rata_rata: float,
    history_kwh: Sequence[float] | None = None,
) -> pd.DataFrame:
    """Build a one-row DataFrame ready to be passed into `pipeline.transform`.

    `history_kwh` is the user's recent daily consumption (most recent last).
    The values are used to populate `lag_1`, `lag_7`, and `roll_mean_7`.
    Missing history is back-filled with the most recent observation.
    """
    tanggal_ts = pd.to_datetime(tanggal)
    row = {
        DATE_COL: tanggal_ts,
        "jam": int(jam),
        "suhu_celsius": float(suhu_celsius),
        "hari_libur": int(hari_libur),
        "jumlah_penghuni": int(jumlah_penghuni),
        "jumlah_perangkat_aktif": int(jumlah_perangkat_aktif),
        "jam_penggunaan_rata_rata": float(jam_penggunaan_rata_rata),
    }

    history = list(history_kwh or [])
    if not history:
        history = [10.0]  # fallback baseline
    # Pad to length 7 with last value so rolling/lag are stable.
    while len(history) < 7:
        history.insert(0, history[0])
    history = history[-7:]

    row["lag_1"] = float(history[-1])
    row["lag_7"] = float(history[0])
    row["roll_mean_7"] = float(np.mean(history))

    # Add calendar + interaction features on this single row so the pipeline
    # can be invoked without re-deriving them.
    df = pd.DataFrame([row])
    df = add_calendar_features(df)
    df = add_interaction_features(df)
    return df
