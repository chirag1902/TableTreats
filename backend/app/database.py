# database.py
"""
Database connection setup for MongoDB.
Initializes async MongoDB clients for customer and restaurant databases, and GridFS for file storage.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from config import MONGO_URI, Customer_MONGO_DB, Restaurant_MONGO_DB

client = AsyncIOMotorClient(MONGO_URI)
Customer_db = client[Customer_MONGO_DB]
Restaurant_db = client[Restaurant_MONGO_DB]
fs = AsyncIOMotorGridFSBucket(Restaurant_db)