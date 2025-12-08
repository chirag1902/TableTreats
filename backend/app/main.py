# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_customer, customer_restaurant_router, reservation_router, deals

app = FastAPI(
    title="Restaurant Reservation API",
    description="API for restaurant reservations with bills and payments",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_customer.router, prefix="/auth", tags=["Auth"])
app.include_router(customer_restaurant_router.router, tags=["Customer-Restaurants"])
app.include_router(reservation_router.router, prefix="/api", tags=["Reservations & Bills"])
app.include_router(deals.router, prefix="/api", tags=["Deals"])

@app.get("/")
async def root():
    """Root endpoint - API status"""
    return {
        "message": "Restaurant Reservation API", 
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}