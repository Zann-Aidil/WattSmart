"""Rule-based energy efficiency recommendation engine.

Given a user's input parameters and the model's kWh prediction, this engine
returns a list of actionable Indonesian recommendations. Each rule is a small
pure function that returns a :class:`Recommendation` or ``None`` if it does
not apply.

Recommendation contract (mirrors `backend.schemas.RecommendationItem`)::

    judul:            short Indonesian title
    deskripsi:        2-3 sentence Indonesian description
    estimasi_hemat_kwh:  float (kWh saved per day if applied)
    estimasi_hemat_rp:   float (Rupiah saved per day)
    prioritas:        "low" | "medium" | "high"
    kategori:         "perangkat" | "perilaku" | "iklim" | "waktu" | "umum"
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import date
from typing import Callable, Iterable, Sequence


Priority = str  # one of "low", "medium", "high"
Category = str  # one of "perangkat", "perilaku", "iklim", "waktu", "umum"

# Peak-hour window (Indonesia). PLN's WBP (Waktu Beban Puncak) for residential
# customers is roughly 17:00-22:00.
PEAK_HOUR_START = 17
PEAK_HOUR_END = 22


@dataclass
class Recommendation:
    judul: str
    deskripsi: str
    estimasi_hemat_kwh: float
    estimasi_hemat_rp: float
    prioritas: Priority
    kategori: Category

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class RecommendationContext:
    """All the inputs a rule may need to decide whether to fire."""

    predicted_kwh: float
    suhu_celsius: float
    hari_libur: int
    jumlah_penghuni: int
    jumlah_perangkat_aktif: int
    jam_penggunaan_rata_rata: float
    jam: int
    history_kwh: Sequence[float]
    tariff_per_kwh: float
    tanggal: date | None = None

    @property
    def baseline_kwh(self) -> float:
        if not self.history_kwh:
            return self.predicted_kwh
        return float(sum(self.history_kwh) / len(self.history_kwh))

    @property
    def is_peak_hour(self) -> bool:
        return PEAK_HOUR_START <= self.jam <= PEAK_HOUR_END

    @property
    def is_weekend(self) -> bool:
        if self.tanggal is None:
            return False
        return self.tanggal.weekday() >= 5


# -----------------------------------------------------------------------------
# Individual rules
# -----------------------------------------------------------------------------


def _rule_high_consumption(ctx: RecommendationContext) -> Recommendation | None:
    """Flag when prediction is 20%+ above the user's historical baseline."""
    if not ctx.history_kwh:
        return None
    threshold = ctx.baseline_kwh * 1.2
    if ctx.predicted_kwh <= threshold:
        return None
    excess_kwh = ctx.predicted_kwh - ctx.baseline_kwh
    hemat_kwh = round(excess_kwh * 0.5, 2)  # target hemat setengah dari excess
    return Recommendation(
        judul="Konsumsi diperkirakan tinggi - audit penggunaan hari ini",
        deskripsi=(
            f"Prediksi konsumsi {ctx.predicted_kwh:.1f} kWh lebih tinggi sekitar "
            f"{(excess_kwh / max(ctx.baseline_kwh, 0.1) * 100):.0f}% dari rata-rata "
            f"7 hari terakhir ({ctx.baseline_kwh:.1f} kWh). Periksa perangkat besar yang sedang "
            "aktif (AC, water heater, setrika) dan matikan yang tidak digunakan."
        ),
        estimasi_hemat_kwh=hemat_kwh,
        estimasi_hemat_rp=round(hemat_kwh * ctx.tariff_per_kwh, 2),
        prioritas="high",
        kategori="perilaku",
    )


def _rule_peak_hour_shift(ctx: RecommendationContext) -> Recommendation | None:
    """Geser pemakaian dari jam peak ke off-peak."""
    if not ctx.is_peak_hour:
        return None
    if ctx.jam_penggunaan_rata_rata < 4:
        return None
    # Asumsi 10-15% penghematan dengan menggeser ~30% beban ke off-peak.
    hemat_kwh = round(ctx.predicted_kwh * 0.10, 2)
    return Recommendation(
        judul="Geser pemakaian perangkat besar ke luar jam beban puncak",
        deskripsi=(
            f"Anda menggunakan listrik pada jam {ctx.jam}:00, yang berada dalam Waktu Beban "
            f"Puncak (17.00-22.00). Jadwalkan setrika, mesin cuci, dan pengisian baterai "
            "di pagi atau malam (>22.00) untuk mengurangi beban puncak harian."
        ),
        estimasi_hemat_kwh=hemat_kwh,
        estimasi_hemat_rp=round(hemat_kwh * ctx.tariff_per_kwh, 2),
        prioritas="medium",
        kategori="waktu",
    )


def _rule_ac_temperature(ctx: RecommendationContext) -> Recommendation | None:
    """Saran setting AC saat suhu lingkungan tinggi."""
    if ctx.suhu_celsius < 30 or ctx.jam_penggunaan_rata_rata < 6:
        return None
    # Setiap kenaikan 1°C setting AC menghemat sekitar 6% konsumsi AC.
    # Asumsi 40% konsumsi rumah berasal dari AC saat suhu >30C.
    hemat_kwh = round(ctx.predicted_kwh * 0.40 * 0.06 * 2, 2)
    return Recommendation(
        judul="Atur suhu AC ke 24-25°C, bukan di bawah 22°C",
        deskripsi=(
            f"Suhu lingkungan {ctx.suhu_celsius:.1f}°C dan rata-rata pemakaian "
            f"{ctx.jam_penggunaan_rata_rata:.1f} jam/hari menunjukkan AC aktif cukup lama. "
            "Setiap kenaikan 1°C pada AC menghemat sekitar 6% energi. Gunakan kipas "
            "angin sebagai pendamping untuk efek dingin yang sama."
        ),
        estimasi_hemat_kwh=hemat_kwh,
        estimasi_hemat_rp=round(hemat_kwh * ctx.tariff_per_kwh, 2),
        prioritas="high",
        kategori="iklim",
    )


def _rule_weekend_standby(ctx: RecommendationContext) -> Recommendation | None:
    if not (ctx.is_weekend or ctx.hari_libur):
        return None
    # Standby load tipikal 5-10% konsumsi.
    hemat_kwh = round(ctx.predicted_kwh * 0.05, 2)
    return Recommendation(
        judul="Cabut perangkat standby saat tidak digunakan",
        deskripsi=(
            "Pada hari libur, banyak perangkat (TV, microwave, charger, dispenser) "
            "tetap menyala dalam mode standby. Cabut steker perangkat yang tidak "
            "perlu - kulkas dan router boleh tetap menyala."
        ),
        estimasi_hemat_kwh=hemat_kwh,
        estimasi_hemat_rp=round(hemat_kwh * ctx.tariff_per_kwh, 2),
        prioritas="low",
        kategori="perangkat",
    )


def _rule_many_appliances(ctx: RecommendationContext) -> Recommendation | None:
    if ctx.jumlah_perangkat_aktif < 10:
        return None
    hemat_kwh = round(min(2.0, 0.15 * (ctx.jumlah_perangkat_aktif - 8)), 2)
    return Recommendation(
        judul="Tinjau ulang perangkat aktif simultan",
        deskripsi=(
            f"Tercatat {ctx.jumlah_perangkat_aktif} perangkat aktif bersamaan. "
            "Identifikasi perangkat dengan daya tinggi (water heater, oven, setrika, "
            "AC) dan operasikan secara bergantian, bukan paralel. Pertimbangkan "
            "mengganti lampu pijar dengan LED dan kulkas tua dengan model bertanda "
            "hemat energi."
        ),
        estimasi_hemat_kwh=hemat_kwh,
        estimasi_hemat_rp=round(hemat_kwh * ctx.tariff_per_kwh, 2),
        prioritas="medium",
        kategori="perangkat",
    )


def _rule_long_usage_hours(ctx: RecommendationContext) -> Recommendation | None:
    if ctx.jam_penggunaan_rata_rata < 10:
        return None
    hemat_kwh = round(ctx.predicted_kwh * 0.08, 2)
    return Recommendation(
        judul="Manfaatkan cahaya alami di siang hari",
        deskripsi=(
            f"Rata-rata pemakaian listrik {ctx.jam_penggunaan_rata_rata:.1f} jam/hari "
            "cukup tinggi. Buka tirai dan jendela di siang hari untuk mengurangi "
            "penggunaan lampu. Aktifkan timer / sensor gerak agar lampu otomatis "
            "padam di ruangan kosong."
        ),
        estimasi_hemat_kwh=hemat_kwh,
        estimasi_hemat_rp=round(hemat_kwh * ctx.tariff_per_kwh, 2),
        prioritas="low",
        kategori="perilaku",
    )


def _rule_universal_baseline(ctx: RecommendationContext) -> Recommendation | None:
    """Always-on baseline tip so users never see an empty list."""
    return Recommendation(
        judul="Pantau konsumsi melalui meteran prabayar / token",
        deskripsi=(
            "Periksa sisa kWh / token PLN minimal seminggu sekali. Mencatat pola "
            "pemakaian mingguan membantu Anda mengenali lonjakan tidak normal dan "
            "perangkat yang boros tanpa disadari."
        ),
        estimasi_hemat_kwh=0.0,
        estimasi_hemat_rp=0.0,
        prioritas="low",
        kategori="umum",
    )


# Rule registry. Order matters: high-priority / actionable rules first.
RULES: tuple[Callable[[RecommendationContext], Recommendation | None], ...] = (
    _rule_high_consumption,
    _rule_ac_temperature,
    _rule_peak_hour_shift,
    _rule_many_appliances,
    _rule_long_usage_hours,
    _rule_weekend_standby,
    _rule_universal_baseline,
)


# -----------------------------------------------------------------------------


def generate_recommendations(
    ctx: RecommendationContext,
    *,
    rules: Iterable[Callable[[RecommendationContext], Recommendation | None]] = RULES,
    max_items: int = 6,
) -> list[Recommendation]:
    """Apply each rule, filter Nones, cap to `max_items`, sort by priority."""
    out: list[Recommendation] = []
    for rule in rules:
        rec = rule(ctx)
        if rec is not None:
            out.append(rec)

    priority_order = {"high": 0, "medium": 1, "low": 2}
    out.sort(key=lambda r: (priority_order.get(r.prioritas, 99), -r.estimasi_hemat_rp))
    return out[:max_items]


def total_estimated_savings(recs: Iterable[Recommendation]) -> dict[str, float]:
    """Sum savings across the returned recommendations."""
    kwh = sum(r.estimasi_hemat_kwh for r in recs)
    rp = sum(r.estimasi_hemat_rp for r in recs)
    return {
        "estimasi_hemat_kwh": round(float(kwh), 2),
        "estimasi_hemat_rp": round(float(rp), 2),
    }
