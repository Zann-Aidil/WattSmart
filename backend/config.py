"""Application configuration via pydantic-settings.

Values are loaded from environment variables / `.env` file. See `.env.example`.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


REPO_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Application settings.

    All env vars are prefixed naturally (no prefix). Override by exporting them
    or by placing values in a `.env` file at the repo root.
    """

    model_config = SettingsConfigDict(
        env_file=str(REPO_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ----- App -----
    app_name: str = "SmartEnergy Predictor"
    app_version: str = "1.0.0"
    debug: bool = True

    # ----- Server -----
    host: str = "0.0.0.0"
    port: int = 8000

    # ----- CORS (comma-separated list in env) -----
    cors_origins: str = "http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000,http://127.0.0.1:8000,http://localhost:5173,http://127.0.0.1:5173,null"

    # ----- Model artifacts -----
    model_path: str = str(REPO_ROOT / "ml" / "models" / "xgboost_model.pkl")
    scaler_path: str = str(REPO_ROOT / "ml" / "models" / "scaler.pkl")
    feature_names_path: str = str(REPO_ROOT / "ml" / "models" / "feature_names.json")
    training_report_path: str = str(REPO_ROOT / "ml" / "models" / "training_report.json")

    # ----- Tariff -----
    tariff_per_kwh: float = Field(default=1444.70, description="PLN R-1/1300 VA default")
    currency_symbol: str = "Rp"

    # ----- Logging -----
    log_level: str = "INFO"

    # ------------------- helpers ------------------------------------------

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings accessor (use across the app)."""
    return Settings()
