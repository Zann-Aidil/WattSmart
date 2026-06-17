"""Wraps the rule-based recommendation engine into API-friendly responses."""

from __future__ import annotations

from datetime import date

from backend.config import get_settings
from backend.schemas import PredictionInput, RecommendationItem, RecommendationResponse
from backend.services.cost_calculator import format_rupiah
from ml.recommendation import (
    RecommendationContext,
    generate_recommendations,
    total_estimated_savings,
)


def build_recommendations(payload: PredictionInput, predicted_kwh: float) -> RecommendationResponse:
    settings = get_settings()

    ctx = RecommendationContext(
        predicted_kwh=float(predicted_kwh),
        suhu_celsius=payload.suhu_celsius,
        hari_libur=payload.hari_libur,
        jumlah_penghuni=payload.jumlah_penghuni,
        jumlah_perangkat_aktif=payload.jumlah_perangkat_aktif,
        jam_penggunaan_rata_rata=payload.jam_penggunaan_rata_rata,
        jam=payload.jam,
        history_kwh=list(payload.konsumsi_7_hari_terakhir or []),
        tariff_per_kwh=settings.tariff_per_kwh,
        tanggal=payload.tanggal if isinstance(payload.tanggal, date) else None,
    )

    recs = generate_recommendations(ctx)

    items = [
        RecommendationItem(
            judul=r.judul,
            deskripsi=r.deskripsi,
            estimasi_hemat_kwh=r.estimasi_hemat_kwh,
            estimasi_hemat_rp=r.estimasi_hemat_rp,
            estimasi_hemat_rp_formatted=format_rupiah(r.estimasi_hemat_rp, symbol=settings.currency_symbol),
            prioritas=r.prioritas,  # type: ignore[arg-type]
            kategori=r.kategori,  # type: ignore[arg-type]
        )
        for r in recs
    ]

    totals = total_estimated_savings(recs)
    return RecommendationResponse(
        rekomendasi=items,
        total_estimasi_hemat_kwh=totals["estimasi_hemat_kwh"],
        total_estimasi_hemat_rp=totals["estimasi_hemat_rp"],
        total_estimasi_hemat_rp_formatted=format_rupiah(
            totals["estimasi_hemat_rp"], symbol=settings.currency_symbol
        ),
    )
