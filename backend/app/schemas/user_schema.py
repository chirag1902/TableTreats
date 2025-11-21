from pydantic import BaseModel, EmailStr
from typing import Optional

class CustomerSignup(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class CustomerLogin(BaseModel):
    email: EmailStr
    password: str

class CustomerOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str

class UserData(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserData
