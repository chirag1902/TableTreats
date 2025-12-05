from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_customer, customer_restaurant_router, reservation_router  # Add this

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_customer.router, prefix="/auth", tags=["Auth"])
app.include_router(customer_restaurant_router.router, tags=["Customer-Restaurants"])
app.include_router(reservation_router.router, prefix="/api", tags=["Reservations"])  # Add this