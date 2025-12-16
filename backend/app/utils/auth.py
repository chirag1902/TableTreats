# utils/auth.py
"""
Authentication utilities for password hashing, JWT token creation/verification, and user authorization.
Provides dependency functions for protecting routes and validating user roles.
"""

import hashlib
import os
import base64
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash a password using scrypt algorithm with random salt"""
    salt = os.urandom(32)
    pwd_hash = hashlib.scrypt(password.encode('utf-8'), salt=salt, n=16384, r=8, p=1, dklen=64)
    return base64.b64encode(salt + pwd_hash).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a scrypt hashed password"""
    try:
        decoded = base64.b64decode(hashed_password.encode('utf-8'))
        salt = decoded[:32]
        stored_hash = decoded[32:]
        pwd_hash = hashlib.scrypt(plain_password.encode('utf-8'), salt=salt, n=16384, r=8, p=1, dklen=64)
        return pwd_hash == stored_hash
    except:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token with expiration"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    """Decode and verify a JWT token, raises HTTPException if invalid"""
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
    """FastAPI dependency to extract and validate current authenticated user from JWT token"""
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

async def get_current_customer(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """FastAPI dependency to verify JWT token and ensure user has customer role"""
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: str = payload.get("user_id")
        
        if email is None or role != "customer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        return {"email": email, "role": role, "user_id": user_id}
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

async def get_current_restaurant(current_user: dict = Depends(get_current_user)) -> dict:
    """FastAPI dependency to ensure authenticated user has restaurant role"""
    if current_user.get("role") != "restaurant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as restaurant"
        )
    return current_user