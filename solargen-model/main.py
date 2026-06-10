# main.py
from fastapi import FastAPI, HTTPException, Query
from contextlib import asynccontextmanager
from collections import defaultdict
import joblib
import numpy as np
from app.services.weather_service import weather_service

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
    try:
        ml_modules["model"]         = joblib.load("model/modele_solar_prediction.pkl")
        ml_modules["features_info"] = joblib.load("model/features_info.pkl")
        print(f"✅ Modèle chargé — R²={ml_modules['features_info']['r2_final']:.4f}")
    except Exception as e:
        print(f"❌ {str(e)}")
        raise e
    yield
    ml_modules.clear()

app = FastAPI(title="SolarGen API", version="2.0.0", lifespan=lifespan)


@app.get("/health")
def health():
    info = ml_modules.get("features_info", {})
    return {
        "status":    "ok",
        "model":     info.get("best_model"),
        "r2":        info.get("r2_final"),
        "mae":       info.get("mae_final"),
        "train_end": info.get("date_train_end"),
    }


@app.get("/api/solar/predictions")
def get_predictions(
    site_name: str  = Query("Campus La Trobe"),
    kwp:       float = Query(...),
    date:      str  = Query(None),
):
    if "model" not in ml_modules:
        raise HTTPException(status_code=503, detail="Modèle non initialisé.")

    try:
        # 1. Météo
        df = weather_service.get_forecast(date_str=date)

        # 2. Matrice features dans l'ordre strict du notebook
        df['kwp'] = kwp
        X = df[FEATURES].values

        # 3. Inférence — GradientBoosting ne nécessite pas de scaler
        efficiencies = np.clip(
            ml_modules["model"].predict(X).flatten(),
            0, None
        )

        # 4. Groupement par jour
        predictions_by_day = defaultdict(lambda: {
            "total_production_kw": 0.0,
            "efficiencies":        [],
            "hourly_details":      [],
        })

        for idx, row in df.iterrows():
            day      = row["timestamp"].strftime("%Y-%m-%d")
            eff      = float(efficiencies[idx])
            prod_kw  = eff * kwp

            predictions_by_day[day]["total_production_kw"] += prod_kw
            predictions_by_day[day]["efficiencies"].append(eff)
            predictions_by_day[day]["hourly_details"].append({
                "hour":                  int(row["timestamp"].hour),
                "timestamp":             row["timestamp"].strftime("%Y-%m-%d %H:%M:%S"),
                "apparent_temperature":  round(float(row["apparent_temperature"]), 2),
                "relative_humidity":     round(float(row["relative_humidity"]), 2),
                "shortwave_radiation":   round(float(row["shortwave_radiation"]), 2),
                "efficiency":            round(eff, 4),
                "production_kw":         round(prod_kw, 4),
            })

        return [
            {
                "date":              day,
                "site_name":         site_name,
                "kwp":               kwp,
                "total_production_kw": round(content["total_production_kw"], 4),
                "average_efficiency":  round(float(np.mean(content["efficiencies"])), 4),
                "hourly_predictions":  content["hourly_details"],
            }
            for day, content in sorted(predictions_by_day.items())
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))