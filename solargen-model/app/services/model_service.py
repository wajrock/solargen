def get_model_infos(model_infos):
    return {
        "model":        model_infos["best_model"],
        "r2":           round(model_infos["r2_final"],4),
        "mae":          round(model_infos["mae_final"],4),
        "train_start":  model_infos["date_train_start"],
        "train_end":    model_infos["date_train_end"],
        "features":     model_infos["features"],
        "hyperparams":  model_infos["hyperparams"],
        "sites_count":  len(model_infos["sites"]),
    }
 