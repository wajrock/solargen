# SERVICES
from app.services.weather_service import weather_service
from app.services.model_service import get_model_infos
from app.services.installation_service import get_installation_infos
from app.services.prediction_service import build_predictions
from app.services.auth import verify_token

# FASTAPI
from fastapi import FastAPI, HTTPException, Depends
from contextlib import asynccontextmanager
from dotenv import load_dotenv
load_dotenv()

# MODELS
from app.models import PredictionsResponse, ModelInfoResponse, InstallationResponse

# MISC
import joblib
import pandas as pd

ml_modules = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    ml_modules["model"]      = joblib.load("model/model_solar_prediction.pkl")
    ml_modules["model_info"] = joblib.load("model/model_info.pkl")
    ml_modules["sites"]      = pd.read_csv("data/sites_final.csv").to_dict("records")
    yield
    ml_modules.clear()

app = FastAPI(
    title="SolarGen ML Service",
    description="Solar power prediction API for RMIT Bundoora Campus — 21 sites — LightGBM R²=0.887",
    version="1.0.0",
    lifespan=lifespan,
)

@app.get("/model-infos", response_model=ModelInfoResponse, summary="Model metadata and performance metrics", dependencies=[Depends(verify_token)])
def model_infos():
    infos = ml_modules["model_info"]
    return get_model_infos(infos)

@app.get("/installation", response_model=InstallationResponse, summary="List of all 21 sites with their metadata", dependencies=[Depends(verify_token)])
def get_installation():
    sites = ml_modules["sites"]
    return get_installation_infos(sites)

@app.get("/predictions", response_model=PredictionsResponse, summary="Hourly solar power predictions for the current day", dependencies=[Depends(verify_token)])
def get_predictions():
    try:
        return build_predictions(ml_modules,weather_service.get_forecast())
    except Exception:
        raise HTTPException(status_code=500, detail="Une erreur est survenue.")


@app.get("/predictions/{date}", response_model=PredictionsResponse, summary="Hourly solar power predictions for a specific date (YYYY-MM-DD)", dependencies=[Depends(verify_token)])
def get_predictions_by_date(date: str):
    try:
        return build_predictions(ml_modules,weather_service.get_forecast(date_str=date))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Une erreur est survenue.")