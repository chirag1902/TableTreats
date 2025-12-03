from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_customer, customer_restaurant_router, reservation_router, restaurant_router  # Add restaurant_router

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
app.include_router(reservation_router.router, prefix="/api", tags=["Reservations"])
app.include_router(restaurant_router.router, prefix="/api", tags=["Restaurant"])  # Add this line!

@app.get("/")
async def root():
    return {"message": "TableTreats API is running"}