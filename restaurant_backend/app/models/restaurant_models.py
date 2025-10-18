from pydantic import BaseModel
from typing import Optional

class RestaurantSignup(BaseModel):
    restaurant_name: str
    email: str
    password: str
    phone: Optional[str] = None
    address: Optional[str] = None
