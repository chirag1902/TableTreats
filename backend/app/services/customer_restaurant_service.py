from database import Restaurant_db
from bson import ObjectId
from typing import Optional, List, Dict
from datetime import datetime, time as dt_time, timedelta
from services import deal_service

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
    
    cursor = Restaurant_db.restaurants.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    result = []
    for restaurant in restaurants:
        result.append(await _format_restaurant_summary(restaurant))
    
    return result

async def get_premium_restaurants(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> List[Dict]:
    """Get premium/featured restaurants"""
    
    query = {
        "is_onboarded": True,
        "features": {"$in": ["Fine Dining", "Premium", "Luxury"]}
    }
    
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    cursor = Restaurant_db.restaurants.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    result = []
    for restaurant in restaurants:
        result.append(await _format_restaurant_summary(restaurant))
    
    return result

async def get_todays_deals(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> List[Dict]:
    """Get restaurants with active deals today"""
    
    query = {
        "is_onboarded": True,
        "promos": {"$exists": True, "$ne": []}
    }
    
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    cursor = Restaurant_db.restaurants.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    current_date = datetime.utcnow().date()
    current_day = current_date.strftime("%A").lower()
    current_time = datetime.utcnow().time()
    
    result = []
    for restaurant in restaurants:
        active_deals = []
        promos = restaurant.get("promos", [])
        
        for promo in promos:
            if not promo.get("is_active"):
                continue
            
            # Check date range
            try:
                start_date = datetime.strptime(promo.get("start_date"), "%Y-%m-%d").date()
                end_date = datetime.strptime(promo.get("end_date"), "%Y-%m-%d").date()
                
                if not (start_date <= current_date <= end_date):
                    continue
                
                # Check valid days
                valid_days = promo.get("valid_days", [])
                if valid_days and current_day not in valid_days:
                    continue
                
                active_deals.append({
                    "id": promo.get("id"),
                    "title": promo.get("title"),
                    "description": promo.get("description"),
                    "discount_type": promo.get("discount_type"),
                    "discount_value": promo.get("discount_value"),
                    "time_start": promo.get("time_start"),
                    "time_end": promo.get("time_end")
                })
            except Exception as e:
                print(f"Error processing promo: {e}")
                continue
        
        if active_deals:
            restaurant_data = await _format_restaurant_summary(restaurant)
            restaurant_data["activeDeals"] = active_deals
            result.append(restaurant_data)
    
    return result

async def get_top_rated(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> List[Dict]:
    """Get top rated restaurants (sorted by rating)"""
    
    query = {"is_onboarded": True}
    
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    # In a real app, you'd sort by actual ratings from reviews collection
    # For now, just return restaurants
    cursor = Restaurant_db.restaurants.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    result = []
    for restaurant in restaurants:
        result.append(await _format_restaurant_summary(restaurant))
    
    return result

async def get_open_now(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> List[Dict]:
    """Get restaurants that are open now"""
    
    query = {"is_onboarded": True}
    
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    cursor = Restaurant_db.restaurants.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    current_day = datetime.utcnow().strftime("%A").lower()
    current_time = datetime.utcnow().time()
    
    result = []
    for restaurant in restaurants:
        hours = restaurant.get("hours", {})
        day_hours = hours.get(current_day, {})
        
        if day_hours.get("is_closed"):
            continue
        
        try:
            open_time_str = day_hours.get("open")
            close_time_str = day_hours.get("close")
            
            if open_time_str and close_time_str:
                open_time = datetime.strptime(open_time_str, "%H:%M").time()
                close_time = datetime.strptime(close_time_str, "%H:%M").time()
                
                if open_time <= current_time <= close_time:
                    result.append(await _format_restaurant_summary(restaurant))
        except Exception as e:
            print(f"Error checking hours: {e}")
            continue
    
    return result

async def get_new_arrivals(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> List[Dict]:
    """Get newly onboarded restaurants (last 30 days)"""
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    query = {
        "is_onboarded": True,
        "created_at": {"$gte": thirty_days_ago}
    }
    
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    cursor = Restaurant_db.restaurants.find(query).sort("created_at", -1).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    result = []
    for restaurant in restaurants:
        result.append(await _format_restaurant_summary(restaurant))
    
    return result

async def get_restaurants_by_location(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> List[Dict]:
    """Get restaurants grouped by location"""
    
    query = {"is_onboarded": True}
    
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    cursor = Restaurant_db.restaurants.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    result = []
    for restaurant in restaurants:
        result.append(await _format_restaurant_summary(restaurant))
    
    return result

async def get_restaurants_by_promo(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> List[Dict]:
    """Get restaurants with active promos"""
    
    return await get_todays_deals(cuisine, skip, limit)

async def get_restaurant_by_id(restaurant_id: str) -> Optional[Dict]:
    """Get detailed restaurant information by ID"""
    try:
        restaurant = await Restaurant_db.restaurants.find_one({
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
    
    cursor = Restaurant_db.restaurants.find(search_filter).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    result = []
    for restaurant in restaurants:
        result.append(await _format_restaurant_summary(restaurant))
    
    return result

async def _format_restaurant_summary(restaurant: Dict) -> Dict:
    """Format restaurant data for list view"""
    thumbnail_url = None
    if restaurant.get("thumbnail_id"):
        thumbnail_url = f"http://localhost:8000/restaurant/image/{restaurant['thumbnail_id']}"
    
    # Get active deals using the deal_service
    restaurant_id = str(restaurant["_id"])
    active_deals = await deal_service.get_restaurant_deals(restaurant_id)
    
    result = {
        "id": restaurant_id,
        "name": restaurant.get("restaurant_name", ""),
        "city": restaurant.get("city", ""),
        "address": restaurant.get("address", ""),
        "cuisine": restaurant.get("cuisines", []),
        "thumbnail": thumbnail_url,
        "rating": 4.8,
        "totalReviews": 324,
        "description": restaurant.get("description", "")[:150] + "..." if len(restaurant.get("description", "")) > 150 else restaurant.get("description", "")
    }
    
    if active_deals:
        result["activeDeals"] = active_deals
    
    return result

def _format_restaurant_details(restaurant: Dict) -> Dict:
    """Format restaurant data for detail view"""
    thumbnail_url = None
    if restaurant.get("thumbnail_id"):
        thumbnail_url = f"http://localhost:8000/restaurant/image/{restaurant['thumbnail_id']}"
    
    ambiance_urls = []
    for photo_id in restaurant.get("ambiance_photo_ids", []):
        ambiance_urls.append(f"http://localhost:8000/restaurant/image/{photo_id}")
    
    menu_urls = []
    for photo_id in restaurant.get("menu_photo_ids", []):
        menu_urls.append(f"http://localhost:8000/restaurant/image/{photo_id}")
    
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