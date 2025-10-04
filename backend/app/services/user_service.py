from database import db
from datetime import datetime, timedelta
import secrets
from config import SESSION_EXPIRE_MINUTES

# Generate a random session token
def generate_session_token():
    return secrets.token_hex(32)

# Compute session expiry time
def get_expiry_time():
    return datetime.utcnow() + timedelta(minutes=SESSION_EXPIRE_MINUTES)

# Create a new customer (password stored as plain text)
async def create_customer(user_data: dict):
    existing = await db.users.find_one({"email": user_data["email"]})
    if existing:
        return None  # Email already exists

    user_data["role"] = "customer"  # assign role
    await db.users.insert_one(user_data)
    return {
        "email": user_data["email"],
        "full_name": user_data["full_name"],
        "role": "customer"
    }

# Customer login (plain-text comparison)
async def customer_login(email: str, password: str):
    user = await db.users.find_one({"email": email, "role": "customer"})
    if not user or user["password"] != password:
        return None

    token = generate_session_token()
    expiry = get_expiry_time()

    await db.sessions.insert_one({
        "user_email": email,
        "role": "customer",
        "token": token,
        "expires_at": expiry
    })

    return {
        "session_token": token,
        "expires_at": expiry,
        "email": email
    }
