# routers/deals.py
"""
Deals and promotions router.
Provides endpoints for retrieving restaurant deals and checking deal applicability for reservations.
"""

from fastapi import APIRouter, HTTPException
from services import deal_service
from typing import List
from schemas.reservation_schema import DealOut

router = APIRouter()

@router.get("/restaurants/{restaurant_id}/deals", response_model=List[DealOut])
async def get_restaurant_deals(restaurant_id: str):
    """Get all active deals for a restaurant"""
    print(f"🔍 Deals endpoint called for restaurant_id: {restaurant_id}")
    try:
        deals = await deal_service.get_restaurant_deals(restaurant_id)
        print(f"📦 Found {len(deals)} deals")
        return deals
    except Exception as e:
        print(f"❌ Error fetching deals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching deals: {str(e)}")

@router.get("/restaurants/{restaurant_id}/deals/applicable")
async def get_applicable_deals(
    restaurant_id: str,
    date: str,
    time_slot: str
):
    """Get deals applicable for a specific reservation date and time"""
    print(f"🔍 Applicable deals endpoint called for restaurant_id: {restaurant_id}, date: {date}, time: {time_slot}")
    try:
        deals = await deal_service.get_applicable_deals(restaurant_id, date, time_slot)
        print(f"📦 Found {len(deals)} applicable deals")
        return deals
    except Exception as e:
        print(f"❌ Error fetching applicable deals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching applicable deals: {str(e)}")