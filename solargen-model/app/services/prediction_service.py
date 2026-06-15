from datetime import datetime
import numpy as np

FEATURES = [
    'apparent_temperature',
    'relative_humidity',
    'dew_point_temperature',
    'shortwave_radiation',
    'h_sin', 'h_cos',
    'm_sin', 'm_cos',
    'kwp',
]

def build_predictions(ml_modules, df_weather) -> dict:
    sites = ml_modules["features_info"]["sites"]

    weather_hours = [
        {
            "timestamp":             row["timestamp"].strftime("%Y-%m-%dT%H:%M:%S"),
            "apparent_temperature":  round(float(row["apparent_temperature"]), 2),
            "relative_humidity":     round(float(row["relative_humidity"]), 2),
            "dew_point_temperature": round(float(row["dew_point_temperature"]), 2),
            "shortwave_radiation":   round(float(row["shortwave_radiation"]), 2),
        }
        for _, row in df_weather.iterrows()
    ]

    sites_predictions = []
    for site in sites:
        kwp = site["kwp"]

        df_input = df_weather.copy()
        df_input["kwp"] = kwp

        efficiencies = np.clip(
            ml_modules["model"].predict(df_input[FEATURES].values).flatten(),
            0, None
        )

        hours = []
        for i, (_, row) in enumerate(df_weather.iterrows()):
            eff = float(efficiencies[i]) if row["shortwave_radiation"] > 0 else 0.0
            hours.append({
                "timestamp":     row["timestamp"].strftime("%Y-%m-%dT%H:%M:%S"),
                "efficiency":    round(eff, 4),
                "production_kw": round(eff * kwp, 4),
            })

        sites_predictions.append({
            "site_id":             site["id"],
            "site_key":            site["site_key"],
            "kwp":                 kwp,
            "total_production_kw": round(sum(h["production_kw"] for h in hours), 4),
            "productions":         hours,
        })

    return {
        "date":       df_weather["timestamp"].iloc[0].strftime("%Y-%m-%dT%H:%M:%S"),
        "fetched_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "weather":    weather_hours,
        "sites":      sites_predictions,
    }