from fastapi import APIRouter, HTTPException, status
from app.schemas.restaurant_schema import RestaurantSignup, RestaurantLogin
from app.database import db

router = APIRouter()

@router.post("/restaurant/signup", status_code=status.HTTP_201_CREATED)
async def restaurant_signup(payload: RestaurantSignup):
    # Check if email already exists
    existing = await db.restaurants.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Insert restaurant record directly (no password hashing)
    await db.restaurants.insert_one({
        "restaurant_name": payload.restaurant_name,
        "email": payload.email,
        "password": payload.password,      # stored as plain text
        "phone_number": payload.phone_number,
        "address": payload.address
    })

    return {"msg": "Signup successful"}


@router.post("/restaurant/login")
async def restaurant_login(payload: RestaurantLogin):
    user = await db.restaurants.find_one({"email": payload.email})
    if not user or payload.password != user["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"msg": "Login successful"}
