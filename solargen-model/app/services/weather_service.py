# app/services/weather_service.py
import numpy as np
import pandas as pd
import openmeteo_requests
import requests
from retry_requests import retry

class WeatherService:
    def __init__(self):
        self.lat          = -37.71828652
        self.lon          =  145.0509752
        self.forecast_url = "https://api.open-meteo.com/v1/forecast"
        self.archive_url  = "https://archive-api.open-meteo.com/v1/archive"
        self.hourly_vars  = [
            "apparent_temperature",
            "relative_humidity_2m",
            "dew_point_2m",
            "shortwave_radiation",
        ]

        session        = requests.Session()
        retry_session  = retry(session, retries=5, backoff_factor=0.2)
        self.openmeteo = openmeteo_requests.Client(session=retry_session)

    def _parse_response(self, response) -> pd.DataFrame:
        """Parse OpenMeteo response into a clean DataFrame."""
        
        df = pd.DataFrame({
            "timestamp":             pd.to_datetime(response["hourly"]["time"]).tz_localize("Australia/Melbourne", ambiguous=False, nonexistent='shift_forward'),
            "apparent_temperature":  response["hourly"]["apparent_temperature"],
            "relative_humidity":     response["hourly"]["relative_humidity_2m"],
            "dew_point_temperature": response["hourly"]["dew_point_2m"],
            "shortwave_radiation":   response["hourly"]["shortwave_radiation"],
        })

        df['h_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.hour  / 24)
        df['h_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.hour  / 24)
        df['m_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.month / 12)
        df['m_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.month / 12)

        return df

    def get_forecast(self, date_str: str = None) -> pd.DataFrame:
        if date_str:
            params = {
                "latitude":   self.lat,
                "longitude":  self.lon,
                "hourly":     self.hourly_vars,
                "timezone":   "Australia/Melbourne",
                "start_date": date_str,
                "end_date":   date_str,
            }
            response = requests.get(self.archive_url, params=params).json()
        else:
            params = {
                "latitude":      self.lat,
                "longitude":     self.lon,
                "hourly":        self.hourly_vars,
                "timezone":      "Australia/Melbourne",
                "forecast_days": 1,
            }
            response = requests.get(self.forecast_url, params=params).json()

        return self._parse_response(response)


weather_service = WeatherService()