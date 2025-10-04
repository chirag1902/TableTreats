from fastapi import APIRouter, HTTPException
from schemas.user_schema import CustomerSignup, CustomerLogin, CustomerOut
from schemas.restaurant_schema import RestaurantLogin, RestaurantOut, RestaurantSignup
from services import user_service

router = APIRouter()

@router.post("/customers/signup", response_model=CustomerOut)
async def customer_signup(user: CustomerSignup):
    new_user = await user_service.create_customer(user.dict())
    if not new_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return new_user

@router.post("/customers/login")
async def customer_login(user: CustomerLogin):
    session = await user_service.customer_login(user.email, user.password)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return session
