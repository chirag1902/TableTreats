import secrets
from datetime import datetime, timedelta
from config import SESSION_EXPIRE_MINUTES

def generate_session_token():
    return secrets.token_hex(32)  # 64-char random hex string

def get_expiry_time():
    return datetime.utcnow() + timedelta(minutes=SESSION_EXPIRE_MINUTES)
