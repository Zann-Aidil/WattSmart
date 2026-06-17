"""Shared pytest fixtures + ensure the repo root is importable."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

# Make `from ml.*` and `from backend.*` work regardless of cwd.
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


@pytest.fixture(scope="session")
def repo_root() -> Path:
    return ROOT


@pytest.fixture
def sample_payload() -> dict:
    """A canonical valid /api/predict payload reused by several tests."""
    return {
        "tanggal": "2025-05-12",
        "jam": 19,
        "suhu_celsius": 30.0,
        "hari_libur": 0,
        "jumlah_penghuni": 4,
        "jumlah_perangkat_aktif": 9,
        "jam_penggunaan_rata_rata": 8.0,
        "konsumsi_7_hari_terakhir": [17.0, 18.0, 17.5, 18.5, 17.0, 18.0, 17.5],
    }
