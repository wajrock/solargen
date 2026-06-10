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
        hourly = response.Hourly()

        timestamps = pd.date_range(
            start=pd.to_datetime(hourly.Time(),    unit="s", utc=True),
            end=  pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=hourly.Interval()),
            inclusive="left",
        ).tz_convert("Australia/Melbourne")

        df = pd.DataFrame({
            "timestamp":             timestamps,
            "apparent_temperature":  hourly.Variables(0).ValuesAsNumpy(),
            "relative_humidity":     hourly.Variables(1).ValuesAsNumpy(),
            "dew_point_temperature": hourly.Variables(2).ValuesAsNumpy(),
            "shortwave_radiation":   hourly.Variables(3).ValuesAsNumpy(),
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
            response = self.openmeteo.weather_api(self.archive_url, params=params)[0]
        else:
            params = {
                "latitude":      self.lat,
                "longitude":     self.lon,
                "hourly":        self.hourly_vars,
                "timezone":      "Australia/Melbourne",
                "forecast_days": 1,
            }
            response = self.openmeteo.weather_api(self.forecast_url, params=params)[0]

        return self._parse_response(response)


weather_service = WeatherService()