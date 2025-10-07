from pydantic import BaseModel, EmailStr

class RestaurantSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class RestaurantLogin(BaseModel):
    email: EmailStr
    password: str
