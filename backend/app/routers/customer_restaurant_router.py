from fastapi import APIRouter, HTTPException
from services import customer_restaurant_service
from typing import Optional

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

@router.get("/customers/restaurants/{restaurant_id}")
async def get_restaurant_details(restaurant_id: str):
    """Get detailed information about a specific restaurant"""
    restaurant = await customer_restaurant_service.get_restaurant_by_id(restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

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