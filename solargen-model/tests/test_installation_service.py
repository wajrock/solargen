from app.services.installation_service import get_installation_infos

def test_removes_coordinates_and_raw_inverter_model():
    sites = [{
        "id": "0Y6D", "kwp": 94.24, "latitude": -37.7, "longitude": 145.0,
        "inverter_model": "1 x SolarEdge SE82.8K",
    }]
    result = get_installation_infos(sites)
    site = result["sites"][0]
    assert "latitude" not in site
    assert "longitude" not in site
    assert "inverter_model" not in site
    assert site["inverters"] == [{"model": "SolarEdge SE82.8K", "quantity": 1}]

def test_uses_first_site_coordinates_for_installation():
    sites = [
        {"id": "A", "kwp": 10, "latitude": -37.7, "longitude": 145.0, "inverter_model": ""},
        {"id": "B", "kwp": 20, "latitude": -38.0, "longitude": 146.0, "inverter_model": ""},
    ]
    result = get_installation_infos(sites)
    assert result["latitude"] == -37.7
    assert result["longitude"] == 145.0