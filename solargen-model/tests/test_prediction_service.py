import pandas as pd
import numpy as np
from unittest.mock import MagicMock
from app.services.prediction_service import build_predictions

def make_mock_weather(hours_data):
    return pd.DataFrame(hours_data)

def test_night_hours_force_capacity_factor_to_zero():
    weather = make_mock_weather([{
        "timestamp": pd.Timestamp("2026-06-15 02:00:00"),
        "temperature": 10.0,
        "relative_humidity": 90.0,
        "cloud_cover": 50.0,
        "shortwave_radiation": 0.0,
        "diffuse_radiation": 0.0,
    }])

    mock_model = MagicMock()
    mock_model.predict.return_value = np.array([0.15])

    ml_modules = {
        "model": mock_model,
        "sites": [{"id": "TEST01", "site_key": 1, "kwp": 50.0}],
    }

    result = build_predictions(ml_modules, weather)

    assert result["sites"][0]["productions"][0]["capacity_factor"] == 0.0
    assert result["sites"][0]["productions"][0]["solar_generation"] == 0.0

def test_day_hours_keep_predicted_capacity_factor():
    weather = make_mock_weather([{
        "timestamp": pd.Timestamp("2026-06-15 13:00:00"),
        "temperature": 20.0,
        "relative_humidity": 60.0,
        "cloud_cover": 30.0,
        "shortwave_radiation": 500.0,
        "diffuse_radiation": 100.0,
    }])

    mock_model = MagicMock()
    mock_model.predict.return_value = np.array([0.3])

    ml_modules = {
        "model": mock_model,
        "sites": [{"id": "TEST01", "site_key": 1, "kwp": 50.0}],
    }

    result = build_predictions(ml_modules, weather)

    assert result["sites"][0]["productions"][0]["capacity_factor"] == 0.3
    assert result["sites"][0]["productions"][0]["solar_generation"] == 15.0

def test_total_solar_generation_sums_all_hours():
    weather = make_mock_weather([
        {"timestamp": pd.Timestamp("2026-06-15 12:00:00"), "temperature": 20.0,
         "relative_humidity": 60.0, "cloud_cover": 30.0,
         "shortwave_radiation": 400.0, "diffuse_radiation": 80.0},
        {"timestamp": pd.Timestamp("2026-06-15 13:00:00"), "temperature": 21.0,
         "relative_humidity": 58.0, "cloud_cover": 25.0,
         "shortwave_radiation": 450.0, "diffuse_radiation": 90.0},
    ])

    mock_model = MagicMock()
    mock_model.predict.return_value = np.array([0.2, 0.3])

    ml_modules = {
        "model": mock_model,
        "sites": [{"id": "TEST01", "site_key": 1, "kwp": 100.0}],
    }

    result = build_predictions(ml_modules, weather)

    assert result["sites"][0]["total_solar_generation"] == 50.0