# services/customer_restaurant_service.py

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
    """
    Get list of onboarded restaurants with optional filters for city and cuisine.
    
    Args:
        city: Optional city filter (case-insensitive regex search)
        cuisine: Optional cuisine filter (checks if cuisine exists in restaurant's cuisine list)
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
    
    Returns:
        List of formatted restaurant summary dictionaries
    """
    
    # Base query: only show onboarded restaurants
    query = {"is_onboarded": True}
    
    # Add city filter if provided (case-insensitive partial match)
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    
    # Add cuisine filter if provided (exact match in cuisines array)
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    # Execute query with pagination
    cursor = Restaurant_db.restaurants.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    # Format each restaurant for API response
    result = []
    for restaurant in restaurants:
        result.append(await _format_restaurant_summary(restaurant))
    
    return result

async def get_premium_restaurants(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> List[Dict]:
    """
    Get premium/featured restaurants (Fine Dining, Premium, or Luxury).
    
    Args:
        cuisine: Optional cuisine filter
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
    
    Returns:
        List of formatted premium restaurant summaries
    """
    
    # Query for onboarded restaurants with premium features
    query = {
        "is_onboarded": True,
        "features": {"$in": ["Fine Dining", "Premium", "Luxury"]}
    }
    
    # Add cuisine filter if provided
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    # Execute query with pagination
    cursor = Restaurant_db.restaurants.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    # Format each restaurant for API response
    result = []
    for restaurant in restaurants:
        result.append(await _format_restaurant_summary(restaurant))
    
    return result

async def get_todays_deals(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> List[Dict]:
    """
    Get restaurants that have active promotional deals today.
    
    Args:
        cuisine: Optional cuisine filter
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
    
    Returns:
        List of formatted restaurants that have active deals (filtered to only include those with actual active deals)
    """
    
    # Query for onboarded restaurants that have promos defined
    query = {
        "is_onboarded": True,
        "promos": {"$exists": True, "$ne": []}
    }
    
    # Add cuisine filter if provided
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    # Execute query with pagination
    cursor = Restaurant_db.restaurants.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    # Format restaurants and filter to only those with currently active deals
    result = []
    for restaurant in restaurants:
        restaurant_data = await _format_restaurant_summary(restaurant)
        # Only include restaurants that have active deals right now
        if restaurant_data.get("activeDeals"):
            result.append(restaurant_data)
    
    return result

async def get_top_rated(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> List[Dict]:
    """
    Get top rated restaurants sorted by rating.
    Note: Currently returns restaurants without actual rating-based sorting.
    In production, this would query a reviews collection and sort by aggregate ratings.
    
    Args:
        cuisine: Optional cuisine filter
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
    
    Returns:
        List of formatted restaurant summaries
    """
    
    # Base query: only onboarded restaurants
    query = {"is_onboarded": True}
    
    # Add cuisine filter if provided
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    # TODO: In production, sort by actual ratings from reviews collection
    cursor = Restaurant_db.restaurants.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    # Format each restaurant for API response
    result = []
    for restaurant in restaurants:
        result.append(await _format_restaurant_summary(restaurant))
    
    return result

async def get_open_now(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> List[Dict]:
    """
    Get restaurants that are currently open based on their operating hours.
    Compares current UTC time against restaurant's hours for today.
    
    Args:
        cuisine: Optional cuisine filter
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
    
    Returns:
        List of formatted restaurants that are open right now
    """
    
    # Base query: only onboarded restaurants
    query = {"is_onboarded": True}
    
    # Add cuisine filter if provided
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    # Execute query with pagination
    cursor = Restaurant_db.restaurants.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    # Get current day and time for comparison
    current_day = datetime.utcnow().strftime("%A").lower()
    current_time = datetime.utcnow().time()
    
    result = []
    for restaurant in restaurants:
        # Get operating hours for the restaurant
        hours = restaurant.get("hours", {})
        day_hours = hours.get(current_day, {})
        
        # Skip if restaurant is closed today
        if day_hours.get("is_closed"):
            continue
        
        try:
            # Extract opening and closing times
            open_time_str = day_hours.get("open")
            close_time_str = day_hours.get("close")
            
            if open_time_str and close_time_str:
                # Parse time strings to time objects
                open_time = datetime.strptime(open_time_str, "%H:%M").time()
                close_time = datetime.strptime(close_time_str, "%H:%M").time()
                
                # Check if current time is within operating hours
                if open_time <= current_time <= close_time:
                    result.append(await _format_restaurant_summary(restaurant))
        except Exception as e:
            # Log error and skip this restaurant if hours parsing fails
            print(f"Error checking hours: {e}")
            continue
    
    return result

async def get_new_arrivals(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> List[Dict]:
    """
    Get newly onboarded restaurants from the last 30 days.
    
    Args:
        cuisine: Optional cuisine filter
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
    
    Returns:
        List of formatted restaurant summaries sorted by creation date (newest first)
    """
    
    # Calculate date 30 days ago
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # Query for recently onboarded restaurants
    query = {
        "is_onboarded": True,
        "created_at": {"$gte": thirty_days_ago}
    }
    
    # Add cuisine filter if provided
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    # Execute query with sorting by creation date (descending) and pagination
    cursor = Restaurant_db.restaurants.find(query).sort("created_at", -1).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    # Format each restaurant for API response
    result = []
    for restaurant in restaurants:
        result.append(await _format_restaurant_summary(restaurant))
    
    return result

async def get_restaurants_by_location(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> List[Dict]:
    """
    Get restaurants grouped by location.
    Note: Currently returns all restaurants; location grouping should be done client-side.
    
    Args:
        cuisine: Optional cuisine filter
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
    
    Returns:
        List of formatted restaurant summaries
    """
    
    # Base query: only onboarded restaurants
    query = {"is_onboarded": True}
    
    # Add cuisine filter if provided
    if cuisine:
        query["cuisines"] = {"$in": [cuisine]}
    
    # Execute query with pagination
    cursor = Restaurant_db.restaurants.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    # Format each restaurant for API response
    result = []
    for restaurant in restaurants:
        result.append(await _format_restaurant_summary(restaurant))
    
    return result

async def get_restaurants_by_promo(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> List[Dict]:
    """
    Get restaurants with active promotional deals.
    This is an alias for get_todays_deals().
    
    Args:
        cuisine: Optional cuisine filter
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
    
    Returns:
        List of formatted restaurants with active deals
    """
    
    return await get_todays_deals(cuisine, skip, limit)

async def get_restaurant_by_id(restaurant_id: str) -> Optional[Dict]:
    """
    Get detailed information for a specific restaurant by its ID.
    
    Args:
        restaurant_id: MongoDB ObjectId as string
    
    Returns:
        Detailed restaurant information dictionary, or None if not found/invalid ID
    """
    try:
        # Find restaurant by ID (must be onboarded)
        restaurant = await Restaurant_db.restaurants.find_one({
            "_id": ObjectId(restaurant_id),
            "is_onboarded": True
        })
        
        if not restaurant:
            return None
        
        # Return detailed format (includes more fields than summary)
        return _format_restaurant_details(restaurant)
    
    except Exception:
        # Return None if ObjectId is invalid or other error occurs
        return None

async def search_restaurants(
    query: str,
    skip: int = 0,
    limit: int = 20
) -> List[Dict]:
    """
    Search restaurants by name, cuisine, or description.
    Uses case-insensitive regex matching.
    
    Args:
        query: Search term to match against name, cuisine, and description
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
    
    Returns:
        List of formatted restaurant summaries matching the search query
    """
    
    # Build search filter with OR condition for multiple fields
    search_filter = {
        "is_onboarded": True,
        "$or": [
            {"restaurant_name": {"$regex": query, "$options": "i"}},
            {"cuisines": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}}
        ]
    }
    
    # Execute search query with pagination
    cursor = Restaurant_db.restaurants.find(search_filter).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    # Format each restaurant for API response
    result = []
    for restaurant in restaurants:
        result.append(await _format_restaurant_summary(restaurant))
    
    return result

async def _format_restaurant_summary(restaurant: Dict) -> Dict:
    """
    Format restaurant data for list/summary view.
    Includes basic info, thumbnail, and active deals.
    
    Args:
        restaurant: Raw restaurant document from MongoDB
    
    Returns:
        Formatted dictionary with essential restaurant information
    """
    # Build thumbnail URL if thumbnail_id exists
    thumbnail_url = None
    if restaurant.get("thumbnail_id"):
        thumbnail_url = f"https://tabletreats.onrender.com/restaurant/image/{restaurant['thumbnail_id']}"
    
    # Fetch active deals for this restaurant using deal service
    restaurant_id = str(restaurant["_id"])
    active_deals = await deal_service.get_restaurant_deals(restaurant_id)
    
    # Build summary response with core fields
    result = {
        "id": restaurant_id,
        "name": restaurant.get("restaurant_name", ""),
        "city": restaurant.get("city", ""),
        "address": restaurant.get("address", ""),
        "cuisine": restaurant.get("cuisines", []),
        "thumbnail": thumbnail_url,
        "rating": 4.8, 
        "totalReviews": 324, 
        # Truncate description to 150 characters with ellipsis
        "description": restaurant.get("description", "")[:150] + "..." if len(restaurant.get("description", "")) > 150 else restaurant.get("description", "")
    }
    
    # Add active deals if any exist
    if active_deals:
        result["activeDeals"] = active_deals
    
    return result

def _format_restaurant_details(restaurant: Dict) -> Dict:
    """
    Format restaurant data for detailed view.
    Includes full information, all images, operating hours, and features.
    
    Args:
        restaurant: Raw restaurant document from MongoDB
    
    Returns:
        Formatted dictionary with complete restaurant information
    """
    # Build thumbnail URL if thumbnail_id exists
    thumbnail_url = None
    if restaurant.get("thumbnail_id"):
        thumbnail_url = f"https://tabletreats.onrender.com/restaurant/image/{restaurant['thumbnail_id']}"
    
    # Build URLs for all ambiance photos
    ambiance_urls = []
    for photo_id in restaurant.get("ambiance_photo_ids", []):
        ambiance_urls.append(f"https://tabletreats.onrender.com/restaurant/image/{photo_id}")
    
    # Build URLs for all menu photos
    menu_urls = []
    for photo_id in restaurant.get("menu_photo_ids", []):
        menu_urls.append(f"https://tabletreats.onrender.com/restaurant/image/{photo_id}")
    
    # Return comprehensive restaurant information
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
        "rating": 4.8,  # Placeholder: should come from reviews aggregation
        "totalReviews": 324  # Placeholder: should come from reviews count
    }