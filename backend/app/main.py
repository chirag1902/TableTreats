# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_customer, customer_restaurant_router, reservation_router, deals, bill_router

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_customer.router, prefix="/auth", tags=["Auth"])
app.include_router(customer_restaurant_router.router, tags=["Customer-Restaurants"])
app.include_router(reservation_router.router, prefix="/api", tags=["Reservations"])
app.include_router(deals.router, prefix="/api", tags=["Deals"])
app.include_router(bill_router.router, prefix="/api", tags=["Bills"])

@app.get("/")
async def root():
    return {"message": "Restaurant Reservation API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}