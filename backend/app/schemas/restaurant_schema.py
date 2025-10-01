from pydantic import BaseModel, EmailStr
from typing import Optional

class RestaurantSignup(BaseModel):
    email: EmailStr
    password: str
    restaurant_name: str
    phone_number: Optional[str] = None
    address: Optional[str] = None

class RestaurantLogin(BaseModel):
    email: EmailStr
    password: str

class RestaurantOut(BaseModel):
    id: str
    email: EmailStr
    restaurant_name: str
    registered_at: str
