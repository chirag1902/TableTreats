from fastapi import APIRouter, HTTPException, Depends
from schemas.user_schema import CustomerSignup, CustomerLogin, CustomerOut, TokenResponse
from services import user_service
from utils.auth import get_current_customer

router = APIRouter()

@router.post("/customers/signup", response_model=CustomerOut)
async def customer_signup(user: CustomerSignup):
    """Register a new customer"""
    new_user = await user_service.create_customer(user.dict())
    if not new_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return new_user

@router.post("/customers/login", response_model=TokenResponse)
async def customer_login(user: CustomerLogin):
    """Login and get JWT token"""
    token_data = await user_service.customer_login(user.email, user.password)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return token_data

@router.get("/customers/me", response_model=CustomerOut)
async def get_current_customer_profile(current_user: dict = Depends(get_current_customer)):
    """Get current logged-in customer's profile (Protected Route)"""
    user = await user_service.get_customer_by_email(current_user["email"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/customers/protected")
async def protected_route(current_user: dict = Depends(get_current_customer)):
    """Example of a protected route that requires authentication"""
    return {
        "message": "This is a protected route",
        "user": current_user["email"],
        "role": current_user["role"]
    }

