from fastapi import FastAPI, HTTPException, Depends, Header
from database import db
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from auth import generate_session_token, get_expiry_time
from datetime import datetime

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ✅ Signup API
@app.post("/signup")
async def signup(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = pwd_context.hash(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_pw
    await db.users.insert_one(user_dict)
    return {"msg": "User created successfully"}

# ✅ Login API (creates session)
@app.post("/login")
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not pwd_context.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    session_token = generate_session_token()
    expiry = get_expiry_time()

    await db.sessions.insert_one({
        "user_email": db_user["email"],
        "token": session_token,
        "expires_at": expiry
    })

    return {"session_token": session_token, "expires_at": expiry}

# ✅ Dependency to verify session token
async def get_current_user(token: str = Header(..., alias="X-Session-Token")):
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session token")

    if session["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Session expired")

    return session["user_email"]

# ✅ Protected Route Example
@app.get("/profile")
async def profile(user_email: str = Depends(get_current_user)):
    user = await db.users.find_one({"email": user_email}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
