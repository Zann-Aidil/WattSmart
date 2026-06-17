"""End-to-end training script for SmartEnergy Predictor.

Trains three regressors against the household consumption dataset and persists
the best one (XGBoost) plus its preprocessing pipeline so the FastAPI backend
can serve predictions.

Outputs::

    ml/models/xgboost_model.pkl       # tuned XGBRegressor
    ml/models/scaler.pkl              # full PreprocessingPipeline (incl. scaler)
    ml/models/feature_names.json      # ordered list of input features
    ml/models/training_report.json    # metrics & metadata
    ml/models/feature_importance.png  # top features bar chart
    ml/models/model_comparison.png    # MAE/RMSE comparison

Run::

    python ml/train.py --data data/raw/household_consumption.csv
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# Ensure the repository root is importable when running this file directly.
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import RandomizedSearchCV, TimeSeriesSplit

from ml.evaluate import RegressionMetrics, evaluate, format_metrics_table
from ml.preprocessing import PreprocessingPipeline, TARGET_COL


MODELS_DIR = Path("ml/models")
# Default to the cleaned dataset. The "raw" CSV intentionally includes injected
# artifacts (NaNs, meter-error outliers) so the preprocessing pipeline has work
# to exercise; the clean version is what we'd use after quality checks.
DEFAULT_DATA = Path("data/processed/household_consumption_clean.csv")


# -----------------------------------------------------------------------------
# Hyperparameter grid for XGBoost (kept small so the script finishes < 1 min)
# -----------------------------------------------------------------------------

XGB_PARAM_GRID = {
    "n_estimators": [200, 400, 600],
    "max_depth": [4, 6, 8],
    "learning_rate": [0.03, 0.05, 0.1],
    "subsample": [0.8, 1.0],
    "colsample_bytree": [0.8, 1.0],
    "min_child_weight": [1, 3],
    "reg_lambda": [1.0, 2.0],
}


# -----------------------------------------------------------------------------


def _load_dataset(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(
            f"Dataset not found at {path}. Run `python data/synthetic_generator.py` first."
        )
    df = pd.read_csv(path, parse_dates=["tanggal"])
    df = df.sort_values("tanggal").reset_index(drop=True)
    return df


def _train_xgboost(
    X_train: np.ndarray,
    y_train: np.ndarray,
    *,
    n_iter: int = 25,
    seed: int = 42,
) -> tuple[xgb.XGBRegressor, dict[str, object]]:
    """Hyperparameter-tune XGBoost via RandomizedSearchCV + TimeSeriesSplit."""
    base = xgb.XGBRegressor(
        objective="reg:squarederror",
        tree_method="hist",
        random_state=seed,
        n_jobs=-1,
    )
    tscv = TimeSeriesSplit(n_splits=5)
    search = RandomizedSearchCV(
        estimator=base,
        param_distributions=XGB_PARAM_GRID,
        n_iter=n_iter,
        cv=tscv,
        scoring="neg_root_mean_squared_error",
        n_jobs=-1,
        random_state=seed,
        verbose=1,
        refit=True,
    )
    search.fit(X_train, y_train)
    return search.best_estimator_, {
        "best_params": search.best_params_,
        "best_cv_rmse": float(-search.best_score_),
        "cv_splits": 5,
        "n_iter": n_iter,
    }


def _train_random_forest(X_train: np.ndarray, y_train: np.ndarray, *, seed: int = 42) -> RandomForestRegressor:
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=None,
        min_samples_leaf=2,
        n_jobs=-1,
        random_state=seed,
    )
    model.fit(X_train, y_train)
    return model


def _train_linear_regression(X_train: np.ndarray, y_train: np.ndarray) -> LinearRegression:
    model = LinearRegression()
    model.fit(X_train, y_train)
    return model


# -----------------------------------------------------------------------------
# Plotting helpers
# -----------------------------------------------------------------------------


def _plot_model_comparison(metrics_by_model: dict[str, RegressionMetrics], out_path: Path) -> None:
    names = list(metrics_by_model.keys())
    mae = [metrics_by_model[n].mae for n in names]
    rmse = [metrics_by_model[n].rmse for n in names]
    r2 = [metrics_by_model[n].r2 for n in names]

    fig, axes = plt.subplots(1, 3, figsize=(15, 4))
    color_main = "#10b981"
    color_others = ["#6ee7b7", "#a7f3d0"]
    colors = [color_main] + color_others[: len(names) - 1]

    axes[0].bar(names, mae, color=colors)
    axes[0].set_title("MAE (lower = better)")
    axes[0].set_ylabel("kWh")

    axes[1].bar(names, rmse, color=colors)
    axes[1].set_title("RMSE (lower = better)")
    axes[1].set_ylabel("kWh")

    axes[2].bar(names, r2, color=colors)
    axes[2].set_title("R² (higher = better)")
    axes[2].set_ylim(0, 1)

    for ax in axes:
        ax.tick_params(axis="x", rotation=15)
    plt.tight_layout()
    plt.savefig(out_path, dpi=120)
    plt.close(fig)


def _plot_feature_importance(model: xgb.XGBRegressor, feature_names: list[str], out_path: Path, top_n: int = 15) -> None:
    importance = model.feature_importances_
    order = np.argsort(importance)[::-1][:top_n]
    names = [feature_names[i] for i in order]
    values = importance[order]

    fig, ax = plt.subplots(figsize=(9, max(4, 0.35 * len(names))))
    ax.barh(names[::-1], values[::-1], color="#10b981")
    ax.set_title(f"XGBoost Feature Importance (top {top_n})")
    ax.set_xlabel("Gain-based importance")
    plt.tight_layout()
    plt.savefig(out_path, dpi=120)
    plt.close(fig)


# -----------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(description="Train SmartEnergy Predictor model")
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA, help="Path to dataset CSV")
    parser.add_argument("--test-size", type=float, default=0.2, help="Held-out test fraction")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--n-iter", type=int, default=25, help="RandomizedSearchCV iterations for XGBoost")
    parser.add_argument("--skip-tuning", action="store_true", help="Use default XGB hyperparams (faster smoke test)")
    args = parser.parse_args()

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    print(f"[train] Loading dataset from {args.data}")
    df = _load_dataset(args.data)
    print(f"[train] Rows: {len(df):,}  Date range: {df['tanggal'].min().date()} -> {df['tanggal'].max().date()}")

    # Chronological split so we don't leak future data into training.
    n_test = int(len(df) * args.test_size)
    df_train = df.iloc[:-n_test].copy()
    df_test = df.iloc[-n_test:].copy()
    print(f"[train] Train rows: {len(df_train):,}  Test rows: {len(df_test):,}")

    pipeline = PreprocessingPipeline()
    X_train_df, y_train_series = pipeline.fit_transform(df_train)
    assert y_train_series is not None
    X_train, y_train = X_train_df.values, y_train_series.values

    X_test_df = pipeline.transform(df_test)
    X_test, y_test = X_test_df.values, df_test[TARGET_COL].values
    feature_names = list(X_train_df.columns)

    metrics_by_model: dict[str, RegressionMetrics] = {}
    timings: dict[str, float] = {}

    # ---------------- XGBoost (main) ----------------
    print("\n[train] Training XGBoost (RandomizedSearchCV)...")
    t0 = time.perf_counter()
    if args.skip_tuning:
        xgb_model = xgb.XGBRegressor(
            objective="reg:squarederror",
            tree_method="hist",
            n_estimators=400,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.9,
            random_state=args.seed,
            n_jobs=-1,
        )
        xgb_model.fit(X_train, y_train)
        tuning_info = {"best_params": "skipped", "skipped": True}
    else:
        xgb_model, tuning_info = _train_xgboost(X_train, y_train, n_iter=args.n_iter, seed=args.seed)
    timings["XGBoost"] = time.perf_counter() - t0
    metrics_by_model["XGBoost"] = evaluate(y_test, xgb_model.predict(X_test))

    # ---------------- Random Forest ----------------
    print("[train] Training Random Forest...")
    t0 = time.perf_counter()
    rf_model = _train_random_forest(X_train, y_train, seed=args.seed)
    timings["RandomForest"] = time.perf_counter() - t0
    metrics_by_model["RandomForest"] = evaluate(y_test, rf_model.predict(X_test))

    # ---------------- Linear Regression ----------------
    print("[train] Training Linear Regression...")
    t0 = time.perf_counter()
    lr_model = _train_linear_regression(X_train, y_train)
    timings["LinearRegression"] = time.perf_counter() - t0
    metrics_by_model["LinearRegression"] = evaluate(y_test, lr_model.predict(X_test))

    # ---------------- Report ----------------
    print("\n[train] ========== Model Comparison ==========")
    print(format_metrics_table(metrics_by_model))
    for name, t in timings.items():
        print(f"  {name:<18} trained in {t:6.2f}s")

    best_metrics = metrics_by_model["XGBoost"]
    if best_metrics.r2 < 0.85:
        print(f"\n[train] WARNING: XGBoost R² = {best_metrics.r2:.3f} is below the 0.85 target.")
    else:
        print(f"\n[train] OK: XGBoost R² = {best_metrics.r2:.3f} meets the 0.85 target.")

    # ---------------- Persist artifacts ----------------
    joblib.dump(xgb_model, MODELS_DIR / "xgboost_model.pkl")
    pipeline.save(MODELS_DIR / "scaler.pkl")
    with (MODELS_DIR / "feature_names.json").open("w", encoding="utf-8") as fh:
        json.dump(feature_names, fh, indent=2)

    _plot_model_comparison(metrics_by_model, MODELS_DIR / "model_comparison.png")
    _plot_feature_importance(xgb_model, feature_names, MODELS_DIR / "feature_importance.png")

    report = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "data_path": str(args.data),
        "rows_train": len(df_train),
        "rows_test": len(df_test),
        "feature_count": len(feature_names),
        "feature_names": feature_names,
        "models": {name: m.to_dict() for name, m in metrics_by_model.items()},
        "best_model": "XGBoost",
        "best_model_target_met": bool(best_metrics.r2 >= 0.85),
        "xgb_tuning": tuning_info,
        "training_seconds": {k: round(v, 3) for k, v in timings.items()},
    }
    with (MODELS_DIR / "training_report.json").open("w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2, default=str)

    print(f"\n[train] Artifacts saved under {MODELS_DIR}/:")
    for p in sorted(MODELS_DIR.iterdir()):
        print(f"  - {p.name}")


if __name__ == "__main__":
    main()
