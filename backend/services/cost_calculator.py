"""Helpers for converting kWh -> Rupiah and formatting currency."""

from __future__ import annotations


def calculate_cost(kwh: float, tariff_per_kwh: float) -> float:
    """Return the raw Rupiah cost for `kwh` units at the given tariff."""
    return round(float(kwh) * float(tariff_per_kwh), 2)


def format_rupiah(value: float, *, symbol: str = "Rp") -> str:
    """Format a number using Indonesian thousand separators.

    >>> format_rupiah(1444700)
    'Rp 1.444.700'
    >>> format_rupiah(25430.5)
    'Rp 25.431'
    """
    rounded = int(round(float(value)))
    sign = "-" if rounded < 0 else ""
    s = f"{abs(rounded):,}".replace(",", ".")
    return f"{symbol} {sign}{s}"


def classify_consumption(kwh: float) -> str:
    """Map daily kWh into the four buckets used by the UI."""
    if kwh < 10:
        return "rendah"
    if kwh < 20:
        return "sedang"
    if kwh < 30:
        return "tinggi"
    return "sangat_tinggi"
