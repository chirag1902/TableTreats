# app/routers/restaurant_router.py
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse
from typing import List, Optional
from app.schemas.seating_schema import SeatingConfigUpdate, SeatingConfigResponse, SeatingAreaResponse
from app.schemas.promo_schema import PromoCreate, PromoUpdate, PromoResponse, PromoListResponse
import uuid


import json
from bson import ObjectId
from datetime import datetime
import io


from app.schemas.restaurant_schema import RestaurantSignup, RestaurantLogin, RestaurantProfile
from app.database import db
from app.services.auth import (
    hash_password, 
    verify_password, 
    create_access_token, 
    get_current_restaurant
)
from app.services.restaurant_service import (
    upload_image_to_gridfs,
    get_image_from_gridfs,
    delete_image_from_gridfs
)

router = APIRouter()

@router.post("/restaurant/signup", status_code=status.HTTP_201_CREATED)
async def restaurant_signup(payload: RestaurantSignup):
    """Register a new restaurant"""
    # Check if email already exists
    existing = await db.restaurants.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_password = hash_password(payload.password)

    # Insert restaurant record
    restaurant_data = {
        "restaurant_name": payload.restaurant_name,
        "email": payload.email,
        "password": hashed_password,
        "phone_number": payload.phone_number,
        "address": payload.address,
        "role": "restaurant",
        "is_onboarded": False,
        "created_at": datetime.utcnow()
    }
    
    result = await db.restaurants.insert_one(restaurant_data)

    return {
        "msg": "Signup successful",
        "restaurant_id": str(result.inserted_id)
    }


@router.post("/restaurant/login")
async def restaurant_login(payload: RestaurantLogin):
    """Login restaurant and return JWT token"""
    # Find restaurant by email
    restaurant = await db.restaurants.find_one({"email": payload.email})
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not verify_password(payload.password, restaurant["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create JWT token
    access_token = create_access_token(
        data={"sub": restaurant["email"], "role": "restaurant"}
    )
    
    return {
        "msg": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "email": restaurant["email"],
        "is_onboarded": restaurant.get("is_onboarded", False)
    }


@router.post("/restaurant/complete-profile")
async def complete_profile(
    restaurant_name: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    zipcode: str = Form(...),
    phone: str = Form(...),
    description: str = Form(""),
    cuisine: str = Form(...),
    features: str = Form(...),
    hours: str = Form(...),
    total_capacity: int = Form(50, description="Total seating capacity per time slot"),
    thumbnail: Optional[UploadFile] = File(None),
    ambiance_photo_0: Optional[UploadFile] = File(None),
    ambiance_photo_1: Optional[UploadFile] = File(None),
    ambiance_photo_2: Optional[UploadFile] = File(None),
    ambiance_photo_3: Optional[UploadFile] = File(None),
    ambiance_photo_4: Optional[UploadFile] = File(None),
    ambiance_photo_5: Optional[UploadFile] = File(None),
    menu_photo_0: Optional[UploadFile] = File(None),
    menu_photo_1: Optional[UploadFile] = File(None),
    menu_photo_2: Optional[UploadFile] = File(None),
    menu_photo_3: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_restaurant)
):
    """Complete restaurant profile with photos stored in MongoDB (Protected route)"""
    
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    
    if total_capacity < 1 or total_capacity > 500:
        raise HTTPException(status_code=400, detail="Total capacity must be between 1 and 500")
    
    try:
        cuisines_list = json.loads(cuisine)
        features_list = json.loads(features)
        hours_dict = json.loads(hours)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format in cuisine, features, or hours")
    
    thumbnail_id = None
    if thumbnail:
        thumbnail_id = await upload_image_to_gridfs(
            thumbnail, 
            metadata={"restaurant_id": restaurant_id, "type": "thumbnail"}
        )
    
    ambiance_photo_ids = []
    for i in range(6):
        photo = locals().get(f'ambiance_photo_{i}')
        if photo:
            photo_id = await upload_image_to_gridfs(
                photo,
                metadata={"restaurant_id": restaurant_id, "type": "ambiance"}
            )
            ambiance_photo_ids.append(photo_id)
    
    menu_photo_ids = []
    for i in range(4):
        photo = locals().get(f'menu_photo_{i}')
        if photo:
            photo_id = await upload_image_to_gridfs(
                photo,
                metadata={"restaurant_id": restaurant_id, "type": "menu"}
            )
            menu_photo_ids.append(photo_id)
    
    seating_config = {
        "total_capacity": total_capacity,
        "advance_booking_days": 7,
        "min_party_size": 1,
        "max_party_size": 10
    }
    
    update_data = {
        "restaurant_name": restaurant_name,
        "address": address,
        "city": city,
        "zipcode": zipcode,
        "phone": phone,
        "description": description,
        "cuisines": cuisines_list,
        "features": features_list,
        "hours": hours_dict,
        "seating_config": seating_config,
        "is_onboarded": True,
        "updated_at": datetime.utcnow()
    }
    
    if thumbnail_id:
        update_data["thumbnail_id"] = thumbnail_id
    if ambiance_photo_ids:
        update_data["ambiance_photo_ids"] = ambiance_photo_ids
    if menu_photo_ids:
        update_data["menu_photo_ids"] = menu_photo_ids
    
    await db.restaurants.update_one(
        {"_id": ObjectId(restaurant_id)},
        {"$set": update_data}
    )
    
    return {
        "message": "Profile completed successfully",
        "restaurant_id": restaurant_id,
        "seating_config": seating_config
    }


@router.get("/restaurant/me")
async def get_restaurant_profile(current_user: dict = Depends(get_current_restaurant)):
    """Get current restaurant profile (Protected route)"""
    
    # Get restaurant from database
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Convert ObjectId to string
    restaurant["id"] = str(restaurant["_id"])
    restaurant_id = restaurant["id"]
    del restaurant["_id"]
    del restaurant["password"]  # Don't send password
    
    # Add default values if not onboarded
    if not restaurant.get("is_onboarded"):
        return {
            "id": restaurant["id"],
            "name": restaurant.get("restaurant_name", ""),
            "email": restaurant["email"],
            "isOnboarded": False
        }
    
    # Build URLs for images stored in GridFS
    thumbnail_url = None
    if restaurant.get("thumbnail_id"):
        thumbnail_url = f"http://localhost:8001/api/restaurant/image/{restaurant['thumbnail_id']}"
    
    ambiance_urls = []
    for photo_id in restaurant.get("ambiance_photo_ids", []):
        ambiance_urls.append(f"http://localhost:8001/api/restaurant/image/{photo_id}")
    
    menu_urls = []
    for photo_id in restaurant.get("menu_photo_ids", []):
        menu_urls.append(f"http://localhost:8001/api/restaurant/image/{photo_id}")
    
    # Return full profile
    return {
        "id": restaurant["id"],
        "name": restaurant.get("restaurant_name", ""),
        "email": restaurant["email"],
        "isOnboarded": restaurant.get("is_onboarded", False),
        "address": restaurant.get("address", ""),
        "city": restaurant.get("city", ""),
        "zipcode": restaurant.get("zipcode", ""),
        "phone": restaurant.get("phone", ""),
        "description": restaurant.get("description", ""),
        "thumbnail": thumbnail_url,
        "ambiancePhotos": ambiance_urls,
        "menuPhotos": menu_urls,
        "cuisine": restaurant.get("cuisines", []),
        "features": restaurant.get("features", []),
        "hours": restaurant.get("hours", {}),
        "rating": 4.8,  # Mock data - replace with actual ratings later
        "totalReviews": 324  # Mock data - replace with actual reviews later
    }


@router.get("/restaurant/image/{file_id}")
async def get_restaurant_image(file_id: str):
    """
    Retrieve image from MongoDB GridFS
    This endpoint serves the actual image file
    """
    try:
        # Get image from GridFS
        content, content_type, filename = await get_image_from_gridfs(file_id)
        
        # Return image as streaming response
        return StreamingResponse(
            io.BytesIO(content),
            media_type=content_type,
            headers={
                "Content-Disposition": f'inline; filename="{filename}"',
                "Cache-Control": "public, max-age=31536000"  # Cache for 1 year
            }
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving image: {str(e)}")


@router.delete("/restaurant/image/{file_id}")
async def delete_restaurant_image(
    file_id: str,
    current_user: dict = Depends(get_current_restaurant)
):
    """Delete an image from GridFS (Protected route)"""
    
    # Verify the image belongs to this restaurant
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Check if file_id belongs to this restaurant
    all_photo_ids = (
        [restaurant.get("thumbnail_id")] +
        restaurant.get("ambiance_photo_ids", []) +
        restaurant.get("menu_photo_ids", [])
    )
    
    if file_id not in all_photo_ids:
        raise HTTPException(status_code=403, detail="Not authorized to delete this image")
    
    # Delete from GridFS
    success = await delete_image_from_gridfs(file_id)
    
    if success:
        # Remove from restaurant document
        await db.restaurants.update_one(
            {"_id": restaurant["_id"]},
            {
                "$pull": {
                    "ambiance_photo_ids": file_id,
                    "menu_photo_ids": file_id
                }
            }
        )
        
        # If it was the thumbnail, unset it
        if restaurant.get("thumbnail_id") == file_id:
            await db.restaurants.update_one(
                {"_id": restaurant["_id"]},
                {"$unset": {"thumbnail_id": ""}}
            )
        
        return {"message": "Image deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete image")


@router.put("/restaurant/profile")
async def update_restaurant_profile(
    restaurant_name: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    zipcode: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    cuisine: Optional[str] = Form(None),
    features: Optional[str] = Form(None),
    hours: Optional[str] = Form(None),
    thumbnail: Optional[UploadFile] = File(None),
    ambiance_photo_0: Optional[UploadFile] = File(None),
    ambiance_photo_1: Optional[UploadFile] = File(None),
    ambiance_photo_2: Optional[UploadFile] = File(None),
    ambiance_photo_3: Optional[UploadFile] = File(None),
    ambiance_photo_4: Optional[UploadFile] = File(None),
    ambiance_photo_5: Optional[UploadFile] = File(None),
    menu_photo_0: Optional[UploadFile] = File(None),
    menu_photo_1: Optional[UploadFile] = File(None),
    menu_photo_2: Optional[UploadFile] = File(None),
    menu_photo_3: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_restaurant)
):
    """Update restaurant profile with optional new photos (Protected route)"""
    
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    
    # Build update dictionary with only provided fields
    update_data = {"updated_at": datetime.utcnow()}
    
    if restaurant_name:
        update_data["restaurant_name"] = restaurant_name
    if address:
        update_data["address"] = address
    if city:
        update_data["city"] = city
    if zipcode:
        update_data["zipcode"] = zipcode
    if phone:
        update_data["phone"] = phone
    if description is not None:  # Allow empty string
        update_data["description"] = description
    
    # Parse JSON fields if provided
    if cuisine:
        try:
            update_data["cuisines"] = json.loads(cuisine)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format in cuisine")
    
    if features:
        try:
            update_data["features"] = json.loads(features)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format in features")
    
    if hours:
        try:
            update_data["hours"] = json.loads(hours)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format in hours")
    
    # Upload new thumbnail if provided (delete old one first)
    if thumbnail:
        # Delete old thumbnail from GridFS
        old_thumbnail_id = restaurant.get("thumbnail_id")
        if old_thumbnail_id:
            await delete_image_from_gridfs(old_thumbnail_id)
        
        # Upload new thumbnail
        thumbnail_id = await upload_image_to_gridfs(
            thumbnail, 
            metadata={"restaurant_id": restaurant_id, "type": "thumbnail"}
        )
        update_data["thumbnail_id"] = thumbnail_id
    
    # Upload new ambiance photos if provided (append to existing)
    new_ambiance_ids = []
    for i in range(6):
        photo = locals().get(f'ambiance_photo_{i}')
        if photo:
            photo_id = await upload_image_to_gridfs(
                photo,
                metadata={"restaurant_id": restaurant_id, "type": "ambiance"}
            )
            new_ambiance_ids.append(photo_id)
    
    if new_ambiance_ids:
        # Get existing IDs and append new ones
        existing_ambiance = restaurant.get("ambiance_photo_ids", [])
        update_data["ambiance_photo_ids"] = existing_ambiance + new_ambiance_ids
    
    # Upload new menu photos if provided (append to existing)
    new_menu_ids = []
    for i in range(4):
        photo = locals().get(f'menu_photo_{i}')
        if photo:
            photo_id = await upload_image_to_gridfs(
                photo,
                metadata={"restaurant_id": restaurant_id, "type": "menu"}
            )
            new_menu_ids.append(photo_id)
    
    if new_menu_ids:
        # Get existing IDs and append new ones
        existing_menu = restaurant.get("menu_photo_ids", [])
        update_data["menu_photo_ids"] = existing_menu + new_menu_ids
    
    # Update restaurant
    await db.restaurants.update_one(
        {"_id": restaurant["_id"]},
        {"$set": update_data}
    )
    
    return {
        "message": "Profile updated successfully",
        "restaurant_id": restaurant_id
    }
    



@router.get("/restaurant/seating-config", response_model=SeatingConfigResponse)
async def get_seating_config(current_user: dict = Depends(get_current_restaurant)):
    """Get current seating configuration with detailed areas"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    seating_config = restaurant.get("seating_config", {
        "total_capacity": 50,
        "seating_areas": [],
        "advance_booking_days": 7,
        "min_party_size": 1,
        "max_party_size": 10
    })
    
    # If old format (just total_capacity), convert to new format
    if "seating_areas" not in seating_config:
        seating_config["seating_areas"] = []
    
    # Format seating areas for response
    formatted_areas = []
    for area in seating_config.get("seating_areas", []):
        formatted_areas.append({
            "id": area.get("id", str(uuid.uuid4())),
            "area_type": area.get("area_type", ""),
            "area_name": area.get("area_name", ""),
            "seats_per_table": area.get("seats_per_table", 0),
            "number_of_tables": area.get("number_of_tables", 0),
            "area_capacity": area.get("area_capacity", 0)
        })
    
    return {
        "restaurant_id": str(restaurant["_id"]),
        "restaurant_name": restaurant.get("restaurant_name", ""),
        "total_capacity": seating_config.get("total_capacity", 0),
        "seating_areas": formatted_areas,
        "advance_booking_days": seating_config.get("advance_booking_days", 7),
        "min_party_size": seating_config.get("min_party_size", 1),
        "max_party_size": seating_config.get("max_party_size", 10)
    }


@router.put("/restaurant/seating-config")
async def update_seating_config(
    payload: SeatingConfigUpdate,
    current_user: dict = Depends(get_current_restaurant)
):
    """
    Update restaurant seating configuration with detailed areas.
    Automatically calculates area capacities and total capacity.
    """
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Process each seating area
    processed_areas = []
    total_capacity = 0
    
    for area in payload.seating_areas:
        # Calculate area capacity
        area_capacity = area.seats_per_table * area.number_of_tables
        total_capacity += area_capacity
        
        # Add unique ID and calculated capacity
        processed_area = {
            "id": str(uuid.uuid4()),
            "area_type": area.area_type,
            "area_name": area.area_name,
            "seats_per_table": area.seats_per_table,
            "number_of_tables": area.number_of_tables,
            "area_capacity": area_capacity
        }
        processed_areas.append(processed_area)
    
    # Validate total capacity
    if total_capacity < 1:
        raise HTTPException(status_code=400, detail="Total capacity must be at least 1")
    if total_capacity > 1000:
        raise HTTPException(status_code=400, detail="Total capacity cannot exceed 1000")
    
    # Get existing config to preserve other settings
    existing_config = restaurant.get("seating_config", {})
    
    # Build updated seating config
    updated_config = {
        "total_capacity": total_capacity,
        "seating_areas": processed_areas,
        "advance_booking_days": existing_config.get("advance_booking_days", 7),
        "min_party_size": existing_config.get("min_party_size", 1),
        "max_party_size": existing_config.get("max_party_size", 10)
    }
    
    # Update in database
    await db.restaurants.update_one(
        {"_id": restaurant["_id"]},
        {"$set": {
            "seating_config": updated_config,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {
        "message": "Seating configuration updated successfully",
        "restaurant_id": str(restaurant["_id"]),
        "total_capacity": total_capacity,
        "areas_count": len(processed_areas),
        "seating_config": updated_config
    }


@router.delete("/restaurant/seating-config/areas/{area_id}")
async def delete_seating_area(
    area_id: str,
    current_user: dict = Depends(get_current_restaurant)
):
    """Delete a specific seating area"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    seating_config = restaurant.get("seating_config", {})
    seating_areas = seating_config.get("seating_areas", [])
    
    # Find and remove the area
    updated_areas = [area for area in seating_areas if area.get("id") != area_id]
    
    if len(updated_areas) == len(seating_areas):
        raise HTTPException(status_code=404, detail="Seating area not found")
    
    if len(updated_areas) == 0:
        raise HTTPException(status_code=400, detail="Cannot delete the last seating area")
    
    # Recalculate total capacity
    total_capacity = sum(area["area_capacity"] for area in updated_areas)
    
    # Update config
    seating_config["seating_areas"] = updated_areas
    seating_config["total_capacity"] = total_capacity
    
    await db.restaurants.update_one(
        {"_id": restaurant["_id"]},
        {"$set": {
            "seating_config": seating_config,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {
        "message": "Seating area deleted successfully",
        "deleted_area_id": area_id,
        "remaining_areas": len(updated_areas),
        "new_total_capacity": total_capacity
    }

@router.post("/restaurant/promos", status_code=status.HTTP_201_CREATED)
async def create_promo(
    payload: PromoCreate,
    current_user: dict = Depends(get_current_restaurant)
):
    """Create a new promo/offer for the restaurant"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Create promo data
    promo_data = {
        "id": str(uuid.uuid4()),
        "title": payload.title,
        "description": payload.description,
        "discount_type": payload.discount_type,
        "discount_value": payload.discount_value,
        "valid_days": payload.valid_days,
        "time_start": payload.time_start,
        "time_end": payload.time_end,
        "start_date": payload.start_date,
        "end_date": payload.end_date,
        "is_active": payload.is_active,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    # Add promo to restaurant's promos array
    await db.restaurants.update_one(
        {"_id": restaurant["_id"]},
        {
            "$push": {"promos": promo_data},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {
        "message": "Promo created successfully",
        "promo_id": promo_data["id"],
        "promo": {
            "id": promo_data["id"],
            "title": promo_data["title"],
            "description": promo_data["description"],
            "discount_type": promo_data["discount_type"],
            "discount_value": promo_data["discount_value"],
            "is_active": promo_data["is_active"]
        }
    }


@router.get("/restaurant/promos")
async def get_restaurant_promos(
    active_only: bool = False,
    current_user: dict = Depends(get_current_restaurant)
):
    """Get all promos for the restaurant"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Get promos array from restaurant document
    promos = restaurant.get("promos", [])
    
    # Filter by active status if requested
    if active_only:
        promos = [p for p in promos if p.get("is_active", True)]
    
    return {
        "total": len(promos),
        "promos": promos
    }


@router.get("/restaurant/promos/{promo_id}")
async def get_promo_details(
    promo_id: str,
    current_user: dict = Depends(get_current_restaurant)
):
    """Get details of a specific promo"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Find promo in array
    promos = restaurant.get("promos", [])
    promo = next((p for p in promos if p["id"] == promo_id), None)
    
    if not promo:
        raise HTTPException(status_code=404, detail="Promo not found")
    
    return promo


@router.put("/restaurant/promos/{promo_id}")
async def update_promo(
    promo_id: str,
    payload: PromoUpdate,
    current_user: dict = Depends(get_current_restaurant)
):
    """Update an existing promo"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Find promo in array
    promos = restaurant.get("promos", [])
    promo_index = next((i for i, p in enumerate(promos) if p["id"] == promo_id), None)
    
    if promo_index is None:
        raise HTTPException(status_code=404, detail="Promo not found")
    
    # Build update data (only include fields that were provided)
    promo = promos[promo_index]
    
    if payload.title is not None:
        promo["title"] = payload.title
    if payload.description is not None:
        promo["description"] = payload.description
    if payload.discount_type is not None:
        promo["discount_type"] = payload.discount_type
    if payload.discount_value is not None:
        promo["discount_value"] = payload.discount_value
    if payload.valid_days is not None:
        promo["valid_days"] = payload.valid_days
    if payload.time_start is not None:
        promo["time_start"] = payload.time_start
    if payload.time_end is not None:
        promo["time_end"] = payload.time_end
    if payload.start_date is not None:
        promo["start_date"] = payload.start_date
    if payload.end_date is not None:
        promo["end_date"] = payload.end_date
    if payload.is_active is not None:
        promo["is_active"] = payload.is_active
    
    promo["updated_at"] = datetime.utcnow()
    
    # Update the entire promos array
    promos[promo_index] = promo
    
    await db.restaurants.update_one(
        {"_id": restaurant["_id"]},
        {
            "$set": {
                "promos": promos,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "message": "Promo updated successfully",
        "promo_id": promo_id
    }


@router.delete("/restaurant/promos/{promo_id}")
async def delete_promo(
    promo_id: str,
    current_user: dict = Depends(get_current_restaurant)
):
    """Delete a promo"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Remove promo from array using $pull
    result = await db.restaurants.update_one(
        {"_id": restaurant["_id"]},
        {
            "$pull": {"promos": {"id": promo_id}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Promo not found")
    
    return {
        "message": "Promo deleted successfully",
        "promo_id": promo_id
    }


@router.patch("/restaurant/promos/{promo_id}/toggle")
async def toggle_promo_status(
    promo_id: str,
    current_user: dict = Depends(get_current_restaurant)
):
    """Toggle promo active/inactive status"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Find promo in array
    promos = restaurant.get("promos", [])
    promo_index = next((i for i, p in enumerate(promos) if p["id"] == promo_id), None)
    
    if promo_index is None:
        raise HTTPException(status_code=404, detail="Promo not found")
    
    # Toggle status
    promos[promo_index]["is_active"] = not promos[promo_index]["is_active"]
    promos[promo_index]["updated_at"] = datetime.utcnow()
    new_status = promos[promo_index]["is_active"]
    
    # Update the entire promos array
    await db.restaurants.update_one(
        {"_id": restaurant["_id"]},
        {
            "$set": {
                "promos": promos,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "message": f"Promo {'activated' if new_status else 'deactivated'} successfully",
        "promo_id": promo_id,
        "is_active": new_status
    }

@router.get("/restaurant/stats/total-guests")
async def get_total_guests_count(
    current_user: dict = Depends(get_current_restaurant)
):
    """Get total number of guests that have visited the restaurant since inception"""
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    
    # Get ALL checked-in reservations (all time)
    reservations = await db.reservations.find({
        "restaurant_id": restaurant_id,
        "checked_in": True
    }).to_list(length=None)
    
    # Sum all guests from all reservations
    total_guests = sum(res.get("number_of_guests", 0) for res in reservations)
    
    return {
        "total_guests": total_guests
    }


# ==================== PUBLIC ENDPOINT FOR CUSTOMERS ====================

@router.get("/restaurants/{restaurant_id}/promos")
async def get_public_restaurant_promos(restaurant_id: str):
    """Get active promos for a restaurant (public endpoint for customers)"""
    try:
        restaurant = await db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid restaurant ID")
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Get only active promos from the promos array
    all_promos = restaurant.get("promos", [])
    active_promos = [p for p in all_promos if p.get("is_active", True)]
    
    return {
        "restaurant_name": restaurant.get("restaurant_name"),
        "total": len(active_promos),
        "promos": active_promos
    }
