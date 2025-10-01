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


@router.post("/restaurant_owners/signup", response_model=RestaurantOwnerOut)
async def restaurant_owner_signup(owner: RestaurantOwnerSignup):
    new_owner = await restaurant_service.create_owner(owner.dict())
    if not new_owner:
        raise HTTPException(status_code=400, detail="Email already registered")
    return new_owner

@router.post("/restaurant_owners/login")
async def restaurant_owner_login(owner: RestaurantOwnerLogin):
    session = await restaurant_service.owner_login(owner.email, owner.password)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return session
