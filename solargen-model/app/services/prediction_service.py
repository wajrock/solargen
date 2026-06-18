from datetime import datetime
import numpy as np

FEATURES = [
    'temperature',
    'relative_humidity',
    'cloud_cover',
    'shortwave_radiation',
    'diffuse_radiation',
    'hour_sin', 'hour_cos',
    'month_sin', 'month_cos',
    'kwp',
]

def build_predictions(ml_modules, df_weather) -> dict:
    sites = ml_modules["sites"]

    df_weather = df_weather.copy()
    df_weather['hour_sin']  = np.sin(2 * np.pi * df_weather['timestamp'].dt.hour  / 24)
    df_weather['hour_cos']  = np.cos(2 * np.pi * df_weather['timestamp'].dt.hour  / 24)
    df_weather['month_sin'] = np.sin(2 * np.pi * df_weather['timestamp'].dt.month / 12)
    df_weather['month_cos'] = np.cos(2 * np.pi * df_weather['timestamp'].dt.month / 12)

    weather_hours = [
        {
            "timestamp"          : row["timestamp"].strftime("%Y-%m-%dT%H:%M:%S"),
            "temperature"        : round(float(row["temperature"]), 2),
            "relative_humidity"  : round(float(row["relative_humidity"]), 2),
            "cloud_cover"        : round(float(row["cloud_cover"]), 2),
            "shortwave_radiation": round(float(row["shortwave_radiation"]), 2),
            "diffuse_radiation"  : round(float(row["diffuse_radiation"]), 2),
        }
        for _, row in df_weather.iterrows()
    ]

    sites_predictions = []
    for site in sites:
        kwp = site["kwp"]

        df_input = df_weather.copy()
        df_input["kwp"] = kwp

        capacity_factors = np.clip(
            ml_modules["model"].predict(df_input[FEATURES].values).flatten(),
            0, None
        )

        hours = []
        for i, (_, row) in enumerate(df_weather.iterrows()):
            cf = round(float(capacity_factors[i]), 4)
            is_night = row["shortwave_radiation"] == 0 and row["diffuse_radiation"] == 0
            cf = 0.0 if is_night else cf

            hours.append({
                "timestamp"       : row["timestamp"].strftime("%Y-%m-%dT%H:%M:%S"),
                "capacity_factor" : cf,
                "solar_generation": round(cf * kwp, 4),
            })

        sites_predictions.append({
            "site_id"               : site["id"],
            "site_key"              : site["site_key"],
            "kwp"                   : kwp,
            "total_solar_generation": round(sum(h["solar_generation"] for h in hours), 4),
            "productions"           : hours,
        })

    return {
        "date"      : df_weather["timestamp"].iloc[0].strftime("%Y-%m-%dT%H:%M:%S"),
        "fetched_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "weather"   : weather_hours,
        "sites"     : sites_predictions,
    }