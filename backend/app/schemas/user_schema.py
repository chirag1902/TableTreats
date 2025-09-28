from pydantic import BaseModel, EmailStr

class CustomerSignup(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class CustomerLogin(BaseModel):
    email: EmailStr
    password: str

class CustomerOut(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "customer"
