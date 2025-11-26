# app/schemas/promo_schema.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, time, date

class PromoCreate(BaseModel):
    """Schema for creating a new promo"""
    title: str = Field(..., min_length=3, max_length=100, description="Promo title (e.g., 'Happy Hour Special')")
    description: str = Field(..., min_length=10, max_length=500, description="Detailed description of the offer")
    discount_type: str = Field(..., description="Type of discount: 'percentage', 'bogo', 'flat_amount'")
    discount_value: Optional[float] = Field(None, ge=0, description="Discount value (e.g., 35 for 35% or $35 off)")
    valid_days: Optional[List[str]] = Field(None, description="Days when promo is valid (e.g., ['monday', 'tuesday'])")
    time_start: Optional[str] = Field(None, description="Start time in HH:MM format (e.g., '14:00')")
    time_end: Optional[str] = Field(None, description="End time in HH:MM format (e.g., '18:00')")
    start_date: Optional[str] = Field(None, description="Start date in YYYY-MM-DD format")
    end_date: Optional[str] = Field(None, description="End date in YYYY-MM-DD format")
    is_active: bool = Field(True, description="Whether the promo is currently active")
    
    @validator('discount_type')
    def validate_discount_type(cls, v):
        allowed_types = ['percentage', 'bogo', 'flat_amount']
        if v.lower() not in allowed_types:
            raise ValueError(f'Discount type must be one of: {", ".join(allowed_types)}')
        return v.lower()
    
    @validator('discount_value')
    def validate_discount_value(cls, v, values):
        if 'discount_type' in values:
            discount_type = values['discount_type']
            # BOGO doesn't need a value
            if discount_type == 'bogo':
                return None
            # Percentage should be between 1-100
            if discount_type == 'percentage':
                if v is None or v < 1 or v > 100:
                    raise ValueError('Percentage discount must be between 1 and 100')
            # Flat amount should be positive
            if discount_type == 'flat_amount':
                if v is None or v <= 0:
                    raise ValueError('Flat amount discount must be greater than 0')
        return v
    
    @validator('valid_days')
    def validate_days(cls, v):
        if v is not None:
            allowed_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            for day in v:
                if day.lower() not in allowed_days:
                    raise ValueError(f'Invalid day: {day}. Must be one of: {", ".join(allowed_days)}')
            return [day.lower() for day in v]
        return v
    
    @validator('time_start', 'time_end')
    def validate_time_format(cls, v):
        if v is not None:
            try:
                # Validate HH:MM format
                time_parts = v.split(':')
                if len(time_parts) != 2:
                    raise ValueError
                hour, minute = int(time_parts[0]), int(time_parts[1])
                if hour < 0 or hour > 23 or minute < 0 or minute > 59:
                    raise ValueError
            except:
                raise ValueError('Time must be in HH:MM format (e.g., "14:00")')
        return v
    
    @validator('start_date', 'end_date')
    def validate_date_format(cls, v):
        if v is not None:
            try:
                datetime.strptime(v, '%Y-%m-%d')
            except:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v


class PromoUpdate(BaseModel):
    """Schema for updating an existing promo"""
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=500)
    discount_type: Optional[str] = None
    discount_value: Optional[float] = Field(None, ge=0)
    valid_days: Optional[List[str]] = None
    time_start: Optional[str] = None
    time_end: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: Optional[bool] = None
    
    @validator('discount_type')
    def validate_discount_type(cls, v):
        if v is not None:
            allowed_types = ['percentage', 'bogo', 'flat_amount']
            if v.lower() not in allowed_types:
                raise ValueError(f'Discount type must be one of: {", ".join(allowed_types)}')
            return v.lower()
        return v
    
    @validator('valid_days')
    def validate_days(cls, v):
        if v is not None:
            allowed_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            for day in v:
                if day.lower() not in allowed_days:
                    raise ValueError(f'Invalid day: {day}')
            return [day.lower() for day in v]
        return v
    
    @validator('time_start', 'time_end')
    def validate_time_format(cls, v):
        if v is not None:
            try:
                time_parts = v.split(':')
                if len(time_parts) != 2:
                    raise ValueError
                hour, minute = int(time_parts[0]), int(time_parts[1])
                if hour < 0 or hour > 23 or minute < 0 or minute > 59:
                    raise ValueError
            except:
                raise ValueError('Time must be in HH:MM format')
        return v
    
    @validator('start_date', 'end_date')
    def validate_date_format(cls, v):
        if v is not None:
            try:
                datetime.strptime(v, '%Y-%m-%d')
            except:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v


class PromoResponse(BaseModel):
    """Response schema for promo"""
    id: str
    title: str
    description: str
    discount_type: str
    discount_value: Optional[float]
    valid_days: Optional[List[str]]
    time_start: Optional[str]
    time_end: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]


class PromoListResponse(BaseModel):
    """Response schema for list of promos"""
    total: int
    promos: List[PromoResponse]