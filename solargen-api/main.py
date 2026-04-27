from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import sites_routes, weather_routes

app = FastAPI(title="SolarGen API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sites_routes.router, prefix="/api/sites", tags=["Sites"])
app.include_router(weather_routes.router)

@app.get("/")
async def root():
    return {"message": "SolarGen API is running"}