# app/schemas/promo_schema.py
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List
from datetime import datetime

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
    
    @field_validator('discount_type')
    @classmethod
    def validate_discount_type(cls, v):
        allowed_types = ['percentage', 'bogo', 'flat_amount']
        if v.lower() not in allowed_types:
            raise ValueError(f'Discount type must be one of: {", ".join(allowed_types)}')
        return v.lower()
    
    @field_validator('valid_days')
    @classmethod
    def validate_days(cls, v):
        if v is not None:
            allowed_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            for day in v:
                if day.lower() not in allowed_days:
                    raise ValueError(f'Invalid day: {day}. Must be one of: {", ".join(allowed_days)}')
            return [day.lower() for day in v]
        return v
    
    @field_validator('time_start', 'time_end')
    @classmethod
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
    
    @field_validator('start_date', 'end_date')
    @classmethod
    def validate_date_format(cls, v):
        if v is not None:
            try:
                datetime.strptime(v, '%Y-%m-%d')
            except:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v
    
    @model_validator(mode='after')
    def validate_discount_and_dates(self):
        """Validate discount_value based on discount_type and date ranges"""
        # Validate discount_value with discount_type
        if self.discount_type == 'bogo':
            # BOGO doesn't need a value, set it to None
            self.discount_value = None
        elif self.discount_type == 'percentage':
            # Percentage must be between 1-100
            if self.discount_value is None or self.discount_value < 1 or self.discount_value > 100:
                raise ValueError('Percentage discount must be between 1 and 100')
        elif self.discount_type == 'flat_amount':
            # Flat amount must be positive
            if self.discount_value is None or self.discount_value <= 0:
                raise ValueError('Flat amount discount must be greater than 0')
        
        # Validate time range
        if self.time_start and self.time_end:
            if self.time_start >= self.time_end:
                raise ValueError('time_start must be before time_end')
        
        # Validate date range
        if self.start_date and self.end_date:
            start = datetime.strptime(self.start_date, '%Y-%m-%d')
            end = datetime.strptime(self.end_date, '%Y-%m-%d')
            if start > end:
                raise ValueError('start_date must be before or equal to end_date')
        
        return self


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
    
    @field_validator('discount_type')
    @classmethod
    def validate_discount_type(cls, v):
        if v is not None:
            allowed_types = ['percentage', 'bogo', 'flat_amount']
            if v.lower() not in allowed_types:
                raise ValueError(f'Discount type must be one of: {", ".join(allowed_types)}')
            return v.lower()
        return v
    
    @field_validator('valid_days')
    @classmethod
    def validate_days(cls, v):
        if v is not None:
            allowed_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            for day in v:
                if day.lower() not in allowed_days:
                    raise ValueError(f'Invalid day: {day}')
            return [day.lower() for day in v]
        return v
    
    @field_validator('time_start', 'time_end')
    @classmethod
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
    
    @field_validator('start_date', 'end_date')
    @classmethod
    def validate_date_format(cls, v):
        if v is not None:
            try:
                datetime.strptime(v, '%Y-%m-%d')
            except:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v
    
    @model_validator(mode='after')
    def validate_discount_value_with_type(self):
        """Validate discount_value based on discount_type if both are provided"""
        # Only validate if discount_type is being updated
        if self.discount_type is not None:
            if self.discount_type == 'bogo':
                # BOGO doesn't need a value, set it to None
                self.discount_value = None
            elif self.discount_type == 'percentage':
                # If updating to percentage, discount_value must be between 1-100
                if self.discount_value is not None and (self.discount_value < 1 or self.discount_value > 100):
                    raise ValueError('Percentage discount must be between 1 and 100')
                elif self.discount_value is None:
                    raise ValueError('Percentage discount requires a discount_value between 1 and 100')
            elif self.discount_type == 'flat_amount':
                # If updating to flat_amount, discount_value must be positive
                if self.discount_value is not None and self.discount_value <= 0:
                    raise ValueError('Flat amount discount must be greater than 0')
                elif self.discount_value is None:
                    raise ValueError('Flat amount discount requires a positive discount_value')
        
        return self


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