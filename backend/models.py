from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from backend.database import Base


def _utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    email = Column(String, nullable=True, default=None)
    created_at = Column(DateTime, default=_utc_now)

    predictions = relationship("PredictionHistory", back_populates="user")


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Input parameters
    tanggal = Column(String)
    jam = Column(Integer)
    suhu = Column(Float)
    penghuni = Column(Integer)
    perangkat_aktif = Column(Integer)
    jam_pemakaian = Column(Float)
    is_holiday = Column(Boolean)
    is_weekend = Column(Boolean)

    # Results
    pred_kwh = Column(Float)
    est_biaya = Column(Float)
    kategori = Column(String)
    
    created_at = Column(DateTime, default=_utc_now)

    user = relationship("User", back_populates="predictions")
