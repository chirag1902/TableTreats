from database import Restaurant_db
from bson import ObjectId
from typing import List, Dict
from datetime import datetime, time

async def get_restaurant_deals(restaurant_id: str) -> List[Dict]:
    """Get all active deals for a restaurant"""
    
    restaurant = await Restaurant_db.restaurants.find_one({
        "_id": ObjectId(restaurant_id)
    })
    
    if not restaurant:
        return []
    
    deals = restaurant.get("deals", [])
    
    # Filter only active deals that are currently valid
    active_deals = []
    current_date = datetime.utcnow().date()
    
    for deal in deals:
        if not deal.get("is_active"):
            continue
        
        # Check if deal is within valid date range
        start_date = datetime.strptime(deal.get("start_date"), "%Y-%m-%d").date()
        end_date = datetime.strptime(deal.get("end_date"), "%Y-%m-%d").date()
        
        if start_date <= current_date <= end_date:
            active_deals.append(_format_deal(deal))
    
    return active_deals

async def get_applicable_deals(
    restaurant_id: str,
    date: str,
    time_slot: str
) -> List[Dict]:
    """Get deals applicable for a specific date and time"""
    
    restaurant = await Restaurant_db.restaurants.find_one({
        "_id": ObjectId(restaurant_id)
    })
    
    if not restaurant:
        return []
    
    deals = restaurant.get("deals", [])
    
    # Parse date and time
    reservation_date = datetime.strptime(date, "%Y-%m-%d").date()
    day_name = reservation_date.strftime("%A").lower()
    
    # Parse time slot
    slot_hour, slot_min = map(int, time_slot.split(":"))
    slot_time = time(slot_hour, slot_min)
    
    applicable_deals = []
    
    for deal in deals:
        if not deal.get("is_active"):
            continue
        
        # Check date range
        start_date = datetime.strptime(deal.get("start_date"), "%Y-%m-%d").date()
        end_date = datetime.strptime(deal.get("end_date"), "%Y-%m-%d").date()
        
        if not (start_date <= reservation_date <= end_date):
            continue
        
        # Check valid days
        valid_days = deal.get("valid_days", [])
        if valid_days and day_name not in valid_days:
            continue
        
        # Check time range
        deal_start = time(*map(int, deal.get("time_start", "00:00").split(":")))
        deal_end = time(*map(int, deal.get("time_end", "23:59").split(":")))
        
        if deal_start <= slot_time <= deal_end:
            applicable_deals.append(_format_deal(deal))
    
    return applicable_deals

def _format_deal(deal: Dict) -> Dict:
    """Format deal document"""
    return {
        "id": deal.get("id"),
        "title": deal.get("title"),
        "description": deal.get("description"),
        "discount_type": deal.get("discount_type"),
        "discount_value": deal.get("discount_value"),
        "valid_days": deal.get("valid_days", []),
        "time_start": deal.get("time_start"),
        "time_end": deal.get("time_end"),
        "start_date": deal.get("start_date"),
        "end_date": deal.get("end_date"),
        "is_active": deal.get("is_active")
    }