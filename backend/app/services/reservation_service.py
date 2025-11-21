from database import Restaurant_db
from bson import ObjectId
from typing import Optional, List, Dict
from datetime import datetime, time

def get_day_name(date_str: str) -> str:
    """Convert date string to day name (monday, tuesday, etc.)"""
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    return date_obj.strftime("%A").lower()

def generate_time_slots(open_time: str, close_time: str, interval_minutes: int = 30) -> List[str]:
    """Generate time slots between open and close time with given interval"""
    
    open_hour, open_min = map(int, open_time.split(":"))
    close_hour, close_min = map(int, close_time.split(":"))
    
    slots = []
    current_hour = open_hour
    current_min = open_min
    
    while True:
        # Check if we've reached closing time
        current_total_mins = current_hour * 60 + current_min
        close_total_mins = close_hour * 60 + close_min
        
        if current_total_mins >= close_total_mins:
            break
        
        # Add current slot
        slots.append(f"{current_hour:02d}:{current_min:02d}")
        
        # Move to next slot
        current_min += interval_minutes
        if current_min >= 60:
            current_hour += 1
            current_min = 0
    
    return slots

async def get_restaurant_hours_for_date(restaurant_id: str, date: str) -> Optional[Dict]:
    """Get restaurant operating hours for a specific date"""
    
    restaurant = await Restaurant_db.restaurants.find_one(
        {"_id": ObjectId(restaurant_id)}
    )
    
    if not restaurant:
        return None
    
    day_name = get_day_name(date)
    hours = restaurant.get("hours", {})
    day_hours = hours.get(day_name, {})
    
    # Check if restaurant is closed on this day
    if day_hours.get("closed", True):
        return {
            "closed": True,
            "day": day_name
        }
    
    return {
        "closed": False,
        "day": day_name,
        "open": day_hours.get("open", "09:00"),
        "close": day_hours.get("close", "23:00")
    }

async def check_availability(
    restaurant_id: str,
    date: str,
    time_slot: str
) -> Dict:
    """Check if a restaurant has capacity for a given date and time"""
    
    # Get restaurant capacity and hours
    restaurant = await Restaurant_db.restaurants.find_one(
        {"_id": ObjectId(restaurant_id)}
    )
    
    if not restaurant:
        return {"error": "Restaurant not found"}
    
    # Check if restaurant is open on this day/time
    hours_info = await get_restaurant_hours_for_date(restaurant_id, date)
    
    if not hours_info:
        return {"error": "Restaurant not found"}
    
    if hours_info.get("closed"):
        return {
            "available": False,
            "error": f"Restaurant is closed on {hours_info['day']}s"
        }
    
    # Validate time slot is within operating hours
    valid_slots = generate_time_slots(hours_info["open"], hours_info["close"])
    if time_slot not in valid_slots:
        return {
            "available": False,
            "error": f"Time slot {time_slot} is outside operating hours ({hours_info['open']} - {hours_info['close']})"
        }
    
    # Get total capacity from seating_config
    seating_config = restaurant.get("seating_config", {})
    total_capacity = seating_config.get("total_capacity", 0)
    
    # Check existing bookings for this slot
    timeslot_doc = await Restaurant_db.timeslots.find_one({
        "restaurantId": restaurant_id,
        "date": date,
        "timeSlot": time_slot
    })
    
    booked = timeslot_doc.get("booked", 0) if timeslot_doc else 0
    remaining = total_capacity - booked
    
    return {
        "available": remaining > 0,
        "remaining_capacity": remaining,
        "total_capacity": total_capacity,
        "booked": booked
    }

async def get_daily_availability(
    restaurant_id: str,
    date: str
) -> List[Dict]:
    """Get availability for all time slots on a given date based on restaurant hours"""
    
    restaurant = await Restaurant_db.restaurants.find_one(
        {"_id": ObjectId(restaurant_id)}
    )
    
    if not restaurant:
        return []
    
    # Get operating hours for this specific date
    hours_info = await get_restaurant_hours_for_date(restaurant_id, date)
    
    if not hours_info or hours_info.get("closed"):
        return []  # Restaurant is closed on this day
    
    # Generate time slots based on operating hours
    time_slots = generate_time_slots(hours_info["open"], hours_info["close"])
    
    # Get total capacity from seating_config
    seating_config = restaurant.get("seating_config", {})
    total_capacity = seating_config.get("total_capacity", 0)
    
    # Get all booked slots for this date
    cursor = Restaurant_db.timeslots.find({
        "restaurantId": restaurant_id,
        "date": date
    })
    
    booked_slots = {}
    async for slot in cursor:
        booked_slots[slot["timeSlot"]] = slot["booked"]
    
    # Build availability for all slots
    availability = []
    for slot in time_slots:
        booked = booked_slots.get(slot, 0)
        remaining = total_capacity - booked
        
        availability.append({
            "time_slot": slot,
            "available": remaining > 0,
            "remaining_capacity": remaining,
            "total_capacity": total_capacity,
            "booked": booked
        })
    
    return availability

async def create_reservation(reservation_data: dict, customer_email: str) -> Optional[Dict]:
    """Create a new reservation with atomic slot booking"""
    
    restaurant_id = reservation_data["restaurant_id"]
    date = reservation_data["date"]
    time_slot = reservation_data["time_slot"]
    guests = reservation_data["number_of_guests"]
    
    # Check if restaurant is open and time slot is valid
    hours_info = await get_restaurant_hours_for_date(restaurant_id, date)
    
    if not hours_info:
        return None
    
    if hours_info.get("closed"):
        return None  # Restaurant is closed on this day
    
    # Validate time slot is within operating hours
    valid_slots = generate_time_slots(hours_info["open"], hours_info["close"])
    if time_slot not in valid_slots:
        return None  # Invalid time slot
    
    # Check availability
    availability = await check_availability(restaurant_id, date, time_slot)
    
    if "error" in availability or not availability.get("available") or availability["remaining_capacity"] < guests:
        return None  # Not enough capacity or other error
    
    # Get restaurant name
    restaurant = await Restaurant_db.restaurants.find_one(
        {"_id": ObjectId(restaurant_id)}
    )
    
    if not restaurant:
        return None
    
    # Create reservation document
    reservation = {
        "restaurant_id": restaurant_id,
        "restaurant_name": restaurant.get("restaurant_name", ""),
        "customer_name": reservation_data["customer_name"],
        "customer_email": customer_email,
        "customer_phone": reservation_data["customer_phone"],
        "date": date,
        "time_slot": time_slot,
        "number_of_guests": guests,
        "status": "confirmed",
        "special_requests": reservation_data.get("special_requests"),
        "created_at": datetime.utcnow()
    }
    
    # Insert reservation
    result = await Restaurant_db.reservations.insert_one(reservation)
    reservation["_id"] = result.inserted_id
    
    # Update timeslot atomically
    await Restaurant_db.timeslots.update_one(
        {
            "restaurantId": restaurant_id,
            "date": date,
            "timeSlot": time_slot
        },
        {
            "$inc": {"booked": guests},
            "$setOnInsert": {
                "restaurantId": restaurant_id,
                "date": date,
                "timeSlot": time_slot
            }
        },
        upsert=True
    )
    
    return _format_reservation(reservation)

async def get_customer_reservations(customer_email: str) -> List[Dict]:
    """Get all reservations for a customer"""
    
    cursor = Restaurant_db.reservations.find({
        "customer_email": customer_email
    }).sort("created_at", -1)
    
    reservations = await cursor.to_list(length=100)
    
    return [_format_reservation(r) for r in reservations]

async def get_reservation_by_id(reservation_id: str) -> Optional[Dict]:
    """Get a specific reservation by ID"""
    try:
        reservation = await Restaurant_db.reservations.find_one({
            "_id": ObjectId(reservation_id)
        })
        
        if not reservation:
            return None
        
        return _format_reservation(reservation)
    except Exception:
        return None

async def cancel_reservation(reservation_id: str, customer_email: str) -> bool:
    """Cancel a reservation and free up the slot"""
    
    reservation = await Restaurant_db.reservations.find_one({
        "_id": ObjectId(reservation_id),
        "customer_email": customer_email
    })
    
    if not reservation or reservation["status"] == "cancelled":
        return False
    
    # Update reservation status
    await Restaurant_db.reservations.update_one(
        {"_id": ObjectId(reservation_id)},
        {"$set": {"status": "cancelled"}}
    )
    
    # Free up the slot
    await Restaurant_db.timeslots.update_one(
        {
            "restaurantId": reservation["restaurant_id"],
            "date": reservation["date"],
            "timeSlot": reservation["time_slot"]
        },
        {"$inc": {"booked": -reservation["number_of_guests"]}}
    )
    
    return True

def _format_reservation(reservation: Dict) -> Dict:
    """Format reservation document"""
    return {
        "id": str(reservation["_id"]),
        "restaurant_id": reservation["restaurant_id"],
        "restaurant_name": reservation["restaurant_name"],
        "customer_name": reservation["customer_name"],
        "customer_email": reservation["customer_email"],
        "customer_phone": reservation["customer_phone"],
        "date": reservation["date"],
        "time_slot": reservation["time_slot"],
        "number_of_guests": reservation["number_of_guests"],
        "status": reservation["status"],
        "special_requests": reservation.get("special_requests"),
        "created_at": reservation["created_at"]
    }