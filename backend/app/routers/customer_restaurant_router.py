from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from services import customer_restaurant_service, deal_service
from typing import Optional, List
from bson import ObjectId
from schemas.reservation_schema import DealOut

# Import your GridFS instance
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

@router.get("/customers/restaurants/{restaurant_id}/deals", response_model=List[DealOut])
async def get_restaurant_deals(restaurant_id: str):
    """Get all active deals for a restaurant"""
    deals = await deal_service.get_restaurant_deals(restaurant_id)
    return deals

@router.get("/customers/restaurants/{restaurant_id}/deals/applicable")
async def get_applicable_deals(
    restaurant_id: str,
    date: str,
    time_slot: str
):
    """Get deals applicable for a specific reservation date and time"""
    deals = await deal_service.get_applicable_deals(restaurant_id, date, time_slot)
    return deals

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