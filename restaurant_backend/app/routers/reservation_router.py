# app/routers/reservation_router.py
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId

from app.schemas.reservation_schema import (
    ReservationCreate,
    ReservationResponse,
    AvailableSlotsResponse,
    TimeSlot,
    ReservationsByDateResponse,
    ReservationListItem,
    UpdateReservationStatus
)
from app.database import db
from app.services.auth import get_current_restaurant
from app.services.reservation_service import (
    get_available_slots,
    create_reservation,
    get_restaurant_reservations,
    cancel_reservation
)

router = APIRouter()  # ← This line must be present


# ===========================
# PUBLIC ENDPOINTS (Customer Side)
# ===========================

@router.get("/restaurants/{restaurant_id}/available-slots", response_model=AvailableSlotsResponse)
async def get_available_time_slots(
    restaurant_id: str,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    party_size: int = Query(..., ge=1, le=10, description="Number of guests")
):
    """
    Get available time slots for a restaurant on a specific date.
    PUBLIC - No authentication required.
    """
    # Validate date format
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get available slots
    slots = await get_available_slots(restaurant_id, date, party_size)
    
    return {
        "date": date,
        "slots": slots
    }


@router.post("/reservations", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_new_reservation(payload: ReservationCreate):
    """
    Create a new reservation.
    PUBLIC - No authentication required (customer creates booking).
    """
    # Create reservation
    reservation = await create_reservation(
        restaurant_id=payload.restaurant_id,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        customer_phone=payload.customer_phone,
        date_str=payload.date,
        time_slot=payload.time_slot,
        party_size=payload.party_size,
        special_requests=payload.special_requests
    )
    
    # Get restaurant name
    restaurant = await db.restaurants.find_one({"_id": ObjectId(payload.restaurant_id)})
    
    return {
        "id": str(reservation["_id"]),
        "restaurant_id": payload.restaurant_id,
        "restaurant_name": restaurant.get("restaurant_name", "Unknown"),
        "customer_name": reservation["customer_name"],
        "customer_email": reservation["customer_email"],
        "customer_phone": reservation["customer_phone"],
        "date": reservation["date"],
        "time_slot": reservation["time_slot"],
        "party_size": reservation["party_size"],
        "status": reservation["status"],
        "special_requests": reservation.get("special_requests"),
        "created_at": reservation["created_at"]
    }


@router.get("/reservations/{reservation_id}", response_model=ReservationResponse)
async def get_reservation_details(reservation_id: str):
    """
    Get reservation details by ID.
    PUBLIC - Customer can check their reservation.
    """
    try:
        reservation = await db.reservations.find_one({"_id": ObjectId(reservation_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid reservation ID")
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Get restaurant name
    restaurant = await db.restaurants.find_one({"_id": ObjectId(reservation["restaurant_id"])})
    
    return {
        "id": str(reservation["_id"]),
        "restaurant_id": reservation["restaurant_id"],
        "restaurant_name": restaurant.get("restaurant_name", "Unknown"),
        "customer_name": reservation["customer_name"],
        "customer_email": reservation["customer_email"],
        "customer_phone": reservation["customer_phone"],
        "date": reservation["date"],
        "time_slot": reservation["time_slot"],
        "party_size": reservation["party_size"],
        "status": reservation["status"],
        "special_requests": reservation.get("special_requests"),
        "created_at": reservation["created_at"]
    }


@router.put("/reservations/{reservation_id}/cancel")
async def cancel_customer_reservation(
    reservation_id: str,
    reason: Optional[str] = None
):
    """
    Cancel a reservation (by customer).
    PUBLIC - Customer can cancel their own reservation.
    """
    try:
        updated_reservation = await cancel_reservation(
            reservation_id,
            cancelled_by="customer",
            reason=reason
        )
        
        return {
            "message": "Reservation cancelled successfully",
            "reservation_id": str(updated_reservation["_id"]),
            "status": updated_reservation["status"]
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cancelling reservation: {str(e)}")


# ===========================
# PROTECTED ENDPOINTS (Restaurant Side)
# ===========================

@router.get("/restaurant/reservations", response_model=List[ReservationsByDateResponse])
async def get_my_restaurant_reservations(
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: dict = Depends(get_current_restaurant)
):
    """
    Get all reservations for the authenticated restaurant.
    PROTECTED - Restaurant owner only.
    """
    # Get restaurant
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    
    # Get reservations
    reservations = await get_restaurant_reservations(
        restaurant_id=restaurant_id,
        date_str=date,
        status=status
    )
    
    # Group by date
    reservations_by_date = {}
    for reservation in reservations:
        res_date = reservation["date"]
        if res_date not in reservations_by_date:
            reservations_by_date[res_date] = {
                "date": res_date,
                "total_reservations": 0,
                "total_guests": 0,
                "reservations": []
            }
        
        reservations_by_date[res_date]["total_reservations"] += 1
        reservations_by_date[res_date]["total_guests"] += reservation["party_size"]
        reservations_by_date[res_date]["reservations"].append({
            "id": str(reservation["_id"]),
            "customer_name": reservation["customer_name"],
            "customer_phone": reservation["customer_phone"],
            "time_slot": reservation["time_slot"],
            "party_size": reservation["party_size"],
            "status": reservation["status"],
            "special_requests": reservation.get("special_requests")
        })
    
    # Sort reservations within each date by time
    result = []
    for date_data in sorted(reservations_by_date.values(), key=lambda x: x["date"]):
        date_data["reservations"].sort(key=lambda x: x["time_slot"])
        result.append(date_data)
    
    return result


@router.get("/restaurant/reservations/today")
async def get_todays_reservations(
    current_user: dict = Depends(get_current_restaurant)
):
    """
    Get today's reservations count and list.
    PROTECTED - For restaurant dashboard stats.
    """
    # Get restaurant
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Get today's reservations
    reservations = await get_restaurant_reservations(
        restaurant_id=restaurant_id,
        date_str=today,
        status="confirmed"
    )
    
    total_guests = sum(r["party_size"] for r in reservations)
    
    # Format for dashboard
    reservation_list = []
    for r in reservations:
        reservation_list.append({
            "id": str(r["_id"]),
            "customer_name": r["customer_name"],
            "time_slot": r["time_slot"],
            "party_size": r["party_size"],
            "status": r["status"]
        })
    
    return {
        "date": today,
        "total_reservations": len(reservations),
        "total_guests": total_guests,
        "reservations": sorted(reservation_list, key=lambda x: x["time_slot"])
    }


@router.put("/restaurant/reservations/{reservation_id}/status")
async def update_reservation_status_by_restaurant(
    reservation_id: str,
    payload: UpdateReservationStatus,
    current_user: dict = Depends(get_current_restaurant)
):
    """
    Update reservation status (cancel, complete, mark as no-show).
    PROTECTED - Restaurant owner only.
    """
    # Get restaurant
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    
    # Get reservation
    try:
        reservation = await db.reservations.find_one({"_id": ObjectId(reservation_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid reservation ID")
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Verify reservation belongs to this restaurant
    if reservation["restaurant_id"] != restaurant_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this reservation")
    
    # Update status
    if payload.status == "cancelled":
        updated = await cancel_reservation(
            reservation_id,
            cancelled_by="restaurant",
            reason=payload.cancellation_reason
        )
    else:
        # Update to completed or no_show
        await db.reservations.update_one(
            {"_id": ObjectId(reservation_id)},
            {
                "$set": {
                    "status": payload.status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        updated = await db.reservations.find_one({"_id": ObjectId(reservation_id)})
    
    return {
        "message": f"Reservation status updated to {payload.status}",
        "reservation_id": str(updated["_id"]),
        "status": updated["status"]
    }


@router.get("/restaurant/dashboard/stats")
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_restaurant)
):
    """
    Get dashboard statistics for restaurant.
    PROTECTED - Restaurant owner only.
    """
    # Get restaurant
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Today's reservations
    today_reservations = await db.reservations.count_documents({
        "restaurant_id": restaurant_id,
        "date": today,
        "status": "confirmed"
    })
    
    # This week's stats
    week_start = (datetime.now() - timedelta(days=datetime.now().weekday())).strftime("%Y-%m-%d")
    week_end = (datetime.now() + timedelta(days=6-datetime.now().weekday())).strftime("%Y-%m-%d")
    
    week_reservations = await db.reservations.find({
        "restaurant_id": restaurant_id,
        "date": {"$gte": week_start, "$lte": week_end},
        "status": {"$in": ["confirmed", "completed"]}
    }).to_list(length=None)
    
    total_guests_this_week = sum(r["party_size"] for r in week_reservations)
    
    # Total customers (unique)
    all_reservations = await db.reservations.find({
        "restaurant_id": restaurant_id
    }).to_list(length=None)
    
    unique_customers = len(set(r["customer_email"] for r in all_reservations))
    
    return {
        "today_reservations": today_reservations,
        "week_reservations": len(week_reservations),
        "week_guests": total_guests_this_week,
        "total_customers": unique_customers,
        "week_revenue": len(week_reservations) * 35  # Mock: $35 avg per reservation
    }