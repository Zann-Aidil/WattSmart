"""Integration tests for the FastAPI backend using `httpx` TestClient."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Skip the whole module if the model has not been trained yet - the
# `/predict` endpoints depend on it.
pytestmark = pytest.mark.skipif(
    not Path("ml/models/xgboost_model.pkl").exists(),
    reason="Model artifact not trained yet - run `python ml/train.py` first.",
)


@pytest.fixture(scope="module")
def client() -> TestClient:
    from backend.main import app

    return TestClient(app)


@pytest.fixture(scope="module")
def auth_headers(client: TestClient) -> dict[str, str]:
    """Register a test user and return auth headers with a valid JWT token."""
    # Register
    client.post(
        "/api/auth/register",
        json={"username": "testuser_api", "password": "testpassword123"},
    )
    # Login (in case user already exists from a previous run)
    r = client.post(
        "/api/auth/login",
        json={"username": "testuser_api", "password": "testpassword123"},
    )
    assert r.status_code == 200, f"Login failed: {r.text}"
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health_endpoint(client: TestClient) -> None:
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is True


def test_model_info_endpoint(client: TestClient) -> None:
    r = client.get("/api/model-info")
    assert r.status_code == 200
    body = r.json()
    assert body["model_name"] == "XGBoost"
    assert body["feature_count"] >= 8
    assert "r2" in body["metrics"]


def test_predict_endpoint_returns_expected_shape(
    client: TestClient, sample_payload: dict, auth_headers: dict
) -> None:
    r = client.post("/api/predict", json=sample_payload, headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert body["tanggal"] == sample_payload["tanggal"]
    assert 0 < body["prediksi_kwh"] < 100
    assert body["estimasi_biaya_rp"] > 0
    assert body["estimasi_biaya_rp_formatted"].startswith("Rp ")
    assert body["kategori_konsumsi"] in {"rendah", "sedang", "tinggi", "sangat_tinggi"}


def test_predict_with_recommendations_endpoint(
    client: TestClient, sample_payload: dict, auth_headers: dict
) -> None:
    r = client.post(
        "/api/predict-with-recommendations", json=sample_payload, headers=auth_headers
    )
    assert r.status_code == 200
    body = r.json()
    assert "prediksi" in body
    assert "rekomendasi" in body
    assert isinstance(body["rekomendasi"]["rekomendasi"], list)
    assert len(body["rekomendasi"]["rekomendasi"]) >= 1


def test_recommend_endpoint_works_with_manual_prediction(
    client: TestClient, sample_payload: dict, auth_headers: dict
) -> None:
    payload = {**sample_payload, "prediksi_kwh": 25.0}
    r = client.post("/api/recommend", json=payload, headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert "rekomendasi" in body
    assert body["total_estimasi_hemat_rp"] >= 0


def test_recommend_endpoint_works_without_manual_prediction(
    client: TestClient, sample_payload: dict, auth_headers: dict
) -> None:
    r = client.post("/api/recommend", json=sample_payload, headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert "rekomendasi" in body


def test_predict_requires_authentication(client: TestClient, sample_payload: dict) -> None:
    """Endpoints should return 401 without a valid token."""
    r = client.post("/api/predict", json=sample_payload)
    assert r.status_code == 401


def test_predict_invalid_payload_returns_422(
    client: TestClient, auth_headers: dict
) -> None:
    r = client.post(
        "/api/predict", json={"tanggal": "2025-05-12"}, headers=auth_headers
    )
    assert r.status_code == 422


def test_predict_rejects_out_of_range_values(
    client: TestClient, sample_payload: dict, auth_headers: dict
) -> None:
    bad = {**sample_payload, "suhu_celsius": 999}
    r = client.post("/api/predict", json=bad, headers=auth_headers)
    assert r.status_code == 422


def test_predict_with_empty_history(
    client: TestClient, sample_payload: dict, auth_headers: dict
) -> None:
    payload = {**sample_payload, "konsumsi_7_hari_terakhir": []}
    r = client.post("/api/predict", json=payload, headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert body["rata_rata_historis_kwh"] is None


def test_history_endpoint_with_pagination(
    client: TestClient, auth_headers: dict
) -> None:
    """History endpoint should return paginated results."""
    r = client.get("/api/history?limit=5&offset=0", headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert "data" in body
    assert "total" in body
    assert body["limit"] == 5
    assert body["offset"] == 0


def test_auth_register_and_login(client: TestClient) -> None:
    """Test the full auth flow: register, login, and /me."""
    import uuid

    username = f"testuser_{uuid.uuid4().hex[:8]}"
    # Register
    r = client.post(
        "/api/auth/register",
        json={"username": username, "password": "securepass123"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["username"] == username
    assert "access_token" in body

    # Login
    r = client.post(
        "/api/auth/login",
        json={"username": username, "password": "securepass123"},
    )
    assert r.status_code == 200
    token = r.json()["access_token"]

    # /me
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["username"] == username


def test_cors_header_present(
    client: TestClient, sample_payload: dict, auth_headers: dict
) -> None:
    """Verify CORS allow-origin header is set for whitelisted origins."""
    r = client.post(
        "/api/predict",
        json=sample_payload,
        headers={**auth_headers, "Origin": "http://localhost:5173"},
    )
    assert r.status_code == 200
    assert r.headers.get("access-control-allow-origin") == "http://localhost:5173"
