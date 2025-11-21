from database import Customer_db
from utils.auth import hash_password, verify_password, create_access_token
from datetime import timedelta
from config import ACCESS_TOKEN_EXPIRE_MINUTES

async def create_customer(user_data: dict):
    """Create a new customer with hashed password"""
    existing = await Customer_db.users.find_one({"email": user_data["email"]})
    if existing:
        return None  # Email already exists

    # Hash the password before storing
    user_data["password"] = hash_password(user_data["password"])
    user_data["role"] = "customer"
    
    result = await Customer_db.users.insert_one(user_data)
    
    return {
        "id": str(result.inserted_id),
        "email": user_data["email"],
        "full_name": user_data["full_name"],
        "role": "customer"
    }

async def customer_login(email: str, password: str):
    """Customer login with JWT"""
    user = await Customer_db.users.find_one({"email": email, "role": "customer"})
    
    # Verify password using hash
    if not user or not verify_password(password, user["password"]):
        return None

    # Create JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": email, "role": "customer", "user_id": str(user["_id"])},
        expires_delta=access_token_expires
    )

    # Return user data along with token
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": email,
            "full_name": user.get("full_name", ""),
            "role": "customer"
        }
    }

async def get_customer_by_email(email: str):
    """Get customer by email"""
    user = await Customer_db.users.find_one({"email": email, "role": "customer"})
    if user:
        user.pop("password", None)  # Don't return password
        user["id"] = str(user["_id"])
        user.pop("_id", None)
    return user

async def get_customer_by_id(user_id: str):
    """Get customer by ID"""
    from bson import ObjectId
    user = await Customer_db.users.find_one({"_id": ObjectId(user_id), "role": "customer"})
    if user:
        user.pop("password", None)
        user["id"] = str(user["_id"])
        user.pop("_id", None)
    return user

