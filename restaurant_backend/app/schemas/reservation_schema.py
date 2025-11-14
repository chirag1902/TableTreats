# app/schemas/reservation_schema.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date, time

# ===========================
# Seating Configuration
# ===========================
class SeatingConfig(BaseModel):
    total_seats: int = 50
    slot_duration_minutes: int = 30
    advance_booking_days: int = 7
    min_party_size: int = 1
    max_party_size: int = 10
    same_day_booking_allowed: bool = True


# ===========================
# Time Slot Response
# ===========================
class TimeSlot(BaseModel):
    slot_time: str  # e.g., "09:00"
    slot_end: str   # e.g., "09:30"
    available_seats: int
    status: str  # "available", "limited", "full"


class AvailableSlotsResponse(BaseModel):
    date: str
    slots: List[TimeSlot]


# ===========================
# Reservation Create
# ===========================
class ReservationCreate(BaseModel):
    restaurant_id: str
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_email: EmailStr
    customer_phone: str = Field(..., min_length=10, max_length=15)
    date: str  # Format: "2025-01-15"
    time_slot: str  # Format: "09:00"
    party_size: int = Field(..., ge=1, le=10)
    special_requests: Optional[str] = None


# ===========================
# Reservation Response
# ===========================
class ReservationResponse(BaseModel):
    id: str
    restaurant_id: str
    restaurant_name: str
    customer_name: str
    customer_email: str
    customer_phone: str
    date: str
    time_slot: str
    party_size: int
    status: str  # "confirmed", "cancelled", "completed", "no_show"
    special_requests: Optional[str] = None
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "res_123",
                "restaurant_id": "rest_456",
                "restaurant_name": "Chipotle",
                "customer_name": "John Smith",
                "customer_email": "john@example.com",
                "customer_phone": "+1234567890",
                "date": "2025-01-15",
                "time_slot": "19:00",
                "party_size": 4,
                "status": "confirmed",
                "special_requests": "Window seat please",
                "created_at": "2025-01-10T10:30:00Z"
            }
        }


# ===========================
# Reservation List Response (for Restaurant Dashboard)
# ===========================
class ReservationListItem(BaseModel):
    id: str
    customer_name: str
    customer_phone: str
    time_slot: str
    party_size: int
    status: str
    special_requests: Optional[str] = None


class ReservationsByDateResponse(BaseModel):
    date: str
    total_reservations: int
    total_guests: int
    reservations: List[ReservationListItem]


# ===========================
# Update Reservation Status
# ===========================
class UpdateReservationStatus(BaseModel):
    status: str  # "cancelled", "completed", "no_show"
    cancellation_reason: Optional[str] = None