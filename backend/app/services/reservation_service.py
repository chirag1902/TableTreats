# services/reservation_service.py
"""
Reservation service for managing restaurant reservations.
Handles availability checking, time slot generation, reservation creation/cancellation, and seating area management.
"""

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
        current_total_mins = current_hour * 60 + current_min
        close_total_mins = close_hour * 60 + close_min
        
        if current_total_mins >= close_total_mins:
            break
        
        slots.append(f"{current_hour:02d}:{current_min:02d}")
        
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

async def get_available_seating_areas(
    restaurant_id: str,
    date: str,
    time_slot: str,
    number_of_guests: int
) -> List[Dict]:
    """Get seating areas that can accommodate the number of guests"""
    
    restaurant = await Restaurant_db.restaurants.find_one(
        {"_id": ObjectId(restaurant_id)}
    )
    
    if not restaurant:
        return []
    
    seating_config = restaurant.get("seating_config", {})
    seating_areas = seating_config.get("seating_areas", [])
    
    available_areas = []
    
    for area in seating_areas:
        area_capacity = area.get("area_capacity", 0)
        seats_per_table = area.get("seats_per_table", 2)
        
        if area_capacity < number_of_guests:
            continue
        
        timeslot_doc = await Restaurant_db.timeslots.find_one({
            "restaurantId": restaurant_id,
            "date": date,
            "timeSlot": time_slot,
            "seatingAreaId": area.get("id")
        })
        
        booked = timeslot_doc.get("booked", 0) if timeslot_doc else 0
        remaining = area_capacity - booked
        
        if remaining >= number_of_guests:
            available_tables = remaining // seats_per_table
            
            available_areas.append({
                "area_id": area.get("id"),
                "area_name": area.get("area_name"),
                "area_type": area.get("area_type"),
                "seats_per_table": seats_per_table,
                "available_tables": available_tables,
                "area_capacity": area_capacity,
                "remaining_capacity": remaining
            })
    
    return available_areas

async def check_availability(
    restaurant_id: str,
    date: str,
    time_slot: str,
    number_of_guests: int = 1
) -> Dict:
    """Check availability with seating areas"""
    
    restaurant = await Restaurant_db.restaurants.find_one(
        {"_id": ObjectId(restaurant_id)}
    )
    
    if not restaurant:
        return {"error": "Restaurant not found"}
    
    hours_info = await get_restaurant_hours_for_date(restaurant_id, date)
    
    if not hours_info:
        return {"error": "Restaurant not found"}
    
    if hours_info.get("closed"):
        return {
            "available": False,
            "error": f"Restaurant is closed on {hours_info['day']}s"
        }
    
    valid_slots = generate_time_slots(hours_info["open"], hours_info["close"])
    if time_slot not in valid_slots:
        return {
            "available": False,
            "error": f"Time slot {time_slot} is outside operating hours"
        }
    
    available_areas = await get_available_seating_areas(
        restaurant_id, date, time_slot, number_of_guests
    )
    
    seating_config = restaurant.get("seating_config", {})
    total_capacity = seating_config.get("total_capacity", 0)
    
    cursor = Restaurant_db.timeslots.find({
        "restaurantId": restaurant_id,
        "date": date,
        "timeSlot": time_slot
    })
    
    total_booked = 0
    async for slot in cursor:
        total_booked += slot.get("booked", 0)
    
    remaining = total_capacity - total_booked
    
    return {
        "available": len(available_areas) > 0,
        "remaining_capacity": remaining,
        "total_capacity": total_capacity,
        "booked": total_booked,
        "available_seating_areas": available_areas
    }

async def get_daily_availability(
    restaurant_id: str,
    date: str
) -> List[Dict]:
    """Get availability for all time slots on a given date"""
    
    restaurant = await Restaurant_db.restaurants.find_one(
        {"_id": ObjectId(restaurant_id)}
    )
    
    if not restaurant:
        return []
    
    hours_info = await get_restaurant_hours_for_date(restaurant_id, date)
    
    if not hours_info or hours_info.get("closed"):
        return []
    
    time_slots = generate_time_slots(hours_info["open"], hours_info["close"])
    
    seating_config = restaurant.get("seating_config", {})
    total_capacity = seating_config.get("total_capacity", 0)
    
    cursor = Restaurant_db.timeslots.find({
        "restaurantId": restaurant_id,
        "date": date
    })
    
    booked_slots = {}
    async for slot in cursor:
        time_slot = slot["timeSlot"]
        if time_slot not in booked_slots:
            booked_slots[time_slot] = 0
        booked_slots[time_slot] += slot.get("booked", 0)
    
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
    """Create a new reservation with seating area"""
    
    restaurant_id = reservation_data["restaurant_id"]
    date = reservation_data["date"]
    time_slot = reservation_data["time_slot"]
    guests = reservation_data["number_of_guests"]
    seating_area_id = reservation_data["seating_area_id"]
    
    hours_info = await get_restaurant_hours_for_date(restaurant_id, date)
    
    if not hours_info or hours_info.get("closed"):
        return None
    
    valid_slots = generate_time_slots(hours_info["open"], hours_info["close"])
    if time_slot not in valid_slots:
        return None
    
    available_areas = await get_available_seating_areas(
        restaurant_id, date, time_slot, guests
    )
    
    area_available = any(area["area_id"] == seating_area_id for area in available_areas)
    
    if not area_available:
        return None
    
    restaurant = await Restaurant_db.restaurants.find_one(
        {"_id": ObjectId(restaurant_id)}
    )
    
    if not restaurant:
        return None
    
    seating_config = restaurant.get("seating_config", {})
    seating_areas = seating_config.get("seating_areas", [])
    area_name = next(
        (area["area_name"] for area in seating_areas if area["id"] == seating_area_id),
        "Unknown Area"
    )
    
    reservation = {
        "restaurant_id": restaurant_id,
        "restaurant_name": restaurant.get("restaurant_name", ""),
        "customer_name": reservation_data["customer_name"],
        "customer_email": customer_email,
        "customer_phone": reservation_data["customer_phone"],
        "date": date,
        "time_slot": time_slot,
        "number_of_guests": guests,
        "seating_area_id": seating_area_id,
        "seating_area_name": area_name,
        "status": "confirmed",
        "special_requests": reservation_data.get("special_requests"),
        "checked_in": False,
        "created_at": datetime.utcnow()
    }
    
    result = await Restaurant_db.reservations.insert_one(reservation)
    reservation["_id"] = result.inserted_id
    
    await Restaurant_db.timeslots.update_one(
        {
            "restaurantId": restaurant_id,
            "date": date,
            "timeSlot": time_slot,
            "seatingAreaId": seating_area_id
        },
        {
            "$inc": {"booked": guests},
            "$setOnInsert": {
                "restaurantId": restaurant_id,
                "date": date,
                "timeSlot": time_slot,
                "seatingAreaId": seating_area_id
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

async def cancel_reservation(reservation_id: str, customer_email: str) -> Dict:
    """Cancel a reservation and free up the slot"""
    
    reservation = await Restaurant_db.reservations.find_one({
        "_id": ObjectId(reservation_id),
        "customer_email": customer_email
    })
    
    if not reservation:
        return {"success": False, "error": "Reservation not found"}
    
    if reservation["status"] == "cancelled":
        return {"success": False, "error": "Reservation already cancelled"}
    
    # Check if already checked in
    if reservation.get("checked_in"):
        return {"success": False, "error": "Cannot cancel - already checked in"}
    
    # Check if the reservation time has passed
    reservation_date = reservation["date"]
    reservation_time = reservation["time_slot"]
    
    reservation_datetime = datetime.strptime(
        f"{reservation_date} {reservation_time}", 
        "%Y-%m-%d %H:%M"
    )
    
    current_datetime = datetime.utcnow()
    
    if current_datetime >= reservation_datetime:
        return {
            "success": False, 
            "error": "Cannot cancel reservation. The reservation time has already passed."
        }
    
    await Restaurant_db.reservations.update_one(
        {"_id": ObjectId(reservation_id)},
        {"$set": {"status": "cancelled"}}
    )
    
    await Restaurant_db.timeslots.update_one(
        {
            "restaurantId": reservation["restaurant_id"],
            "date": reservation["date"],
            "timeSlot": reservation["time_slot"],
            "seatingAreaId": reservation.get("seating_area_id")
        },
        {"$inc": {"booked": -reservation["number_of_guests"]}}
    )
    
    return {"success": True}

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
        "seating_area_id": reservation.get("seating_area_id", ""),
        "seating_area_name": reservation.get("seating_area_name", ""),
        "status": reservation["status"],
        "special_requests": reservation.get("special_requests"),
        "checked_in": reservation.get("checked_in", False),
        "checked_in_at": reservation.get("checked_in_at"),
        "bill": reservation.get("bill"),
        "created_at": reservation["created_at"]
    }