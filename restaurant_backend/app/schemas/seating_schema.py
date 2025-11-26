# app/schemas/seating_schema.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional

class SeatingArea(BaseModel):
    """Schema for a single seating area"""
    area_type: str = Field(..., description="Type of seating area (e.g., indoor_dining, outdoor_patio)")
    area_name: str = Field(..., description="Display name for the area")
    seats_per_table: int = Field(..., ge=1, le=20, description="Number of seats per table")
    number_of_tables: int = Field(..., ge=1, le=100, description="Number of tables in this area")
    
    @validator('area_type')
    def validate_area_type(cls, v):
        allowed_types = [
            'indoor_dining', 'outdoor_patio', 'bar_area', 
            'private_room', 'lounge', 'rooftop', 'terrace', 'garden'
        ]
        if v.lower() not in allowed_types:
            raise ValueError(f'Area type must be one of: {", ".join(allowed_types)}')
        return v.lower()
    
    @validator('area_name')
    def validate_area_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Area name cannot be empty')
        return v.strip()


class SeatingConfigUpdate(BaseModel):
    """Schema for updating seating configuration"""
    seating_areas: List[SeatingArea] = Field(..., min_items=1, description="List of seating areas")
    
    @validator('seating_areas')
    def validate_seating_areas(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one seating area is required')
        return v


class SeatingAreaResponse(BaseModel):
    """Response schema for a single seating area"""
    id: str
    area_type: str
    area_name: str
    seats_per_table: int
    number_of_tables: int
    area_capacity: int


class SeatingConfigResponse(BaseModel):
    """Response schema for seating configuration"""
    restaurant_id: str
    restaurant_name: str
    total_capacity: int
    seating_areas: List[SeatingAreaResponse]
    advance_booking_days: int
    min_party_size: int
    max_party_size: int