# routers/bill_router.py
from fastapi import APIRouter, HTTPException, Depends
from services import bill_service
from utils.auth import get_current_customer
from schemas.bill_schema import BillOut

router = APIRouter()

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