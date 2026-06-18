def get_model_infos(model_infos):
    return {
        "model"      : "LightGBM",
        "r2"         : model_infos["cv_r2_mean"],
        "mae"        : model_infos["cv_mae_day"],
        "train_start": model_infos["trained_from"],
        "train_end"  : model_infos["trained_to"],
        "features"   : model_infos["features"],
        "sites_count": model_infos["n_sites"],
    }