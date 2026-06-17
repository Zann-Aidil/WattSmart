"""Synthetic Household Electricity Consumption Dataset Generator.

Generates a realistic dataset that mimics the UCI Individual Household Electric
Power Consumption dataset. Patterns include:

* Daily / seasonal temperature cycles (Indonesia tropical climate, 23-35 C).
* Weekly cycles (higher weekend consumption, lower weekday daytime).
* Holiday effects (national holidays push consumption up).
* Non-linear relationship between temperature, occupants and active appliances.
* Heteroscedastic Gaussian noise to mimic real-world variability.

Output:
    data/raw/household_consumption.csv
    data/processed/household_consumption_clean.csv

Run:
    python data/synthetic_generator.py
"""

from __future__ import annotations

import argparse
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import pandas as pd


# --- Indonesian national holidays (subset, recurring + fixed dates) ---------
# This list deliberately includes a few years of fixed-date holidays. Movable
# holidays (Idul Fitri, Idul Adha, Imlek, Waisak, Nyepi) are approximated by
# sampling additional random "long weekend" days in each year.
FIXED_HOLIDAYS_MONTH_DAY: list[tuple[int, int]] = [
    (1, 1),    # Tahun Baru Masehi
    (5, 1),    # Hari Buruh
    (6, 1),    # Hari Lahir Pancasila
    (8, 17),   # Hari Kemerdekaan
    (12, 25),  # Natal
]


def _is_fixed_holiday(d: date) -> bool:
    return (d.month, d.day) in FIXED_HOLIDAYS_MONTH_DAY


def _sample_movable_holidays(year: int, rng: np.random.Generator, n: int = 8) -> set[date]:
    """Approximate movable holidays + cuti bersama by sampling random dates."""
    sampled: set[date] = set()
    while len(sampled) < n:
        day_of_year = int(rng.integers(1, 366))
        try:
            d = date(year, 1, 1) + timedelta(days=day_of_year - 1)
            sampled.add(d)
        except ValueError:
            continue
    return sampled


def _seasonal_temperature(d: date, rng: np.random.Generator) -> float:
    """Tropical climate temperature in Celsius.

    Slight annual cycle (cooler in Jun-Aug ~Bali-like dry season), large daily
    variation. Mean around 28 C with +-3 C seasonal swing and +-2 C noise.
    """
    day_of_year = d.timetuple().tm_yday
    annual_cycle = 28.0 - 2.5 * np.cos(2 * np.pi * (day_of_year - 30) / 365.0)
    noise = float(rng.normal(0.0, 1.5))
    temp = annual_cycle + noise
    return float(np.clip(temp, 22.0, 36.0))


def _consumption_for_row(
    temp: float,
    is_holiday: int,
    occupants: int,
    appliances: int,
    avg_usage_hours: float,
    day_of_week: int,
    rng: np.random.Generator,
) -> float:
    """Generate kWh for a household-day with realistic non-linear effects."""
    base = 4.0  # baseline standby
    # Heat -> more AC. Quadratic above 27 C.
    heat_kwh = 0.25 * max(0.0, temp - 27.0) ** 2
    # Occupants & appliances scale roughly linearly with saturation.
    occupant_kwh = 1.4 * occupants ** 0.85
    appliance_kwh = 0.55 * appliances
    # Usage hours dominate.
    usage_kwh = 0.42 * avg_usage_hours
    # Weekend uplift.
    is_weekend = 1 if day_of_week >= 5 else 0
    weekend_kwh = 1.2 * is_weekend
    # Holiday uplift (people stay home).
    holiday_kwh = 1.6 * is_holiday
    # Heteroscedastic noise (more variance when consumption higher).
    raw = base + heat_kwh + occupant_kwh + appliance_kwh + usage_kwh + weekend_kwh + holiday_kwh
    noise = float(rng.normal(0.0, max(0.4, 0.06 * raw)))
    return max(1.5, raw + noise)


def generate_dataset(
    n_rows: int = 12_000,
    start_date: date | None = None,
    seed: int = 42,
) -> pd.DataFrame:
    """Generate `n_rows` daily-level rows of synthetic household consumption.

    Args:
        n_rows: number of rows to produce. Larger = more days x households.
        start_date: starting date (inclusive). Defaults to today - n_rows days.
        seed: RNG seed for reproducibility.

    Returns:
        DataFrame with the requested schema.
    """
    rng = np.random.default_rng(seed)

    if start_date is None:
        start_date = date.today() - timedelta(days=n_rows)

    # Precompute movable holidays for the year range we will touch.
    years = {(start_date + timedelta(days=i)).year for i in range(n_rows + 365)}
    movable_holidays: set[date] = set()
    for y in years:
        movable_holidays.update(_sample_movable_holidays(y, rng))

    records: list[dict] = []
    for i in range(n_rows):
        d = start_date + timedelta(days=i)
        is_holiday = int(_is_fixed_holiday(d) or d in movable_holidays)
        temp = _seasonal_temperature(d, rng)

        # Random household profile parameters - re-sampled occasionally so the
        # dataset behaves like rotating through several households over time.
        occupants = int(rng.integers(1, 7))
        appliances = int(rng.integers(3, 16))
        # Peak hour bias: people use devices more on weekends & holidays.
        base_hours = 6.0 + 4.0 * rng.random()
        if is_holiday or d.weekday() >= 5:
            base_hours += 1.5
        avg_usage_hours = float(np.clip(base_hours, 2.0, 18.0))

        # Hour of day - approximate the *primary* consumption hour bucket.
        # Bias towards evening peak (17-22) on weekdays.
        if rng.random() < 0.55:
            hour = int(rng.integers(17, 23))
        else:
            hour = int(rng.integers(5, 24))

        kwh = _consumption_for_row(
            temp=temp,
            is_holiday=is_holiday,
            occupants=occupants,
            appliances=appliances,
            avg_usage_hours=avg_usage_hours,
            day_of_week=d.weekday(),
            rng=rng,
        )

        records.append(
            {
                "tanggal": d.isoformat(),
                "jam": hour,
                "suhu_celsius": round(temp, 2),
                "hari_libur": is_holiday,
                "jumlah_penghuni": occupants,
                "jumlah_perangkat_aktif": appliances,
                "jam_penggunaan_rata_rata": round(avg_usage_hours, 2),
                "konsumsi_kwh": round(kwh, 3),
            }
        )

    df = pd.DataFrame.from_records(records)
    df["tanggal"] = pd.to_datetime(df["tanggal"])
    df = df.sort_values("tanggal").reset_index(drop=True)
    return df


def _inject_realistic_artifacts(df: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """Inject a small number of NaNs and outliers so cleaning has work to do."""
    df = df.copy()
    n = len(df)

    # 1% missing values across two numeric cols.
    miss_idx = rng.choice(n, size=max(1, n // 100), replace=False)
    df.loc[miss_idx, "suhu_celsius"] = np.nan

    miss_idx = rng.choice(n, size=max(1, n // 200), replace=False)
    df.loc[miss_idx, "jam_penggunaan_rata_rata"] = np.nan

    # 0.5% extreme outliers in consumption (e.g. faulty meter days).
    out_idx = rng.choice(n, size=max(1, n // 200), replace=False)
    df.loc[out_idx, "konsumsi_kwh"] *= rng.uniform(3.0, 6.0, size=len(out_idx))

    return df


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate synthetic household consumption data")
    parser.add_argument("--rows", type=int, default=12_000, help="Number of daily rows to generate")
    parser.add_argument("--seed", type=int, default=42, help="RNG seed")
    parser.add_argument(
        "--out-raw",
        type=str,
        default="data/raw/household_consumption.csv",
        help="Output path for raw (with artifacts) CSV",
    )
    parser.add_argument(
        "--out-processed",
        type=str,
        default="data/processed/household_consumption_clean.csv",
        help="Output path for clean CSV (no artifacts injected)",
    )
    args = parser.parse_args()

    print(f"[generator] Generating {args.rows} rows with seed {args.seed}...")
    df = generate_dataset(n_rows=args.rows, seed=args.seed)
    rng = np.random.default_rng(args.seed + 1)
    df_raw = _inject_realistic_artifacts(df, rng)

    out_raw = Path(args.out_raw)
    out_processed = Path(args.out_processed)
    out_raw.parent.mkdir(parents=True, exist_ok=True)
    out_processed.parent.mkdir(parents=True, exist_ok=True)

    df_raw.to_csv(out_raw, index=False)
    df.to_csv(out_processed, index=False)

    print(f"[generator] Wrote raw      -> {out_raw}  ({len(df_raw):,} rows)")
    print(f"[generator] Wrote processed-> {out_processed}  ({len(df):,} rows)")
    print()
    print("[generator] Quick stats (clean):")
    print(df[["suhu_celsius", "konsumsi_kwh", "jumlah_penghuni"]].describe().round(2))


if __name__ == "__main__":
    main()
