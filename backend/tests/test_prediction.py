from fastapi.testclient import TestClient

from app.main import app


def test_health():
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_predict_happy_path():
    payload = {
        "location": "Wakad",
        "carpet_area_sqft": 950.0,
        "floor_num": 3,
        "bathroom": 2,
        "balcony": 1,
        "furnishing": "Semi-Furnished",
        "transaction": "Resale",
        "ownership": "Freehold",
        "facing": "East",
    }
    with TestClient(app) as client:
        response = client.post("/predict", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert "predicted_price" in body
    assert isinstance(body["predicted_price"], float)
    assert body["predicted_price"] > 0


def test_predict_invalid_input_returns_422():
    # carpet_area_sqft must be > 0, and it's missing several required fields
    payload = {
        "location": "Wakad",
        "carpet_area_sqft": -5,
    }
    with TestClient(app) as client:
        response = client.post("/predict", json=payload)
    assert response.status_code == 422
