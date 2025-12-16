# app/database.py

"""
MongoDB database connection setup.
Initializes async MongoDB client, database, GridFS bucket, and collection references.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from app.config import MONGO_URI, DATABASE_NAME


# MongoDB client
client = AsyncIOMotorClient(MONGO_URI)
db = client['restaurant_db']

# GridFS bucket for storing images
fs = AsyncIOMotorGridFSBucket(db)

# Collections
restaurants_collection = db.restaurants
customers_collection = db.customers
reservations_collection = db.reservations
