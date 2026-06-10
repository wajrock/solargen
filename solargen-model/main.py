from contextlib import asynccontextmanager
from datetime import datetime
from app.services.weather_service import weather_service
from app.models import PredictionsResponse, ModelInfoResponse, SitesResponse
from fastapi import FastAPI, HTTPException, Depends
from app.services.auth import verify_token

import joblib
import numpy as np
import pandas as pd

ml_modules = {}

FEATURES = [
    'apparent_temperature',
    'relative_humidity',
    'dew_point_temperature',
    'shortwave_radiation',
    'h_sin', 'h_cos',
    'm_sin', 'm_cos',
    'kwp',
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    ml_modules["model"]         = joblib.load("model/model_solar_prediction.pkl")
    ml_modules["features_info"] = joblib.load("model/features_info.pkl")
    ml_modules["sites"]         = pd.read_csv("data/sites_final.csv").to_dict("records")
    yield
    ml_modules.clear()


app = FastAPI(
    title="SolarGen ML Service",
    description="Solar power prediction API for RMIT Bundoora Campus — 25 sites — GradientBoosting R²=0.867",
    version="1.0.0",
    lifespan=lifespan,
)


def _build_predictions(df) -> dict:
    """Build predictions response from a weather dataframe."""
    sites = ml_modules["features_info"]["sites"]

    weather_hours = []
    for _, row in df.iterrows():
        weather_hours.append({
            "hour":                  int(row["timestamp"].hour),
            "apparent_temperature":  round(float(row["apparent_temperature"]), 2),
            "relative_humidity":     round(float(row["relative_humidity"]), 2),
            "dew_point_temperature": round(float(row["dew_point_temperature"]), 2),
            "shortwave_radiation":   round(float(row["shortwave_radiation"]), 2),
        })

    sites_predictions = []
    for site in sites:
        kwp       = site["kwp"]
        df["kwp"] = kwp

        efficiencies = np.clip(
            ml_modules["model"].predict(df[FEATURES].values).flatten(),
            0, None
        )

        hours = []
        for i, (_, row) in enumerate(df.iterrows()):
            eff = float(efficiencies[i])
            hours.append({
                "hour":          int(row["timestamp"].hour),
                "efficiency":    round(eff, 4),
                "production_kw": round(eff * kwp, 4),
            })

        sites_predictions.append({
            "site_id":             site["id"],
            "site_key":            site["site_key"],
            "kwp":                 kwp,
            "total_production_kw": round(sum(h["production_kw"] for h in hours), 4),
            "hours":               hours,
        })

    return {
        "date":       df["timestamp"].iloc[0].strftime("%Y-%m-%d"),
        "fetched_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "weather":    weather_hours,
        "sites":      sites_predictions,
    }


@app.get("/model-info", response_model=ModelInfoResponse, summary="Model metadata and performance metrics", dependencies=[Depends(verify_token)])
def model_info():
    info = ml_modules["features_info"]
    return {
        "model":       info["best_model"],
        "r2":          round(info["r2_final"],4),
        "mae":         round(info["mae_final"],4),
        "train_end":   info["date_train_end"],
        "features":    info["features"],
        "hyperparams": info["hyperparams"],
        "sites_count": len(info["sites"]),
    }

@app.get("/sites", response_model=SitesResponse, summary="List of all 25 sites with their metadata", dependencies=[Depends(verify_token)])
def get_sites():
    sites = ml_modules["sites"]
    return {
        "count": len(sites),
        "sites": sites,
    }

@app.get("/predictions", response_model=PredictionsResponse, summary="Hourly solar power predictions for all 25 sites", dependencies=[Depends(verify_token)])
def get_predictions():
    try:
        return _build_predictions(weather_service.get_forecast())
    except Exception:
        raise HTTPException(status_code=500, detail="Une erreur est survenue.")


@app.get("/predictions/{date}", response_model=PredictionsResponse, summary="Hourly solar power predictions for a specific date (YYYY-MM-DD)", dependencies=[Depends(verify_token)])
def get_predictions_by_date(date: str):
    try:
        return _build_predictions(weather_service.get_forecast(date_str=date))
    except Exception:
        raise HTTPException(status_code=500, detail="Une erreur est survenue.")