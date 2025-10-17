from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, Customer_MONGO_DB,Resturant_MONGO_DB

client = AsyncIOMotorClient(MONGO_URI)
Customer_db = client[Customer_MONGO_DB]
Resturant_db = client[Resturant_MONGO_DB]
