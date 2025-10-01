from passlib.context import CryptContext
from database import db
from datetime import datetime, timedelta
import secrets
from config import SESSION_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def generate_session_token():
    return secrets.token_hex(32)

def get_expiry_time():
    return datetime.utcnow() + timedelta(minutes=SESSION_EXPIRE_MINUTES)

# Create restaurant owner
async def create_owner(owner_data: dict):
    existing = await db.restaurant_owners.find_one({"email": owner_data["email"]})
    if existing:
        return None  # Email already exists

    hashed_password = hash_password(owner_data["password"])
    owner_doc = {
        "email": owner_data["email"],
        "password": hashed_password,
        "restaurant_name": owner_data["restaurant_name"],
        "phone_number": owner_data.get("phone_number"),
        "address": owner_data.get("address"),
        "registered_at": datetime.utcnow(),
        "role": "restaurant_owner"
    }
    result = await db.restaurant_owners.insert_one(owner_doc)
    return {
        "id": str(result.inserted_id),
        "email": owner_doc["email"],
        "restaurant_name": owner_doc["restaurant_name"],
        "registered_at": owner_doc["registered_at"].isoformat()
    }

# Restaurant owner login
async def owner_login(email: str, password: str):
    owner = await db.restaurant_owners.find_one({"email": email, "role": "restaurant_owner"})
    if not owner or not verify_password(password, owner["password"]):
        return None

    token = generate_session_token()
    expiry = get_expiry_time()

    await db.sessions.insert_one({
        "user_email": email,
        "role": "restaurant_owner",
        "token": token,
        "expires_at": expiry
    })

    return {
        "session_token": token,
        "expires_at": expiry,
        "email": email,
        "restaurant_name": owner["restaurant_name"]
    }
