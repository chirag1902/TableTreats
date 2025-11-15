from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict

class RestaurantSummary(BaseModel):
    id: str
    name: str
    city: str
    address: str
    cuisine: List[str]
    thumbnail: Optional[str] = None
    rating: float
    totalReviews: int
    description: str

class RestaurantDetails(BaseModel):
    id: str
    name: str
    email: EmailStr
    address: str
    city: str
    zipcode: str
    phone: str
    description: str
    thumbnail: Optional[str] = None
    ambiancePhotos: List[str] = []
    menuPhotos: List[str] = []
    cuisine: List[str] = []
    features: List[str] = []
    hours: Dict = {}
    rating: float
    totalReviews: int
    Total_Capacity: int