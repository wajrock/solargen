# app/models.py
from typing import List
from pydantic import BaseModel


class WeatherHour(BaseModel):
    timestamp:              str
    apparent_temperature:  float
    relative_humidity:     float
    dew_point_temperature: float
    shortwave_radiation:   float


class Production(BaseModel):
    timestamp:     str
    efficiency:    float
    production_kw: float


class SitePrediction(BaseModel):
    site_id:             str
    kwp:                 float
    total_production_kw: float
    productions:         List[Production]


class PredictionsResponse(BaseModel):
    date:       str
    fetched_at: str
    weather:    List[WeatherHour]
    sites:      List[SitePrediction]

class ModelInfoResponse(BaseModel):
    model:       str
    r2:          float
    mae:         float
    train_start: str
    train_end:   str
    features:    List[str]
    hyperparams: dict
    sites_count: int

class Site(BaseModel):
    id:             str
    kwp:            float
    panel_count:    float
    panel_model:    str
    inverter_model: str

class InstallationResponse(BaseModel):
    name:       str
    latitude:   float
    longitude:  float
    sites:      List[Site]