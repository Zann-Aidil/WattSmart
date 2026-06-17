"""Regression evaluation utilities.

Centralizes metric computation so training scripts, notebooks, and the
backend's `/api/model-info` endpoint all use the same definitions.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass

import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


@dataclass
class RegressionMetrics:
    """Container for the four headline regression metrics."""

    mae: float
    rmse: float
    r2: float
    mape: float

    def to_dict(self) -> dict[str, float]:
        return {k: round(float(v), 4) for k, v in asdict(self).items()}


def mean_absolute_percentage_error(y_true: np.ndarray, y_pred: np.ndarray, eps: float = 1e-6) -> float:
    """MAPE that avoids divide-by-zero by clipping the denominator."""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    denom = np.maximum(np.abs(y_true), eps)
    return float(np.mean(np.abs((y_true - y_pred) / denom)) * 100.0)


def evaluate(y_true: np.ndarray, y_pred: np.ndarray) -> RegressionMetrics:
    """Compute MAE, RMSE, R², MAPE.

    >>> m = evaluate(np.array([1.0, 2.0, 3.0]), np.array([1.1, 1.9, 3.2]))
    >>> 0.0 < m.mae < 1.0 and 0.0 < m.r2 < 1.0
    True
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = float(r2_score(y_true, y_pred))
    mape = mean_absolute_percentage_error(y_true, y_pred)
    return RegressionMetrics(mae=mae, rmse=rmse, r2=r2, mape=mape)


def format_metrics_table(metrics_by_model: dict[str, RegressionMetrics]) -> str:
    """Render a fixed-width comparison table for logs / notebooks."""
    header = f"{'Model':<22}{'MAE':>10}{'RMSE':>10}{'R2':>10}{'MAPE %':>10}"
    lines = [header, "-" * len(header)]
    for name, m in metrics_by_model.items():
        lines.append(
            f"{name:<22}{m.mae:>10.4f}{m.rmse:>10.4f}{m.r2:>10.4f}{m.mape:>10.2f}"
        )
    return "\n".join(lines)
