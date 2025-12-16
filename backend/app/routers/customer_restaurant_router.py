"""
Customer-facing restaurant browsing router.
Provides endpoints for discovering restaurants by various criteria and retrieving restaurant images.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from services import customer_restaurant_service
from typing import Optional
from bson import ObjectId
from database import fs

router = APIRouter()

@router.get("/customers/restaurants")
async def get_all_restaurants(
    city: Optional[str] = None,
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    """Get list of all restaurants (with optional filters)"""
    restaurants = await customer_restaurant_service.get_restaurants(
        city=city,
        cuisine=cuisine,
        skip=skip,
        limit=limit
    )
    return restaurants

@router.get("/customers/restaurants/premium")
async def get_premium_restaurants(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    """Get premium/featured restaurants"""
    restaurants = await customer_restaurant_service.get_premium_restaurants(
        cuisine=cuisine,
        skip=skip,
        limit=limit
    )
    return restaurants

@router.get("/customers/restaurants/todays-deals")
async def get_todays_deals(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get restaurants with active deals today"""
    restaurants = await customer_restaurant_service.get_todays_deals(
        cuisine=cuisine,
        skip=skip,
        limit=limit
    )
    return restaurants

@router.get("/customers/restaurants/top-rated")
async def get_top_rated(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    """Get top rated restaurants"""
    restaurants = await customer_restaurant_service.get_top_rated(
        cuisine=cuisine,
        skip=skip,
        limit=limit
    )
    return restaurants

@router.get("/customers/restaurants/open-now")
async def get_open_now(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    """Get restaurants that are currently open"""
    restaurants = await customer_restaurant_service.get_open_now(
        cuisine=cuisine,
        skip=skip,
        limit=limit
    )
    return restaurants

@router.get("/customers/restaurants/new-arrivals")
async def get_new_arrivals(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    """Get newly onboarded restaurants"""
    restaurants = await customer_restaurant_service.get_new_arrivals(
        cuisine=cuisine,
        skip=skip,
        limit=limit
    )
    return restaurants

@router.get("/customers/restaurants/by-location")
async def get_restaurants_by_location(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get restaurants for grouping by location"""
    restaurants = await customer_restaurant_service.get_restaurants_by_location(
        cuisine=cuisine,
        skip=skip,
        limit=limit
    )
    return restaurants

@router.get("/customers/restaurants/by-promo")
async def get_restaurants_by_promo(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get restaurants with active promos for grouping"""
    restaurants = await customer_restaurant_service.get_restaurants_by_promo(
        cuisine=cuisine,
        skip=skip,
        limit=limit
    )
    return restaurants

@router.get("/customers/restaurants/search")
async def search_restaurants(
    query: str,
    skip: int = 0,
    limit: int = 20
):
    """Search restaurants by name or cuisine"""
    restaurants = await customer_restaurant_service.search_restaurants(
        query=query,
        skip=skip,
        limit=limit
    )
    return restaurants

@router.get("/customers/restaurants/{restaurant_id}")
async def get_restaurant_details(restaurant_id: str):
    """Get detailed information about a specific restaurant"""
    restaurant = await customer_restaurant_service.get_restaurant_by_id(restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@router.get("/restaurant/image/{file_id}")
async def get_restaurant_image(file_id: str):
    """
    Retrieve restaurant image from GridFS
    """
    try:
        grid_out = await fs.open_download_stream(ObjectId(file_id))
        content = await grid_out.read()
        
        metadata = grid_out.metadata or {}
        content_type = metadata.get("content_type", "image/jpeg")
        
        return Response(content=content, media_type=content_type)
    
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Image not found: {str(e)}")