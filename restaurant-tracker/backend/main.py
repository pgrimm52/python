from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import math

from database import engine, get_db, Base
import models

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Restaurant Tracker API")

# CORS middleware - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_CATEGORIES = [
    "breakfast", "brunch", "lunch", "dinner",
    "fine_dining", "casual", "coffee", "bar", "other"
]


# Pydantic schemas
class RestaurantBase(BaseModel):
    name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: str = "other"
    notes: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    visited: bool = False


class RestaurantCreate(RestaurantBase):
    pass


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    visited: Optional[bool] = None


class RestaurantResponse(RestaurantBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in kilometers."""
    R = 6371  # Earth's radius in kilometers
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


@app.get("/restaurants", response_model=List[RestaurantResponse])
def list_restaurants(
    category: Optional[str] = Query(None),
    visited: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Restaurant)
    if category:
        query = query.filter(models.Restaurant.category == category)
    if visited is not None:
        query = query.filter(models.Restaurant.visited == visited)
    return query.order_by(models.Restaurant.created_at.desc()).all()


@app.get("/restaurants/nearby", response_model=List[RestaurantResponse])
def get_nearby_restaurants(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_km: float = Query(default=5.0),
    db: Session = Depends(get_db)
):
    restaurants = db.query(models.Restaurant).filter(
        models.Restaurant.latitude.isnot(None),
        models.Restaurant.longitude.isnot(None)
    ).all()

    nearby = []
    for restaurant in restaurants:
        distance = haversine_distance(lat, lng, restaurant.latitude, restaurant.longitude)
        if distance <= radius_km:
            nearby.append(restaurant)

    return nearby


@app.get("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(models.Restaurant).filter(
        models.Restaurant.id == restaurant_id
    ).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


@app.post("/restaurants", response_model=RestaurantResponse, status_code=201)
def create_restaurant(restaurant: RestaurantCreate, db: Session = Depends(get_db)):
    if restaurant.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {', '.join(VALID_CATEGORIES)}")

    db_restaurant = models.Restaurant(**restaurant.model_dump())
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant


@app.put("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
def update_restaurant(
    restaurant_id: int,
    restaurant: RestaurantUpdate,
    db: Session = Depends(get_db)
):
    db_restaurant = db.query(models.Restaurant).filter(
        models.Restaurant.id == restaurant_id
    ).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    update_data = restaurant.model_dump(exclude_unset=True)
    if "category" in update_data and update_data["category"] not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {', '.join(VALID_CATEGORIES)}")

    for field, value in update_data.items():
        setattr(db_restaurant, field, value)

    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant


@app.delete("/restaurants/{restaurant_id}", status_code=204)
def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    db_restaurant = db.query(models.Restaurant).filter(
        models.Restaurant.id == restaurant_id
    ).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    db.delete(db_restaurant)
    db.commit()
    return None
