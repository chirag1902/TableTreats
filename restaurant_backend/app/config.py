# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "tabletreats")

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 7 days

# File Upload Configuration
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 20 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}