# schemas/reservation_schema.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class SeatingAreaOption(BaseModel):
    area_id: str
    area_name: str
    area_type: str
    seats_per_table: int
    available_tables: int
    area_capacity: int

class ReservationCreate(BaseModel):
    restaurant_id: str
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    date: str  # Format: "2025-01-15"
    time_slot: str  # Format: "18:00"
    number_of_guests: int
    seating_area_id: str  # Selected seating area
    special_requests: Optional[str] = None

class ReservationOut(BaseModel):
    id: str
    restaurant_id: str
    restaurant_name: str
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    date: str
    time_slot: str
    number_of_guests: int
    seating_area_id: str
    seating_area_name: str
    status: str
    special_requests: Optional[str] = None
    checked_in: bool = False
    checked_in_at: Optional[datetime] = None
    bill: Optional[Dict[str, Any]] = None
    created_at: datetime

class AvailabilityCheck(BaseModel):
    restaurant_id: str
    date: str
    time_slot: str
    number_of_guests: int

class AvailabilityResponse(BaseModel):
    available: bool
    remaining_capacity: int
    total_capacity: int
    booked: int
    available_seating_areas: List[SeatingAreaOption]

class TimeSlotAvailability(BaseModel):
    time_slot: str
    available: bool
    remaining_capacity: int
    total_capacity: int
    booked: int

class DealOut(BaseModel):
    id: str
    title: str
    description: str
    discount_type: str
    discount_value: float
    valid_days: List[str]
    time_start: str
    time_end: str
    start_date: str
    end_date: str
    is_active: bool