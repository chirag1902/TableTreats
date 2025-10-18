from pymongo import MongoClient
import os

# If you are using dotenv
from dotenv import load_dotenv
load_dotenv()

uri = os.getenv("MONGODB_URL")

try:
    client = MongoClient(uri)
    db = client["tabletreats"]
    print("✅ Connected successfully to MongoDB:", db.name)
except Exception as e:
    print("❌ Connection failed:", e)
