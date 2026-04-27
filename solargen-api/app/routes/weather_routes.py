from fastapi import APIRouter, HTTPException
from app.services.weather_service import weather_service

router = APIRouter(prefix="/api/weather", tags=["Météo"])

@router.get("/forecast/{date}")
def get_weather_forecast(date: str):
    data = weather_service.get_today_forecast()
    data = [x for x in data if date in x['timestamp']]
    
    if data is None:
       return []

    return {"count": len(data), "data": data}