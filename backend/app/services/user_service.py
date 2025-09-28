from passlib.context import CryptContext
from database import db
from datetime import datetime
import secrets
from config import SESSION_EXPIRE_MINUTES
from datetime import timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def generate_session_token():
    return secrets.token_hex(32)

def get_expiry_time():
    return datetime.utcnow() + timedelta(minutes=SESSION_EXPIRE_MINUTES)

# Create customer
async def create_customer(user_data: dict):
    existing = await db.users.find_one({"email": user_data["email"]})
    if existing:
        return None  # Email already exists

    user_data["password"] = hash_password(user_data["password"])
    user_data["role"] = "customer"
    await db.users.insert_one(user_data)
    return {"email": user_data["email"], "full_name": user_data["full_name"], "role": "customer"}

# Customer login
async def customer_login(email: str, password: str):
    user = await db.users.find_one({"email": email, "role": "customer"})
    if not user or not verify_password(password, user["password"]):
        return None

    token = generate_session_token()
    expiry = get_expiry_time()

    await db.sessions.insert_one({
        "user_email": email,
        "role": "customer",
        "token": token,
        "expires_at": expiry
    })

    return {"session_token": token, "expires_at": expiry, "email": email}
