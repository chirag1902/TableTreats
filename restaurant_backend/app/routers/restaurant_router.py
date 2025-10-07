from fastapi import APIRouter, HTTPException, status
from app.schemas.restaurant_schema import RestaurantSignup, RestaurantLogin
from app.database import db
from passlib.hash import bcrypt

router = APIRouter()

@router.post("/restaurant/signup", status_code=status.HTTP_201_CREATED)
async def restaurant_signup(payload: RestaurantSignup):
    existing = await db.restaurants.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    await db.restaurants.insert_one({
        "name": payload.name,
        "email": payload.email,
        "password": payload.password
    })
    return {"msg": "Signup successful"}

@router.post("/restaurant/login")
async def restaurant_login(payload: RestaurantLogin):
    user = await db.restaurants.find_one({"email": payload.email})
    if not user or payload.password != user["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"msg": "Login successful"}
