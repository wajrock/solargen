from fastapi import APIRouter
from app.services.data_service import data_service

router = APIRouter()

@router.get("/")
async def get_sites():
    try:
        sites = data_service.get_all_sites()
        return {"count": len(sites), "data": sites}
    except Exception as e:
        return []