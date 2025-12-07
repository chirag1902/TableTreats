# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routers import restaurant_router, reservation_router
#from app.routers.reservation_router import router as reservation_router

app = FastAPI(title="TableTreats Restaurant API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# # Create uploads directory if it doesn't exist
# os.makedirs("uploads/restaurants", exist_ok=True)

# # Serve static files (uploaded images)
# app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(restaurant_router.router, prefix="/api", tags=["Restaurant"])
app.include_router(reservation_router.router, prefix="/api", tags=["Reservations"])

@app.get("/")
def root():
    return {"message": "TableTreats Restaurant API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}