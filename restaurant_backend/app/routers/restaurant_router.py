# app/routers/restaurant_router.py
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse
from typing import List, Optional
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
    cuisines: str = Form(...),
    features: str = Form(...),
    hours: str = Form(...),
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
    
    # Get restaurant from database
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_id = str(restaurant["_id"])
    
    # Parse JSON fields
    try:
        cuisines_list = json.loads(cuisines)
        features_list = json.loads(features)
        hours_dict = json.loads(hours)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format in cuisines, features, or hours")
    
    # Upload thumbnail to GridFS
    thumbnail_id = None
    if thumbnail:
        thumbnail_id = await upload_image_to_gridfs(
            thumbnail, 
            metadata={"restaurant_id": restaurant_id, "type": "thumbnail"}
        )
    
    # Upload ambiance photos to GridFS
    ambiance_photo_ids = []
    for i in range(6):
        photo = locals().get(f'ambiance_photo_{i}')
        if photo:
            photo_id = await upload_image_to_gridfs(
                photo,
                metadata={"restaurant_id": restaurant_id, "type": "ambiance"}
            )
            ambiance_photo_ids.append(photo_id)
    
    # Upload menu photos to GridFS
    menu_photo_ids = []
    for i in range(4):
        photo = locals().get(f'menu_photo_{i}')
        if photo:
            photo_id = await upload_image_to_gridfs(
                photo,
                metadata={"restaurant_id": restaurant_id, "type": "menu"}
            )
            menu_photo_ids.append(photo_id)
    
    # Update restaurant in database with GridFS file IDs
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
        "is_onboarded": True,
        "updated_at": datetime.utcnow()
    }
    
    # Add photo IDs if uploaded
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
        "restaurant_id": restaurant_id
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
        thumbnail_url = f"/api/restaurant/image/{restaurant['thumbnail_id']}"
    
    ambiance_urls = []
    for photo_id in restaurant.get("ambiance_photo_ids", []):
        ambiance_urls.append(f"/api/restaurant/image/{photo_id}")
    
    menu_urls = []
    for photo_id in restaurant.get("menu_photo_ids", []):
        menu_urls.append(f"/api/restaurant/image/{photo_id}")
    
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
        "totalReviews": 324  # Mock data - replace with actual reviews count later
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
    cuisines: Optional[str] = Form(None),
    features: Optional[str] = Form(None),
    hours: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_restaurant)
):
    """Update restaurant profile (Protected route)"""
    
    restaurant = await db.restaurants.find_one({"email": current_user["email"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
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
    if description:
        update_data["description"] = description
    if cuisines:
        update_data["cuisines"] = json.loads(cuisines)
    if features:
        update_data["features"] = json.loads(features)
    if hours:
        update_data["hours"] = json.loads(hours)
    
    # Update restaurant
    await db.restaurants.update_one(
        {"_id": restaurant["_id"]},
        {"$set": update_data}
    )
    
    return {"message": "Profile updated successfully"}