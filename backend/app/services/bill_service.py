# services/bill_service.py

"""
Bill service for managing customer bills and payments.
Handles retrieving bills associated with reservations and marking bills as paid.
"""


from database import Restaurant_db
from bson import ObjectId
from typing import Optional, Dict
from datetime import datetime

async def get_bill_by_reservation_id(reservation_id: str, customer_email: str) -> Optional[Dict]:
    """Get bill for a specific reservation"""
    try:
        reservation = await Restaurant_db.reservations.find_one({
            "_id": ObjectId(reservation_id),
            "customer_email": customer_email
        })
        
        if not reservation:
            return None
        
        # Check if bill exists
        if "bill" not in reservation or not reservation["bill"]:
            return None
        
        bill = reservation["bill"]
        
        return {
            "bill_id": bill.get("bill_id"),
            "reservation_id": str(reservation["_id"]),
            "restaurant_name": reservation.get("restaurant_name"),
            "customer_name": reservation.get("customer_name"),
            "date": reservation.get("date"),
            "time_slot": reservation.get("time_slot"),
            "number_of_guests": reservation.get("number_of_guests"),
            "items": bill.get("items", []),
            "subtotal": bill.get("subtotal", 0),
            "discount_total": bill.get("discount_total", 0),
            "subtotal_after_discount": bill.get("subtotal_after_discount", 0),
            "tax_rate": bill.get("tax_rate", 0),
            "tax_amount": bill.get("tax_amount", 0),
            "total": bill.get("total", 0),
            "notes": bill.get("notes"),
            "paid": bill.get("paid", False),
            "paid_at": bill.get("paid_at"),
            "created_at": bill.get("created_at")
        }
    except Exception as e:
        print(f"Error fetching bill: {e}")
        return None

async def mark_bill_as_paid(reservation_id: str, customer_email: str) -> Dict:
    """Mark a bill as paid"""
    try:
        reservation = await Restaurant_db.reservations.find_one({
            "_id": ObjectId(reservation_id),
            "customer_email": customer_email
        })
        
        if not reservation:
            return {"success": False, "error": "Reservation not found"}
        
        if "bill" not in reservation or not reservation["bill"]:
            return {"success": False, "error": "No bill found for this reservation"}
        
        if reservation["bill"].get("paid"):
            return {"success": False, "error": "Bill already paid"}
        
        # Update bill as paid
        await Restaurant_db.reservations.update_one(
            {"_id": ObjectId(reservation_id)},
            {
                "$set": {
                    "bill.paid": True,
                    "bill.paid_at": datetime.utcnow(),
                    "status": "completed"
                }
            }
        )
        
        return {
            "success": True,
            "transaction_id": reservation["bill"].get("bill_id")
        }
    except Exception as e:
        print(f"Error marking bill as paid: {e}")
        return {"success": False, "error": "Failed to process payment"}