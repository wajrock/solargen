def get_installation_infos(sites):
    sites_without_coords = [
        {k: v for k, v in site.items() if k not in ("latitude", "longitude")}
        for site in sites
    ]

    return {
        "name": "Bundoora",
        "latitude":  sites[0]["latitude"],
        "longitude": sites[0]["longitude"],
        "sites": sites_without_coords,
    }
 