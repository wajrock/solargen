import pandas as pd
import openmeteo_requests
import requests_cache
from retry_requests import retry

class WeatherService:
    def __init__(self):
        self.lat = -37.71828652
        self.lon = 145.0509752
        self.url = "https://api.open-meteo.com/v1/forecast"

        self.cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
        self.retry_session = retry(self.cache_session, retries=5, backoff_factor=0.2)
        self.openmeteo = openmeteo_requests.Client(session=self.retry_session)
    
    def get_today_forecast(self):
        params = {
            "latitude": self.lat,
            "longitude": self.lon,
            "minutely_15": ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "dew_point_2m"],
            "timezone": "Australia/Sydney",
            "forecast_days": 2
        }

        responses = self.openmeteo.weather_api(self.url, params=params)
        response = responses[0]

        minutely_15 = response.Minutely15()
        
        temp = minutely_15.Variables(0).ValuesAsNumpy()
        humidity = minutely_15.Variables(1).ValuesAsNumpy()
        apparent_temp = minutely_15.Variables(2).ValuesAsNumpy()
        dew_point = minutely_15.Variables(3).ValuesAsNumpy()

        data_times = pd.date_range(
            start=pd.to_datetime(minutely_15.Time(), unit="s", utc=True),
            end=pd.to_datetime(minutely_15.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=minutely_15.Interval()),
            inclusive="left"
        ).tz_convert("Australia/Sydney")

        data = []
        for i in range(len(data_times)):
            data.append({
                "timestamp": data_times[i].strftime("%Y-%m-%d %H:%M:%S"),
                "temperature": float(temp[i]),
                "relativeHumidity": float(humidity[i]),
                "apparentTemperature": float(apparent_temp[i]),
                "dewPoint": float(dew_point[i])
            })

        return data
        
weather_service = WeatherService()