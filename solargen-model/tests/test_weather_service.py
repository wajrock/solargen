import pytest

from app.services.weather_service import WeatherService


def test_parse_response_rejects_missing_hourly_block():
    service = WeatherService()

    with pytest.raises(ValueError, match="missing hourly data"):
        service._parse_response({})


def test_parse_response_rejects_missing_hourly_keys():
    service = WeatherService()

    with pytest.raises(ValueError, match="missing keys"):
        service._parse_response({"hourly": {"time": []}})