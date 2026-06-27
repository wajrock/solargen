from typing import List
from pydantic import BaseModel


class WeatherHour(BaseModel):
    timestamp:           str
    temperature:         float
    relative_humidity:   float
    cloud_cover:         float
    shortwave_radiation: float
    diffuse_radiation:   float


class Production(BaseModel):
    timestamp:        str
    capacity_factor:  float
    solar_generation: float


class SitePrediction(BaseModel):
    site_id:                str
    kwp:                    float
    total_solar_generation: float
    productions:            List[Production]


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
    sites_count: int


class Inverter(BaseModel):
    model:    str
    quantity: int


class Site(BaseModel):
    id:          str
    kwp:         float
    panel_count: float
    panel_model: str
    inverters:   List[Inverter]

class InstallationResponse(BaseModel):
    name:      str
    latitude:  float
    longitude: float
    sites:     List[Site]