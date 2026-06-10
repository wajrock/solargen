# app/services/weather_service.py
import numpy as np
import pandas as pd
import openmeteo_requests
import requests_cache
from retry_requests import retry

class WeatherService:
    def __init__(self):
        self.lat          = -37.71828652
        self.lon          =  145.0509752
        self.forecast_url = "https://api.open-meteo.com/v1/forecast"
        self.archive_url  = "https://archive-api.open-meteo.com/v1/archive"

        cache_session  = requests_cache.CachedSession('.cache', expire_after=3600)
        retry_session  = retry(cache_session, retries=5, backoff_factor=0.2)
        self.openmeteo = openmeteo_requests.Client(session=retry_session)

        self.hourly_vars = [
            "apparent_temperature",
            "relative_humidity_2m",
            "dew_point_2m",
            "shortwave_radiation",
        ]

    def get_forecast(self, date_str: str = None) -> pd.DataFrame:
        """
        date_str=None        → prévisions 7 jours (production)
        date_str='YYYY-MM-DD' → archive historique (test)
        """
        if date_str:
            url    = self.archive_url
            params = {
                "latitude":   self.lat,
                "longitude":  self.lon,
                "start_date": date_str,
                "end_date":   date_str,
                "hourly":     self.hourly_vars,
                "timezone": "Australia/Melbourne",
            }
        else:
            url    = self.forecast_url
            params = {
                "latitude":      self.lat,
                "longitude":     self.lon,
                "hourly":        self.hourly_vars,
                "timezone":      "Australia/Melbourne",
                "forecast_days": 7,
            }

        response = self.openmeteo.weather_api(url, params=params)[0]
        hourly   = response.Hourly()

        timestamps = pd.date_range(
            start=pd.to_datetime(hourly.Time(),    unit="s", utc=True),
            end=  pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=hourly.Interval()),
            inclusive="left",
        ).tz_convert("Australia/Melbourne")

        df = pd.DataFrame({
            "timestamp":            timestamps,
            "apparent_temperature": hourly.Variables(0).ValuesAsNumpy(),
            "relative_humidity":    hourly.Variables(1).ValuesAsNumpy(),
            "dew_point_temperature":hourly.Variables(2).ValuesAsNumpy(),
            "shortwave_radiation":  hourly.Variables(3).ValuesAsNumpy(),
        })

       

        df['h_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.hour  / 24)
        df['h_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.hour  / 24)
        df['m_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.month / 12)
        df['m_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.month / 12)

        return df


weather_service = WeatherService()