from app.services.model_service import get_model_infos

def test_maps_model_infos_correctly():
    raw = {
        "cv_r2_mean": 0.887,
        "cv_mae_day": 0.064,
        "trained_from": "2020-01-08",
        "trained_to": "2022-04-23",
        "features": ["temperature", "shortwave_radiation"],
        "n_sites": 21,
    }
    result = get_model_infos(raw)
    assert result == {
        "model": "LightGBM",
        "r2": 0.887,
        "mae": 0.064,
        "train_start": "2020-01-08",
        "train_end": "2022-04-23",
        "features": ["temperature", "shortwave_radiation"],
        "sites_count": 21,
    }