import re

def parse_inverters(inverter_string: str) -> list:
    pattern = r'(\d+)\s*[xX]\s*([^+]+)'
    matches = re.findall(pattern, inverter_string or "")
    
    inverters = []

    for quantity, model in matches:
        inverters.append({"model": model.strip(), "quantity": int(quantity)})
    return inverters

def get_installation_infos(sites: list) -> dict:
    parsed_sites = []
    
    for site in sites:
        parsed_site = {k: v for k, v in site.items() if k not in ("latitude", "longitude", "inverter_model")}
        parsed_site["inverters"] = parse_inverters(site.get("inverter_model", ""))
        parsed_sites.append(parsed_site)

    return {
        "name": "Bundoora",
        "latitude": sites[0]["latitude"],
        "longitude": sites[0]["longitude"],
        "sites": parsed_sites,
    }