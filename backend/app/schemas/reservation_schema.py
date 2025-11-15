from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ReservationCreate(BaseModel):
    restaurant_id: str
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    date: str  # Format: "2025-01-15"
    time_slot: str  # Format: "18:00"
    number_of_guests: int
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
    status: str
    special_requests: Optional[str] = None
    created_at: datetime

class AvailabilityCheck(BaseModel):
    restaurant_id: str
    date: str
    time_slot: str

class AvailabilityResponse(BaseModel):
    available: bool
    remaining_capacity: int
    total_capacity: int
    booked: int

class TimeSlotAvailability(BaseModel):
    time_slot: str
    available: bool
    remaining_capacity: int