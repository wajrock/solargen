import pytest

from app.services.installation_service import get_installation_infos


def test_get_installation_infos_rejects_empty_site_list():
    with pytest.raises(ValueError, match="No installation sites available"):
        get_installation_infos([])