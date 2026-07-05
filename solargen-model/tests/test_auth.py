import pytest
from fastapi import HTTPException
from app.services.auth import verify_token

def test_verify_token_raises_without_key():
    with pytest.raises(HTTPException) as exc_info:
        verify_token(key=None)
    assert exc_info.value.status_code == 403

def test_verify_token_raises_with_empty_key():
    with pytest.raises(HTTPException) as exc_info:
        verify_token(key="")
    assert exc_info.value.status_code == 403

def test_verify_token_raises_with_wrong_key(monkeypatch):
    monkeypatch.setenv("FASTAPI_KEY", "correct-key")
    with pytest.raises(HTTPException) as exc_info:
        verify_token(key="wrong-key")
    assert exc_info.value.status_code == 403

def test_verify_token_passes_with_correct_key(monkeypatch):
    monkeypatch.setenv("FASTAPI_KEY", "correct-key")
    result = verify_token(key="correct-key")
    assert result is None