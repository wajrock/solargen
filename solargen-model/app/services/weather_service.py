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
        return pd.DataFrame({
            "timestamp"          : pd.to_datetime(response["hourly"]["time"]).tz_localize("Australia/Melbourne", ambiguous=False, nonexistent="shift_forward"),
            "temperature"        : response["hourly"]["temperature_2m"],
            "relative_humidity"  : response["hourly"]["relative_humidity_2m"],
            "cloud_cover"        : response["hourly"]["cloud_cover"],
            "shortwave_radiation": response["hourly"]["shortwave_radiation"],
            "diffuse_radiation"  : response["hourly"]["diffuse_radiation"],
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