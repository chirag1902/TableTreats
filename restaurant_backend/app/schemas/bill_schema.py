# app/schemas/bill_schema.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime

class BillItem(BaseModel):
    """Schema for a single bill item"""
    dish_name: str = Field(..., min_length=1, max_length=100, description="Name of the dish")
    quantity: int = Field(..., ge=1, le=100, description="Quantity ordered")
    unit_price: float = Field(..., gt=0, description="Price per unit")
    promo_id: Optional[str] = Field(None, description="Optional promo to apply to this item")
    
    @validator('unit_price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Unit price must be greater than 0')
        # Round to 2 decimal places
        return round(v, 2)


class BillCreate(BaseModel):
    """Schema for creating a bill"""
    reservation_id: str = Field(..., description="ID of the reservation to bill")
    items: List[BillItem] = Field(..., min_items=1, description="List of bill items")
    tax_rate: float = Field(..., ge=0, le=100, description="Tax rate percentage (e.g., 8.5 for 8.5%)")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes for the bill")
    
    @validator('items')
    def validate_items(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one item is required')
        return v
    
    @validator('tax_rate')
    def validate_tax_rate(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Tax rate must be between 0 and 100')
        return round(v, 2)


class BillItemResponse(BaseModel):
    """Response schema for a bill item with calculations"""
    item_id: str
    dish_name: str
    quantity: int
    unit_price: float
    subtotal: float
    discount_amount: float
    final_amount: float
    deal_applied: Optional[dict]


class BillResponse(BaseModel):
    """Response schema for a complete bill"""
    bill_id: str
    reservation_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    number_of_guests: int
    date: str
    time_slot: str
    items: List[BillItemResponse]
    subtotal: float
    discount_total: float
    subtotal_after_discount: float
    tax_rate: float
    tax_amount: float
    total: float
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]


class BillUpdate(BaseModel):
    """Schema for updating a bill"""
    items: Optional[List[BillItem]] = None
    tax_rate: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = Field(None, max_length=500)
    
    @validator('tax_rate')
    def validate_tax_rate(cls, v):
        if v is not None:
            if v < 0 or v > 100:
                raise ValueError('Tax rate must be between 0 and 100')
            return round(v, 2)
        return v