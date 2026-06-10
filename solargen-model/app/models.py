# app/models.py
from typing import List
from pydantic import BaseModel


class WeatherHour(BaseModel):
    hour:                  str
    apparent_temperature:  float
    relative_humidity:     float
    dew_point_temperature: float
    shortwave_radiation:   float


class PredictionHour(BaseModel):
    hour:          str
    efficiency:    float
    production_kw: float


class SitePrediction(BaseModel):
    site_id:             str
    kwp:                 float
    total_production_kw: float
    hours:               List[PredictionHour]


class PredictionsResponse(BaseModel):
    date:       str
    fetched_at: str
    weather:    List[WeatherHour]
    sites:      List[SitePrediction]


class ModelInfoResponse(BaseModel):
    model:       str
    r2:          float
    mae:         float
    train_end:   str
    features:    List[str]
    hyperparams: dict
    sites_count: int

class Site(BaseModel):
    id:             str
    kwp:            float
    latitude:       float
    longitude:      float
    panel_count:    float
    panel_model:    str
    inverter_model: str

class SitesResponse(BaseModel):
    count: int
    sites: List[Site]