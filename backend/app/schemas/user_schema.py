# schemas/user_schema.py
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
    email: EmailStr
    full_name: str
    role: str

class UserData(BaseModel):
    email: EmailStr
    full_name: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserData  # Add this to include user data in login response