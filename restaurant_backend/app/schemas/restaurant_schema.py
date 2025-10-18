# app/schemas/restaurant_schema.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict

class RestaurantSignup(BaseModel):
    restaurant_name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None
    address: Optional[str] = None


class RestaurantLogin(BaseModel):
    email: EmailStr
    password: str


class RestaurantProfile(BaseModel):
    id: str
    name: str
    email: EmailStr
    isOnboarded: bool
    address: Optional[str] = None
    city: Optional[str] = None
    zipcode: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    ambiancePhotos: List[str] = []
    menuPhotos: List[str] = []
    cuisine: List[str] = []
    features: List[str] = []
    hours: Dict = {}
    rating: float = 0.0
    totalReviews: int = 0