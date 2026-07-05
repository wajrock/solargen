import pandas as pd
import requests
from retry_requests import retry

class WeatherService:
    def __init__(self):
        self.lat          = -37.71828652
        self.lon          =  145.0509752
        self.forecast_url = "https://api.open-meteo.com/v1/forecast"
        self.archive_url  = "https://archive-api.open-meteo.com/v1/archive"
        self.hourly_vars  = [
            "temperature_2m",
            "relative_humidity_2m",
            "cloud_cover",
            "shortwave_radiation",
            "diffuse_radiation",
        ]
        self.session = retry(requests.Session(), retries=5, backoff_factor=0.2)

    def _parse_response(self, response) -> pd.DataFrame:
        if not isinstance(response, dict) or "hourly" not in response:
            raise ValueError("Invalid Open-Meteo response: missing hourly data")

        hourly = response["hourly"]
        required_keys = (
            "time",
            "temperature_2m",
            "relative_humidity_2m",
            "cloud_cover",
            "shortwave_radiation",
            "diffuse_radiation",
        )

        missing_keys = [key for key in required_keys if key not in hourly]
        if missing_keys:
            raise ValueError(f"Invalid Open-Meteo response: missing keys {missing_keys}")

        return pd.DataFrame({
            "timestamp"          : pd.to_datetime(hourly["time"]),
            "temperature"        : hourly["temperature_2m"],
            "relative_humidity"  : hourly["relative_humidity_2m"],
            "cloud_cover"        : hourly["cloud_cover"],
            "shortwave_radiation": hourly["shortwave_radiation"],
            "diffuse_radiation"  : hourly["diffuse_radiation"],
        })

    def get_forecast(self, date_str: str = None) -> pd.DataFrame:
        if date_str:
            params = {
                "latitude"  : self.lat,
                "longitude" : self.lon,
                "hourly"    : self.hourly_vars,
                "timezone"  : "Australia/Melbourne",
                "start_date": date_str,
                "end_date"  : date_str,
            }
            response = self.session.get(self.archive_url, params=params).json()
        else:
            params = {
                "latitude"      : self.lat,
                "longitude"     : self.lon,
                "hourly"        : self.hourly_vars,
                "timezone"      : "Australia/Melbourne",
                "forecast_days" : 1,
            }
            response = self.session.get(self.forecast_url, params=params).json()

        return self._parse_response(response)


weather_service = WeatherService()