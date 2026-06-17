"""Pydantic request/response schemas for the API."""

from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator


# -----------------------------------------------------------------------------
# Common building blocks
# -----------------------------------------------------------------------------


class PredictionInput(BaseModel):
    """Input parameters for a single-day prediction."""

    tanggal: date = Field(..., description="Tanggal target prediksi (YYYY-MM-DD)")
    jam: int = Field(19, ge=0, le=23, description="Jam representatif (0-23). Default malam.")
    suhu_celsius: float = Field(..., ge=10, le=45, description="Suhu lingkungan dalam derajat Celcius")
    hari_libur: int = Field(0, ge=0, le=1, description="1 jika hari libur nasional, 0 jika hari kerja")
    jumlah_penghuni: int = Field(..., ge=1, le=20, description="Jumlah penghuni rumah")
    jumlah_perangkat_aktif: int = Field(..., ge=0, le=50, description="Estimasi jumlah perangkat aktif")
    jam_penggunaan_rata_rata: float = Field(..., ge=0, le=24, description="Rata-rata jam pemakaian listrik per hari")
    konsumsi_7_hari_terakhir: list[float] = Field(
        default_factory=list,
        description="Konsumsi 7 hari terakhir dalam kWh (paling lama -> paling baru). Boleh kosong.",
    )

    @field_validator("konsumsi_7_hari_terakhir")
    @classmethod
    def _validate_history(cls, v: list[float]) -> list[float]:
        for x in v:
            if x < 0 or x > 200:
                raise ValueError("setiap nilai konsumsi harus antara 0 dan 200 kWh")
        return v


# -----------------------------------------------------------------------------
# Predict endpoint
# -----------------------------------------------------------------------------


KategoriKonsumsi = Literal["rendah", "sedang", "tinggi", "sangat_tinggi"]


class PredictionResponse(BaseModel):
    tanggal: date
    prediksi_kwh: float = Field(..., description="Prediksi konsumsi harian dalam kWh")
    estimasi_biaya_rp: float = Field(..., description="Estimasi biaya dalam Rupiah")
    estimasi_biaya_rp_formatted: str = Field(..., description="Format Indonesia (titik ribuan, contoh: Rp 25.430)")
    kategori_konsumsi: KategoriKonsumsi
    tarif_per_kwh: float
    rata_rata_historis_kwh: float | None = Field(
        default=None, description="Rata-rata dari history_kwh jika tersedia"
    )


# -----------------------------------------------------------------------------
# Recommend endpoint
# -----------------------------------------------------------------------------


class RecommendationItem(BaseModel):
    judul: str
    deskripsi: str
    estimasi_hemat_kwh: float
    estimasi_hemat_rp: float
    estimasi_hemat_rp_formatted: str
    prioritas: Literal["low", "medium", "high"]
    kategori: Literal["perangkat", "perilaku", "iklim", "waktu", "umum"]


class RecommendationResponse(BaseModel):
    rekomendasi: list[RecommendationItem]
    total_estimasi_hemat_kwh: float
    total_estimasi_hemat_rp: float
    total_estimasi_hemat_rp_formatted: str


# -----------------------------------------------------------------------------
# Combined endpoint
# -----------------------------------------------------------------------------


class PredictionWithRecommendationsResponse(BaseModel):
    prediksi: PredictionResponse
    rekomendasi: RecommendationResponse


# -----------------------------------------------------------------------------
# Health & model info
# -----------------------------------------------------------------------------


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    app: str
    version: str
    model_loaded: bool


class ModelInfoResponse(BaseModel):
    app: str
    version: str
    model_name: str
    trained_at: str | None
    feature_count: int
    feature_names: list[str]
    metrics: dict
    target_met: bool | None


# -----------------------------------------------------------------------------
# Error envelope
# -----------------------------------------------------------------------------


class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None
