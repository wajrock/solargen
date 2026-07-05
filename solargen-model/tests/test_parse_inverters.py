from app.services.installation_service import parse_inverters

def test_single_inverter():
    result = parse_inverters("1 x SolarEdge SE82.8K")
    assert result == [{"model": "SolarEdge SE82.8K", "quantity": 1}]

def test_multiple_inverters():
    result = parse_inverters("2 x SolarEdge SE25K + 1 x SolarEdge SE15K")
    assert result == [
        {"model": "SolarEdge SE25K", "quantity": 2},
        {"model": "SolarEdge SE15K", "quantity": 1},
    ]

def test_empty_string_returns_empty_list():
    assert parse_inverters("") == []

def test_none_returns_empty_list():
    assert parse_inverters(None) == []

def test_case_insensitive_x():
    result = parse_inverters("3 X ABB")
    assert result == [{"model": "ABB", "quantity": 3}]