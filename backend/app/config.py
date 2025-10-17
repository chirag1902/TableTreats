import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
Customer_MONGO_DB = "customer_db"
Resturant_MONGO_DB = 'restaurant_db"

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30