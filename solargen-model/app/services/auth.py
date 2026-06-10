import os 
from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def verify_token(key: str = Security(api_key_header)):
    if not key or key != os.getenv("FASTAPI_KEY"):
        raise HTTPException(
            status_code=403,
            detail="Invalid or missing API key"
        )