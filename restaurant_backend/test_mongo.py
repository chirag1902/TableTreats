import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB", "table_treats")

async def test_connection():
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[MONGO_DB]

        # Ping the database
        result = await db.command("ping")
        print("✅ Connected to MongoDB Atlas successfully:", result)

        # Optional: show collection names
        collections = await db.list_collection_names()
        print("📁 Collections in database:", collections)

    except Exception as e:
        print("❌ Connection failed:", e)

    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_connection())
