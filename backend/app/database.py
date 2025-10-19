from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from config import MONGO_URI, Customer_MONGO_DB, Restaurant_MONGO_DB

client = AsyncIOMotorClient(MONGO_URI)
Customer_db = client[Customer_MONGO_DB]
Restaurant_db = client[Restaurant_MONGO_DB]
fs = AsyncIOMotorGridFSBucket(Restaurant_db)