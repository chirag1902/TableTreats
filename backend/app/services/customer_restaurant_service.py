from database import Resturant_MONGO_DB
from bson import ObjectId
from typing import Optional, List, Dict

async def get_restaurants(
    city: Optional[str] = None,
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> List[Dict]:
    """Get list of restaurants with optional filters"""
    
    query = {"is_onboarded": True}
    
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    cursor = Resturant_MONGO_DB.restaurants.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    result = []
    for restaurant in restaurants:
        result.append(_format_restaurant_summary(restaurant))
    
    return result

async def get_restaurant_by_id(restaurant_id: str) -> Optional[Dict]:
    """Get detailed restaurant information by ID"""
    try:
        restaurant = await Resturant_MONGO_DB.restaurants.find_one({
            "_id": ObjectId(restaurant_id),
            "is_onboarded": True
        })
        
        if not restaurant:
            return None
        
        return _format_restaurant_details(restaurant)
    
    except Exception:
        return None

async def search_restaurants(
    query: str,
    skip: int = 0,
    limit: int = 20
) -> List[Dict]:
    """Search restaurants by name or cuisine"""
    
    search_filter = {
        "is_onboarded": True,
        "$or": [
            {"restaurant_name": {"$regex": query, "$options": "i"}},
            {"cuisines": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}}
        ]
    }
    
    cursor = Resturant_MONGO_DB.restaurants.find(search_filter).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    result = []
    for restaurant in restaurants:
        result.append(_format_restaurant_summary(restaurant))
    
    return result

def _format_restaurant_summary(restaurant: Dict) -> Dict:
    """Format restaurant data for list view"""
    # Use the existing restaurant image endpoint
    thumbnail_url = None
    if restaurant.get("thumbnail_id"):
        thumbnail_url = f"/api/restaurant/image/{restaurant['thumbnail_id']}"
    
    return {
        "id": str(restaurant["_id"]),
        "name": restaurant.get("restaurant_name", ""),
        "city": restaurant.get("city", ""),
        "address": restaurant.get("address", ""),
        "cuisine": restaurant.get("cuisines", []),
        "thumbnail": thumbnail_url,
        "rating": 4.8,
        "totalReviews": 324,
        "description": restaurant.get("description", "")[:150] + "..." if len(restaurant.get("description", "")) > 150 else restaurant.get("description", "")
    }

def _format_restaurant_details(restaurant: Dict) -> Dict:
    """Format restaurant data for detail view"""
    # Use the existing restaurant image endpoint
    thumbnail_url = None
    if restaurant.get("thumbnail_id"):
        thumbnail_url = f"/api/restaurant/image/{restaurant['thumbnail_id']}"
    
    ambiance_urls = []
    for photo_id in restaurant.get("ambiance_photo_ids", []):
        ambiance_urls.append(f"/api/restaurant/image/{photo_id}")
    
    menu_urls = []
    for photo_id in restaurant.get("menu_photo_ids", []):
        menu_urls.append(f"/api/restaurant/image/{photo_id}")
    
    return {
        "id": str(restaurant["_id"]),
        "name": restaurant.get("restaurant_name", ""),
        "email": restaurant.get("email", ""),
        "address": restaurant.get("address", ""),
        "city": restaurant.get("city", ""),
        "zipcode": restaurant.get("zipcode", ""),
        "phone": restaurant.get("phone", ""),
        "description": restaurant.get("description", ""),
        "thumbnail": thumbnail_url,
        "ambiancePhotos": ambiance_urls,
        "menuPhotos": menu_urls,
        "cuisine": restaurant.get("cuisines", []),
        "features": restaurant.get("features", []),
        "hours": restaurant.get("hours", {}),
        "rating": 4.8,
        "totalReviews": 324
    }