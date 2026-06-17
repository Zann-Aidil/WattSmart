from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.deps import get_current_user, get_db
from backend.models import User, PredictionHistory

router = APIRouter(tags=["history"])

@router.get("/history")
def get_user_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get all prediction history for the user, newest first
    histories = db.query(PredictionHistory).filter(PredictionHistory.user_id == current_user.id).order_by(PredictionHistory.created_at.desc()).all()
    
    # We will return the history as a list of dicts
    result = []
    for h in histories:
        result.append({
            "id": h.id,
            "tanggal": h.tanggal,
            "jam": h.jam,
            "suhu": h.suhu,
            "penghuni": h.penghuni,
            "perangkat_aktif": h.perangkat_aktif,
            "jam_pemakaian": h.jam_pemakaian,
            "is_holiday": h.is_holiday,
            "is_weekend": h.is_weekend,
            "pred_kwh": h.pred_kwh,
            "est_biaya": h.est_biaya,
            "kategori": h.kategori,
            "created_at": h.created_at.isoformat()
        })
    return result
