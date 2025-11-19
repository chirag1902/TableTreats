# app/schemas/reservation_schema.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ReservationCreate(BaseModel):
    restaurant_id: str
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_email: EmailStr
    customer_phone: str = Field(..., min_length=10, max_length=15)
    date: str
    time_slot: str
    number_of_guests: int = Field(..., ge=1, le=10)
    special_requests: Optional[str] = None


class ReservationOut(BaseModel):
    id: str
    restaurant_id: str
    restaurant_name: str
    customer_name: str
    customer_email: str
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