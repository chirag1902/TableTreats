from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import Optional, List
from datetime import datetime, timedelta
from bson import ObjectId

from app.schemas.bill_schema import BillCreate, BillUpdate, BillResponse, BillItemResponse
import uuid

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
        reservation_data = {
            "id": str(res["_id"]),
            "customer_name": res["customer_name"],
            "customer_email": res["customer_email"],
            "customer_phone": res["customer_phone"],
            "date": res["date"],
            "time_slot": res["time_slot"],
            "number_of_guests": res["number_of_guests"],
            "status": res["status"],
            "special_requests": res.get("special_requests"),
            "checked_in": res.get("checked_in", False),
            "checked_in_at": res.get("checked_in_at"),
            "created_at": res["created_at"]
        }
        
        # Include bill data if exists
        if res.get("bill"):
            reservation_data["bill"] = res["bill"]
        
        result.append(reservation_data)
    
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
        reservation_data = {
            "id": str(res["_id"]),
            "customer_name": res["customer_name"],
            "time_slot": res["time_slot"],
            "number_of_guests": res["number_of_guests"],
            "status": res["status"],
            "checked_in": res.get("checked_in", False),
            "checked_in_at": res.get("checked_in_at")
        }
        
        # Include bill data if exists
        if res.get("bill"):
            reservation_data["bill"] = res["bill"]
        
        result.append(reservation_data)
    
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
    
    result = {
        "id": str(reservation["_id"]),
        "customer_name": reservation["customer_name"],
        "customer_email": reservation["customer_email"],
        "customer_phone": reservation["customer_phone"],
        "date": reservation["date"],
        "time_slot": reservation["time_slot"],
        "number_of_guests": reservation["number_of_guests"],
        "status": reservation["status"],
        "special_requests": reservation.get("special_requests"),
        "checked_in": reservation.get("checked_in", False),
        "checked_in_at": reservation.get("checked_in_at"),
        "created_at": reservation["created_at"],
        "updated_at": reservation.get("updated_at")
    }
    
    # ADD THESE LINES - Include bill data if exists
    if reservation.get("bill"):
        result["bill"] = reservation["bill"]
    
    return result




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
    
@router.patch("/restaurant/reservations/{reservation_id}/check-in")
async def check_in_customer(
    reservation_id: str,
    current_user: dict = Depends(get_current_restaurant)
):
    """Check in a customer when they arrive at the restaurant"""
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
        raise HTTPException(status_code=403, detail="Not authorized to check in this reservation")
    
    if reservation.get("checked_in", False):
        raise HTTPException(status_code=400, detail="Customer already checked in")
    
    if reservation["status"] != "confirmed":
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot check in reservation with status: {reservation['status']}"
        )
    
    await db.reservations.update_one(
        {"_id": ObjectId(reservation_id)},
        {"$set": {
            "checked_in": True,
            "checked_in_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {
        "message": "Customer checked in successfully",
        "reservation_id": reservation_id,
        "customer_name": reservation["customer_name"],
        "checked_in_at": datetime.utcnow().isoformat(),
        "time_slot": reservation["time_slot"],
        "number_of_guests": reservation["number_of_guests"]
    }


@router.patch("/restaurant/reservations/{reservation_id}/undo-check-in")
async def undo_check_in(
    reservation_id: str,
    current_user: dict = Depends(get_current_restaurant)
):
    """Undo check-in (in case of mistake) - Not allowed if bill exists"""
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
    
    if not reservation.get("checked_in", False):
        raise HTTPException(status_code=400, detail="Customer was not checked in")
    
    # NEW: Check if bill exists
    if reservation.get("bill"):
        raise HTTPException(
            status_code=400, 
            detail="Cannot undo check-in after bill has been generated"
        )
    
    await db.reservations.update_one(
        {"_id": ObjectId(reservation_id)},
        {
            "$set": {
                "checked_in": False,
                "updated_at": datetime.utcnow()
            },
            "$unset": {
                "checked_in_at": ""
            }
        }
    )
    
    return {
        "message": "Check-in undone successfully",
        "reservation_id": reservation_id,
        "customer_name": reservation["customer_name"]
    }

@router.get("/restaurant/reservations/today/check-in-status")
async def get_todays_checkin_status(current_user: dict = Depends(get_current_restaurant)):
    """Get today's reservations with check-in status"""
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
    
    total_reservations = len(reservations)
    checked_in_count = sum(1 for r in reservations if r.get("checked_in", False))
    not_checked_in_count = total_reservations - checked_in_count
    total_guests_expected = sum(r["number_of_guests"] for r in reservations)
    total_guests_checked_in = sum(
        r["number_of_guests"] for r in reservations if r.get("checked_in", False)
    )
    
    formatted_reservations = []
    for res in reservations:
        formatted_reservations.append({
            "id": str(res["_id"]),
            "customer_name": res["customer_name"],
            "customer_phone": res["customer_phone"],
            "time_slot": res["time_slot"],
            "number_of_guests": res["number_of_guests"],
            "checked_in": res.get("checked_in", False),
            "checked_in_at": res.get("checked_in_at"),
            "special_requests": res.get("special_requests")
        })
    
    return {
        "date": today,
        "summary": {
            "total_reservations": total_reservations,
            "checked_in": checked_in_count,
            "not_checked_in": not_checked_in_count,
            "total_guests_expected": total_guests_expected,
            "total_guests_checked_in": total_guests_checked_in
        },
        "reservations": formatted_reservations
    }



# ==================== BILL MANAGEMENT ENDPOINTS ====================

@router.get("/restaurant/reservations/checked-in-unbilled")
async def get_checked_in_customers_for_billing(
    current_user: dict = Depends(get_current_restaurant)
):
    """Get list of checked-in customers who don't have a bill yet (for dropdown)"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Get checked-in reservations without bills
    reservations = await db.reservations.find({
        "restaurant_id": restaurant_id,
        "date": today,
        "status": "confirmed",
        "checked_in": True,
        "bill": {"$exists": False}  # No bill created yet
    }).sort("time_slot", 1).to_list(length=None)
    
    # Format for dropdown
    customers = []
    for res in reservations:
        customers.append({
            "reservation_id": str(res["_id"]),
            "customer_name": res["customer_name"],
            "customer_email": res.get("customer_email", ""),
            "customer_phone": res.get("customer_phone", ""),
            "number_of_guests": res["number_of_guests"],
            "time_slot": res["time_slot"],
            "display_text": f"{res['customer_name']} - {res['number_of_guests']} guests"
        })
    
    return {
        "total": len(customers),
        "customers": customers
    }


def calculate_bill_totals(items_data: List[dict], promos: List[dict], tax_rate: float):
    """
    Helper function to calculate bill totals with promo discounts
    
    Args:
        items_data: List of items with dish_name, quantity, unit_price, promo_id
        promos: List of restaurant's promos
        tax_rate: Tax rate percentage
    
    Returns:
        Tuple of (processed_items, subtotal, discount_total, tax_amount, total)
    """
    processed_items = []
    subtotal = 0
    discount_total = 0
    
    for item in items_data:
        # Calculate item subtotal
        item_subtotal = round(item["quantity"] * item["unit_price"], 2)
        subtotal += item_subtotal
        
        # Apply promo discount if specified
        discount_amount = 0
        deal_applied = None
        
        if item.get("promo_id"):
            # Find the promo
            promo = next((p for p in promos if p.get("id") == item["promo_id"]), None)
            
            if promo and promo.get("is_active", False):
                discount_type = promo.get("discount_type")
                discount_value = promo.get("discount_value")
                
                if discount_type == "percentage":
                    discount_amount = round(item_subtotal * (discount_value / 100), 2)
                elif discount_type == "flat_amount":
                    discount_amount = min(discount_value, item_subtotal)
                elif discount_type == "bogo":
                    # BOGO: If quantity >= 2, discount half
                    if item["quantity"] >= 2:
                        free_items = item["quantity"] // 2
                        discount_amount = round(free_items * item["unit_price"], 2)
                
                discount_total += discount_amount
                
                deal_applied = {
                    "deal_id": promo["id"],
                    "deal_name": promo["title"],
                    "deal_type": promo["discount_type"],
                    "discount_value": promo.get("discount_value")
                }
        
        final_item_amount = item_subtotal - discount_amount
        
        processed_items.append({
            "item_id": str(uuid.uuid4()),
            "dish_name": item["dish_name"],
            "quantity": item["quantity"],
            "unit_price": item["unit_price"],
            "subtotal": item_subtotal,
            "discount_amount": discount_amount,
            "final_amount": final_item_amount,
            "deal_applied": deal_applied
        })
    
    # Calculate totals
    subtotal_after_discount = round(subtotal - discount_total, 2)
    tax_amount = round(subtotal_after_discount * (tax_rate / 100), 2)
    total = round(subtotal_after_discount + tax_amount, 2)
    
    return processed_items, subtotal, discount_total, tax_amount, total


@router.post("/restaurant/bills", status_code=status.HTTP_201_CREATED)
async def create_bill(
    payload: BillCreate,
    current_user: dict = Depends(get_current_restaurant)
):
    """Create a bill for a reservation"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    
    # Find reservation
    try:
        reservation = await db.reservations.find_one({"_id": ObjectId(payload.reservation_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid reservation ID")
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Verify reservation belongs to this restaurant
    if reservation["restaurant_id"] != restaurant_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if reservation is checked in
    if not reservation.get("checked_in", False):
        raise HTTPException(status_code=400, detail="Customer must be checked in before creating bill")
    
    # Check if bill already exists
    if reservation.get("bill"):
        raise HTTPException(status_code=400, detail="Bill already exists for this reservation")
    
    # Get restaurant promos for discount calculation
    promos = restaurant.get("promos", [])
    
    # Convert payload items to dict format
    items_data = [item.dict() for item in payload.items]
    
    # Calculate totals
    processed_items, subtotal, discount_total, tax_amount, total = calculate_bill_totals(
        items_data, promos, payload.tax_rate
    )
    
    # Create bill document
    bill_data = {
        "bill_id": str(uuid.uuid4()),
        "items": processed_items,
        "subtotal": subtotal,
        "discount_total": discount_total,
        "subtotal_after_discount": round(subtotal - discount_total, 2),
        "tax_rate": payload.tax_rate,
        "tax_amount": tax_amount,
        "total": total,
        "notes": payload.notes,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    # Add bill to reservation
    await db.reservations.update_one(
        {"_id": ObjectId(payload.reservation_id)},
        {"$set": {
            "bill": bill_data,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {
        "message": "Bill created successfully",
        "bill_id": bill_data["bill_id"],
        "reservation_id": payload.reservation_id,
        "total": total,
        "bill": bill_data
    }


@router.get("/restaurant/bills/{reservation_id}")
async def get_bill(
    reservation_id: str,
    current_user: dict = Depends(get_current_restaurant)
):
    """Get bill details for a reservation"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    
    # Find reservation
    try:
        reservation = await db.reservations.find_one({"_id": ObjectId(reservation_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid reservation ID")
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Verify reservation belongs to this restaurant
    if reservation["restaurant_id"] != restaurant_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if bill exists
    if not reservation.get("bill"):
        raise HTTPException(status_code=404, detail="No bill found for this reservation")
    
    bill = reservation["bill"]
    
    return {
        "bill_id": bill["bill_id"],
        "reservation_id": str(reservation["_id"]),
        "customer_name": reservation["customer_name"],
        "customer_email": reservation.get("customer_email", ""),
        "customer_phone": reservation.get("customer_phone", ""),
        "number_of_guests": reservation["number_of_guests"],
        "date": reservation["date"],
        "time_slot": reservation["time_slot"],
        "items": bill["items"],
        "subtotal": bill["subtotal"],
        "discount_total": bill["discount_total"],
        "subtotal_after_discount": bill["subtotal_after_discount"],
        "tax_rate": bill["tax_rate"],
        "tax_amount": bill["tax_amount"],
        "total": bill["total"],
        "notes": bill.get("notes"),
        "created_at": bill["created_at"],
        "updated_at": bill.get("updated_at"),
        "paid": bill.get("paid", False),           # ADDED
        "paid_at": bill.get("paid_at")             # ADDED
    }

@router.put("/restaurant/bills/{reservation_id}")
async def update_bill(
    reservation_id: str,
    payload: BillUpdate,
    current_user: dict = Depends(get_current_restaurant)
):
    """Update bill items or tax rate"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    
    # Find reservation
    try:
        reservation = await db.reservations.find_one({"_id": ObjectId(reservation_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid reservation ID")
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation["restaurant_id"] != restaurant_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not reservation.get("bill"):
        raise HTTPException(status_code=404, detail="No bill found for this reservation")
    
    bill = reservation["bill"]
    
    # Update items if provided
    if payload.items is not None:
        promos = restaurant.get("promos", [])
        items_data = [item.dict() for item in payload.items]
        tax_rate = payload.tax_rate if payload.tax_rate is not None else bill["tax_rate"]
        
        processed_items, subtotal, discount_total, tax_amount, total = calculate_bill_totals(
            items_data, promos, tax_rate
        )
        
        bill["items"] = processed_items
        bill["subtotal"] = subtotal
        bill["discount_total"] = discount_total
        bill["subtotal_after_discount"] = round(subtotal - discount_total, 2)
        bill["tax_amount"] = tax_amount
        bill["total"] = total
        bill["tax_rate"] = tax_rate
    
    # Update tax rate only if provided and items not updated
    elif payload.tax_rate is not None:
        subtotal_after_discount = bill["subtotal_after_discount"]
        tax_amount = round(subtotal_after_discount * (payload.tax_rate / 100), 2)
        total = round(subtotal_after_discount + tax_amount, 2)
        
        bill["tax_rate"] = payload.tax_rate
        bill["tax_amount"] = tax_amount
        bill["total"] = total
    
    # Update notes if provided
    if payload.notes is not None:
        bill["notes"] = payload.notes
    
    bill["updated_at"] = datetime.utcnow()
    
    # Update in database
    await db.reservations.update_one(
        {"_id": ObjectId(reservation_id)},
        {"$set": {
            "bill": bill,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {
        "message": "Bill updated successfully",
        "bill_id": bill["bill_id"],
        "total": bill["total"]
    }


@router.delete("/restaurant/bills/{reservation_id}")
async def delete_bill(
    reservation_id: str,
    current_user: dict = Depends(get_current_restaurant)
):
    """Delete a bill"""
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
    
    if not reservation.get("bill"):
        raise HTTPException(status_code=404, detail="No bill found")
    
    # Remove bill from reservation
    await db.reservations.update_one(
        {"_id": ObjectId(reservation_id)},
        {
            "$unset": {"bill": ""},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {
        "message": "Bill deleted successfully",
        "reservation_id": reservation_id
    }


@router.get("/restaurant/bills")
async def get_all_bills(
    date: Optional[str] = Query(None, description="Filter by date YYYY-MM-DD"),
    current_user: dict = Depends(get_current_restaurant)
):
    """Get all bills for the restaurant"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    
    # Build query
    query = {
        "restaurant_id": restaurant_id,
        "bill": {"$exists": True}
    }
    
    if date:
        query["date"] = date
    
    # Get reservations with bills
    reservations = await db.reservations.find(query).sort("date", -1).to_list(length=None)
    
    bills = []
    for res in reservations:
        bill = res["bill"]
        bills.append({
            "bill_id": bill["bill_id"],
            "reservation_id": str(res["_id"]),
            "customer_name": res["customer_name"],
            "date": res["date"],
            "time_slot": res["time_slot"],
            "number_of_guests": res["number_of_guests"],
            "total": bill["total"],
            "created_at": bill["created_at"]
        })
    
    return {
        "total": len(bills),
        "bills": bills
    }