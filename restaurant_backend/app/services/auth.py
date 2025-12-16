# app/services/auth.py

"""
Authentication utilities for restaurant backend.
Handles password hashing with scrypt, JWT token creation/verification, and role-based authorization.
"""

import hashlib
import os
import base64
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# Bearer token scheme
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash a password using scrypt"""
    salt = os.urandom(32)
    pwd_hash = hashlib.scrypt(password.encode('utf-8'), salt=salt, n=16384, r=8, p=1, dklen=64)
    return base64.b64encode(salt + pwd_hash).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a scrypt hash"""
    try:
        decoded = base64.b64decode(hashed_password.encode('utf-8'))
        salt = decoded[:32]
        stored_hash = decoded[32:]
        pwd_hash = hashlib.scrypt(plain_password.encode('utf-8'), salt=salt, n=16384, r=8, p=1, dklen=64)
        return pwd_hash == stored_hash
    except:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    payload = decode_token(token)
    
    email: str = payload.get("sub")
    role: str = payload.get("role")
    
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    return {"email": email, "role": role}

async def get_current_customer(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency to ensure user is a customer"""
    if current_user.get("role") != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as customer"
        )
    return current_user

async def get_current_restaurant(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency to ensure user is a restaurant"""
    if current_user.get("role") != "restaurant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as restaurant"
        )
    return current_user