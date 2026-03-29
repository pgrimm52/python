from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    category = Column(
        String,
        nullable=False,
        default="other"
    )
    notes = Column(String, nullable=True)
    rating = Column(Integer, nullable=True)  # 1-5 stars
    visited = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
