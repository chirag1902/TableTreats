from pydantic import BaseModel, EmailStr
from typing import Optional

class RestaurantSignup(BaseModel):
    restaurant_name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None
    address: Optional[str] = None


class RestaurantLogin(BaseModel):
    email: EmailStr
    password: str
