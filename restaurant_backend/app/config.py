import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB", "restaurant_db")  # default to 'restaurant_db'
SESSION_EXPIRE_MINUTES = int(os.getenv("SESSION_EXPIRE_MINUTES", 60))
