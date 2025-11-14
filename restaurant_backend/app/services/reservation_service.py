# app/services/reservation_service.py
from datetime import datetime, timedelta, time as dt_time
from typing import List, Dict, Tuple
from bson import ObjectId
from fastapi import HTTPException

from app.database import db


# ===========================
# Slot Generation Logic
# ===========================
def generate_time_slots(
    open_time: str,  # "09:00"
    close_time: str,  # "23:00"
    slot_duration: int = 30  # minutes
) -> List[str]:
    """
    Generate time slots between opening and closing hours.
    Returns list of slot times: ["09:00", "09:30", "10:00", ...]
    """
    slots = []
    
    # Parse times
    open_hour, open_minute = map(int, open_time.split(':'))
    close_hour, close_minute = map(int, close_time.split(':'))
    
    # Create datetime objects for calculation
    start = datetime.combine(datetime.today(), dt_time(open_hour, open_minute))
    end = datetime.combine(datetime.today(), dt_time(close_hour, close_minute))
    
    current = start
    while current < end:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=slot_duration)
    
    return slots


async def get_available_slots(
    restaurant_id: str,
    date_str: str,  # "2025-01-15"
    party_size: int
) -> List[Dict]:
    """
    Get available time slots for a specific date and party size.
    Returns list of slots with availability info.
    """
    # Get restaurant
    restaurant = await db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Check if restaurant is onboarded
    if not restaurant.get("is_onboarded"):
        raise HTTPException(status_code=400, detail="Restaurant profile incomplete")
    
    # Get day of week
    target_date = datetime.strptime(date_str, "%Y-%m-%d")
    day_name = target_date.strftime("%A").lower()
    
    # Get operating hours for this day
    hours = restaurant.get("hours", {}).get(day_name)
    if not hours or hours.get("open") == "Closed":
        return []  # Restaurant closed on this day
    
    # Get seating configuration (use defaults if not set)
    seating_config = restaurant.get("seating_config", {})
    total_seats = seating_config.get("total_seats", 50)
    slot_duration = seating_config.get("slot_duration_minutes", 30)
    
    # Generate all possible slots
    all_slots = generate_time_slots(
        hours.get("open", "09:00"),
        hours.get("close", "23:00"),
        slot_duration
    )
    
    # Get existing reservations for this date
    reservations = await db.reservations.find({
        "restaurant_id": restaurant_id,
        "date": date_str,
        "status": {"$in": ["confirmed", "completed"]}
    }).to_list(length=None)
    
    # Calculate booked seats per slot
    booked_seats_per_slot = {}
    for reservation in reservations:
        slot = reservation["time_slot"]
        booked_seats_per_slot[slot] = booked_seats_per_slot.get(slot, 0) + reservation["party_size"]
    
    # Build available slots with status
    available_slots = []
    current_datetime = datetime.now()
    target_datetime_date = target_date.date()
    
    for slot_time in all_slots:
        booked = booked_seats_per_slot.get(slot_time, 0)
        available = total_seats - booked
        
        # Check if slot is in the past (for today's date)
        if target_datetime_date == current_datetime.date():
            slot_hour, slot_minute = map(int, slot_time.split(':'))
            slot_datetime = datetime.combine(target_datetime_date, dt_time(slot_hour, slot_minute))
            
            # Skip past time slots
            if slot_datetime <= current_datetime:
                continue
        
        # Determine status
        if available >= party_size:
            if available > 10:
                status = "available"
            else:
                status = "limited"
        else:
            status = "full"
        
        # Calculate slot end time
        slot_hour, slot_minute = map(int, slot_time.split(':'))
        slot_start = dt_time(slot_hour, slot_minute)
        slot_end_datetime = datetime.combine(datetime.today(), slot_start) + timedelta(minutes=slot_duration)
        slot_end = slot_end_datetime.strftime("%H:%M")
        
        available_slots.append({
            "slot_time": slot_time,
            "slot_end": slot_end,
            "available_seats": available,
            "status": status
        })
    
    return available_slots


# ===========================
# Booking Validation
# ===========================
async def validate_booking(
    restaurant_id: str,
    date_str: str,
    time_slot: str,
    party_size: int
) -> Tuple[bool, str]:
    """
    Validate if booking can be made.
    Returns (is_valid, error_message)
    """
    # Parse date
    try:
        booking_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return False, "Invalid date format. Use YYYY-MM-DD"
    
    current_date = datetime.now().date()
    
    # Check if date is in the past
    if booking_date < current_date:
        return False, "Cannot book for past dates"
    
    # Check advance booking limit (7 days)
    max_advance_date = current_date + timedelta(days=7)
    if booking_date > max_advance_date:
        return False, "Cannot book more than 7 days in advance"
    
    # Check party size
    if party_size < 1 or party_size > 10:
        return False, "Party size must be between 1 and 10"
    
    # Get restaurant
    restaurant = await db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
    if not restaurant:
        return False, "Restaurant not found"
    
    # Get seating config
    seating_config = restaurant.get("seating_config", {})
    total_seats = seating_config.get("total_seats", 50)
    
    # Check if slot has availability
    existing_reservations = await db.reservations.find({
        "restaurant_id": restaurant_id,
        "date": date_str,
        "time_slot": time_slot,
        "status": {"$in": ["confirmed", "completed"]}
    }).to_list(length=None)
    
    total_booked = sum(r["party_size"] for r in existing_reservations)
    available_seats = total_seats - total_booked
    
    if available_seats < party_size:
        return False, f"Not enough seats available. Only {available_seats} seats left"
    
    return True, "Valid"


# ===========================
# Create Reservation
# ===========================
async def create_reservation(
    restaurant_id: str,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    date_str: str,
    time_slot: str,
    party_size: int,
    special_requests: str = None
) -> dict:
    """
    Create a new reservation.
    Returns the created reservation document.
    """
    # Validate booking
    is_valid, error_msg = await validate_booking(restaurant_id, date_str, time_slot, party_size)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Create reservation document
    reservation = {
        "restaurant_id": restaurant_id,
        "customer_name": customer_name,
        "customer_email": customer_email,
        "customer_phone": customer_phone,
        "date": date_str,
        "time_slot": time_slot,
        "party_size": party_size,
        "status": "confirmed",  # Auto-confirm
        "special_requests": special_requests,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.reservations.insert_one(reservation)
    reservation["_id"] = result.inserted_id
    
    return reservation


# ===========================
# Get Restaurant Reservations
# ===========================
async def get_restaurant_reservations(
    restaurant_id: str,
    date_str: str = None,
    status: str = None
) -> List[dict]:
    """
    Get all reservations for a restaurant.
    Can filter by date and/or status.
    """
    query = {"restaurant_id": restaurant_id}
    
    if date_str:
        query["date"] = date_str
    
    if status:
        query["status"] = status
    
    reservations = await db.reservations.find(query).sort("time_slot", 1).to_list(length=None)
    return reservations


# ===========================
# Cancel Reservation
# ===========================
async def cancel_reservation(
    reservation_id: str,
    cancelled_by: str = "customer",  # "customer" or "restaurant"
    reason: str = None
) -> dict:
    """
    Cancel a reservation.
    """
    reservation = await db.reservations.find_one({"_id": ObjectId(reservation_id)})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Reservation already cancelled")
    
    # Update status
    update_data = {
        "status": "cancelled",
        "cancelled_at": datetime.utcnow(),
        "cancelled_by": cancelled_by,
        "updated_at": datetime.utcnow()
    }
    
    if reason:
        update_data["cancellation_reason"] = reason
    
    await db.reservations.update_one(
        {"_id": ObjectId(reservation_id)},
        {"$set": update_data}
    )
    
    # Get updated reservation
    updated_reservation = await db.reservations.find_one({"_id": ObjectId(reservation_id)})
    return updated_reservation