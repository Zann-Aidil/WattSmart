"""Tests for the rule-based recommendation engine."""

from __future__ import annotations

from datetime import date

from ml.recommendation import (
    RecommendationContext,
    generate_recommendations,
    total_estimated_savings,
)


def _ctx(**overrides) -> RecommendationContext:
    defaults = dict(
        predicted_kwh=22.0,
        suhu_celsius=32.0,
        hari_libur=0,
        jumlah_penghuni=4,
        jumlah_perangkat_aktif=11,
        jam_penggunaan_rata_rata=10.0,
        jam=19,
        history_kwh=[17.0, 18.0, 17.5, 18.5, 17.0, 18.0, 17.5],
        tariff_per_kwh=1444.70,
        tanggal=date(2025, 5, 12),
    )
    defaults.update(overrides)
    return RecommendationContext(**defaults)


def test_engine_always_returns_at_least_one_recommendation():
    """Even a 'normal' household gets the universal-baseline tip."""
    ctx = _ctx(predicted_kwh=15.0, suhu_celsius=25.0, jam=10, jam_penggunaan_rata_rata=4.0,
               jumlah_perangkat_aktif=5, hari_libur=0, history_kwh=[15.0] * 7,
               tanggal=date(2025, 5, 5))  # weekday
    recs = generate_recommendations(ctx)
    assert len(recs) >= 1


def test_high_consumption_rule_fires_when_above_baseline():
    ctx = _ctx(predicted_kwh=25.0, history_kwh=[15.0] * 7)
    recs = generate_recommendations(ctx)
    titles = [r.judul for r in recs]
    assert any("audit" in t.lower() or "konsumsi" in t.lower() for t in titles)


def test_high_consumption_rule_silent_when_within_baseline():
    ctx = _ctx(predicted_kwh=15.5, history_kwh=[15.0] * 7)
    recs = generate_recommendations(ctx)
    titles = [r.judul for r in recs]
    assert not any("audit" in t.lower() for t in titles)


def test_peak_hour_rule_fires_only_during_peak():
    off_peak = generate_recommendations(_ctx(jam=10))
    peak = generate_recommendations(_ctx(jam=20))
    assert any("beban puncak" in r.judul.lower() for r in peak)
    assert not any("beban puncak" in r.judul.lower() for r in off_peak)


def test_ac_rule_fires_on_hot_days_with_long_usage():
    hot = generate_recommendations(_ctx(suhu_celsius=33.0, jam_penggunaan_rata_rata=10))
    cool = generate_recommendations(_ctx(suhu_celsius=25.0, jam_penggunaan_rata_rata=10))
    assert any("ac" in r.judul.lower() for r in hot)
    assert not any("ac" in r.judul.lower() for r in cool)


def test_priority_ordering_high_first():
    recs = generate_recommendations(_ctx(predicted_kwh=30.0, suhu_celsius=33.0))
    priorities = [r.prioritas for r in recs]
    # The first non-low recommendation should be 'high' if any high rule fired.
    if "high" in priorities and "low" in priorities:
        assert priorities.index("high") < priorities.index("low")


def test_total_savings_aggregates_correctly():
    recs = generate_recommendations(_ctx(predicted_kwh=24.0, suhu_celsius=32.0))
    totals = total_estimated_savings(recs)
    assert totals["estimasi_hemat_kwh"] >= 0
    assert totals["estimasi_hemat_rp"] >= 0
    expected_rp = sum(r.estimasi_hemat_rp for r in recs)
    assert abs(totals["estimasi_hemat_rp"] - expected_rp) < 0.5


def test_max_items_cap():
    """Engine never returns more than 6 items by default."""
    ctx = _ctx(predicted_kwh=30.0, suhu_celsius=35.0, jumlah_perangkat_aktif=15,
               jam_penggunaan_rata_rata=14, jam=19, hari_libur=1)
    recs = generate_recommendations(ctx)
    assert len(recs) <= 6
