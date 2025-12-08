# routers/reservation_router.py
from fastapi import APIRouter, HTTPException, Depends
from schemas.reservation_schema import (
    ReservationCreate,
    ReservationOut,
    AvailabilityCheck,
    AvailabilityResponse,
    TimeSlotAvailability
)
from schemas.bill_schema import BillOut
from services import reservation_service, bill_service
from utils.auth import get_current_customer
from typing import List

router = APIRouter()

@router.get("/restaurants/{restaurant_id}/hours/{date}")
async def get_restaurant_hours(restaurant_id: str, date: str):
    """Get restaurant operating hours for a specific date"""
    hours = await reservation_service.get_restaurant_hours_for_date(
        restaurant_id,
        date
    )
    
    if not hours:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    if hours.get("closed"):
        return {
            "closed": True,
            "day": hours["day"],
            "message": f"Restaurant is closed on {hours['day']}s"
        }
    
    # Generate available time slots
    time_slots = reservation_service.generate_time_slots(
        hours["open"],
        hours["close"]
    )
    
    return {
        "closed": False,
        "day": hours["day"],
        "open": hours["open"],
        "close": hours["close"],
        "available_slots": time_slots
    }

@router.post("/reservations/check-availability", response_model=AvailabilityResponse)
async def check_availability(data: AvailabilityCheck):
    """Check availability for a specific time slot with seating areas"""
    availability = await reservation_service.check_availability(
        data.restaurant_id,
        data.date,
        data.time_slot,
        data.number_of_guests
    )
    
    if "error" in availability:
        raise HTTPException(status_code=400, detail=availability["error"])
    
    return availability

@router.get("/reservations/availability/{restaurant_id}/{date}", response_model=List[TimeSlotAvailability])
async def get_daily_availability(restaurant_id: str, date: str):
    """Get availability for all time slots on a given date"""
    availability = await reservation_service.get_daily_availability(
        restaurant_id,
        date
    )
    
    if not availability:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found or closed on this date"
        )
    
    return availability

@router.post("/reservations", response_model=ReservationOut)
async def create_reservation(
    reservation: ReservationCreate,
    current_user: dict = Depends(get_current_customer)
):
    """Create a new reservation with seating area (Protected - Customer only)"""
    
    new_reservation = await reservation_service.create_reservation(
        reservation.dict(),
        current_user["email"]
    )
    
    if not new_reservation:
        raise HTTPException(
            status_code=400,
            detail="Unable to create reservation. Restaurant may be closed, slot may be full, seating area unavailable, or time is outside operating hours."
        )
    
    return new_reservation

@router.get("/reservations/my-reservations", response_model=List[ReservationOut])
async def get_my_reservations(current_user: dict = Depends(get_current_customer)):
    """Get all reservations for the logged-in customer"""
    reservations = await reservation_service.get_customer_reservations(
        current_user["email"]
    )
    return reservations

@router.get("/reservations/customer/{customer_email}", response_model=List[ReservationOut])
async def get_customer_reservations_by_email(
    customer_email: str,
    current_user: dict = Depends(get_current_customer)
):
    """Get all reservations for a customer by email (Protected)"""
    # Ensure user can only access their own reservations
    if current_user["email"] != customer_email:
        raise HTTPException(status_code=403, detail="Not authorized to access these reservations")
    
    reservations = await reservation_service.get_customer_reservations(customer_email)
    return reservations

@router.get("/reservations/{reservation_id}", response_model=ReservationOut)
async def get_reservation(
    reservation_id: str,
    current_user: dict = Depends(get_current_customer)
):
    """Get a specific reservation"""
    reservation = await reservation_service.get_reservation_by_id(reservation_id)
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Ensure customer can only see their own reservations
    if reservation["customer_email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this reservation")
    
    return reservation

# ==================== BILL ROUTES ====================

@router.get("/reservations/{reservation_id}/bill", response_model=BillOut)
async def get_reservation_bill(
    reservation_id: str,
    current_user: dict = Depends(get_current_customer)
):
    """Get bill for a specific reservation"""
    bill_data = await bill_service.get_bill_by_reservation_id(
        reservation_id,
        current_user["email"]
    )
    
    if not bill_data:
        raise HTTPException(
            status_code=404,
            detail="Bill not found or you don't have access to this bill"
        )
    
    return bill_data

@router.post("/reservations/{reservation_id}/pay")
async def pay_bill(
    reservation_id: str,
    current_user: dict = Depends(get_current_customer)
):
    """Mark bill as paid"""
    result = await bill_service.mark_bill_as_paid(
        reservation_id,
        current_user["email"]
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=result["error"]
        )
    
    return {"message": "Payment successful", "transaction_id": result["transaction_id"]}

# ==================== END BILL ROUTES ====================

@router.delete("/reservations/{reservation_id}")
async def cancel_reservation(
    reservation_id: str,
    current_user: dict = Depends(get_current_customer)
):
    """Cancel a reservation (prevents cancellation if time has passed)"""
    result = await reservation_service.cancel_reservation(
        reservation_id,
        current_user["email"]
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=result["error"]
        )
    
    return {"message": "Reservation cancelled successfully"}