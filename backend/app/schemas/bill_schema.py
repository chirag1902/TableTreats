# schemas/bill_schema.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DealApplied(BaseModel):
    deal_id: str
    deal_name: str
    deal_type: str
    discount_value: float

class BillItem(BaseModel):
    item_id: str
    dish_name: str
    quantity: int
    unit_price: float
    subtotal: float
    discount_amount: float
    final_amount: float
    deal_applied: Optional[DealApplied] = None

class BillOut(BaseModel):
    bill_id: str
    reservation_id: str
    restaurant_name: str
    customer_name: str
    date: str
    time_slot: str
    number_of_guests: int
    items: List[BillItem]
    subtotal: float
    discount_total: float
    subtotal_after_discount: float
    tax_rate: float
    tax_amount: float
    total: float
    notes: Optional[str] = None
    paid: bool = False
    paid_at: Optional[datetime] = None
    created_at: datetime