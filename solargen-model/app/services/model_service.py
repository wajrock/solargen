def get_model_infos(model_infos):
    return {
        "model"      : model_infos["model_name"],
        "r2"         : model_infos["r2"],
        "r2_day"     : model_infos["r2_day"],
        "mae"        : model_infos["mae"],
        "mae_day"    : model_infos["mae_day"],
        "train_start": model_infos["trained_from"],
        "train_end"  : model_infos["trained_to"],
        "features"   : model_infos["features"],
        "sites_count": model_infos["sites_count"],
    }