from fastapi import FastAPI
from app.routers.restaurant_router import router as restaurant_router

app = FastAPI()

app.include_router(restaurant_router)

@app.get("/")
async def root():
    return {"message": "Restaurant backend is running"}

