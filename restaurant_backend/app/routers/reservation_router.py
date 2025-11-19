from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from datetime import datetime, timedelta
from bson import ObjectId

from app.database import db
from app.services.auth import get_current_restaurant

router = APIRouter()


@router.get("/restaurants/{restaurant_id}/capacity")
async def get_restaurant_capacity(restaurant_id: str):
    """Get restaurant's seating capacity configuration for customer backend"""
    try:
        restaurant = await db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid restaurant ID")
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    if not restaurant.get("is_onboarded"):
        raise HTTPException(status_code=400, detail="Restaurant not available for booking")
    
    seating_config = restaurant.get("seating_config", {
        "total_capacity": 50,
        "advance_booking_days": 7,
        "min_party_size": 1,
        "max_party_size": 10
    })
    
    hours = restaurant.get("hours", {})
    
    return {
        "restaurant_id": str(restaurant["_id"]),
        "restaurant_name": restaurant.get("restaurant_name"),
        "total_capacity": seating_config.get("total_capacity", 50),
        "advance_booking_days": seating_config.get("advance_booking_days", 7),
        "min_party_size": seating_config.get("min_party_size", 1),
        "max_party_size": seating_config.get("max_party_size", 10),
        "operating_hours": hours,
        "seating_config": seating_config
    }


@router.get("/restaurant/reservations")
async def get_restaurant_reservations(
    date: Optional[str] = Query(None, description="Filter by date YYYY-MM-DD"),
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: dict = Depends(get_current_restaurant)
):
    """Get all reservations for the restaurant"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    
    query = {"restaurant_id": restaurant_id}
    if date:
        query["date"] = date
    if status:
        query["status"] = status
    
    reservations = await db.reservations.find(query).sort([("date", 1), ("time_slot", 1)]).to_list(length=None)
    
    result = []
    for res in reservations:
        result.append({
            "id": str(res["_id"]),
            "customer_name": res["customer_name"],
            "customer_email": res["customer_email"],
            "customer_phone": res["customer_phone"],
            "date": res["date"],
            "time_slot": res["time_slot"],
            "number_of_guests": res["number_of_guests"],
            "status": res["status"],
            "special_requests": res.get("special_requests"),
            "created_at": res["created_at"]
        })
    
    return {
        "total": len(result),
        "reservations": result
    }


@router.get("/restaurant/reservations/today")
async def get_todays_reservations(current_user: dict = Depends(get_current_restaurant)):
    """Get today's reservations for dashboard"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    today = datetime.now().strftime("%Y-%m-%d")
    
    reservations = await db.reservations.find({
        "restaurant_id": restaurant_id,
        "date": today,
        "status": "confirmed"
    }).sort("time_slot", 1).to_list(length=None)
    
    total_guests = sum(r["number_of_guests"] for r in reservations)
    
    result = []
    for res in reservations:
        result.append({
            "id": str(res["_id"]),
            "customer_name": res["customer_name"],
            "time_slot": res["time_slot"],
            "number_of_guests": res["number_of_guests"],
            "status": res["status"]
        })
    
    return {
        "date": today,
        "total_reservations": len(reservations),
        "total_guests": total_guests,
        "reservations": result
    }


@router.get("/restaurant/reservations/{reservation_id}")
async def get_reservation_details(
    reservation_id: str,
    current_user: dict = Depends(get_current_restaurant)
):
    """Get detailed reservation information"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    
    try:
        reservation = await db.reservations.find_one({"_id": ObjectId(reservation_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid reservation ID")
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation["restaurant_id"] != restaurant_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this reservation")
    
    return {
        "id": str(reservation["_id"]),
        "customer_name": reservation["customer_name"],
        "customer_email": reservation["customer_email"],
        "customer_phone": reservation["customer_phone"],
        "date": reservation["date"],
        "time_slot": reservation["time_slot"],
        "number_of_guests": reservation["number_of_guests"],
        "status": reservation["status"],
        "special_requests": reservation.get("special_requests"),
        "created_at": reservation["created_at"],
        "updated_at": reservation.get("updated_at")
    }


@router.put("/restaurant/reservations/{reservation_id}/cancel")
async def cancel_reservation_by_restaurant(
    reservation_id: str,
    reason: Optional[str] = None,
    current_user: dict = Depends(get_current_restaurant)
):
    """Cancel a reservation"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    
    try:
        reservation = await db.reservations.find_one({"_id": ObjectId(reservation_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid reservation ID")
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation["restaurant_id"] != restaurant_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if reservation["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Reservation already cancelled")
    
    update_data = {
        "status": "cancelled",
        "cancelled_by": "restaurant",
        "cancelled_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    if reason:
        update_data["cancellation_reason"] = reason
    
    await db.reservations.update_one(
        {"_id": ObjectId(reservation_id)},
        {"$set": update_data}
    )
    
    return {
        "message": "Reservation cancelled successfully",
        "reservation_id": reservation_id
    }


@router.get("/restaurant/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_restaurant)):
    """Get dashboard statistics"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    today = datetime.now().strftime("%Y-%m-%d")
    
    today_count = await db.reservations.count_documents({
        "restaurant_id": restaurant_id,
        "date": today,
        "status": "confirmed"
    })
    
    week_start = (datetime.now() - timedelta(days=datetime.now().weekday())).strftime("%Y-%m-%d")
    week_end = (datetime.now() + timedelta(days=6-datetime.now().weekday())).strftime("%Y-%m-%d")
    
    week_reservations = await db.reservations.find({
        "restaurant_id": restaurant_id,
        "date": {"$gte": week_start, "$lte": week_end},
        "status": {"$in": ["confirmed", "completed"]}
    }).to_list(length=None)
    
    week_guests = sum(r["number_of_guests"] for r in week_reservations)
    
    all_reservations = await db.reservations.find({
        "restaurant_id": restaurant_id
    }).to_list(length=None)
    
    unique_customers = len(set(r["customer_email"] for r in all_reservations))
    
    return {
        "today_reservations": today_count,
        "week_reservations": len(week_reservations),
        "week_guests": week_guests,
        "total_customers": unique_customers,
        "average_party_size": round(week_guests / len(week_reservations), 1) if week_reservations else 0
    }