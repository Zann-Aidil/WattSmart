from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.deps import get_current_user, get_db
from backend.models import User, PredictionHistory

router = APIRouter(tags=["history"])


class HistoryItem(BaseModel):
    id: int
    tanggal: str | None
    jam: int | None
    suhu: float | None
    penghuni: int | None
    perangkat_aktif: int | None
    jam_pemakaian: float | None
    is_holiday: bool | None
    is_weekend: bool | None
    pred_kwh: float | None
    est_biaya: float | None
    kategori: str | None
    created_at: str


class HistoryResponse(BaseModel):
    data: list[HistoryItem]
    total: int
    limit: int
    offset: int


@router.get("/history", response_model=HistoryResponse, summary="Riwayat prediksi user")
def get_user_history(
    limit: int = Query(default=50, ge=1, le=200, description="Jumlah item per halaman"),
    offset: int = Query(default=0, ge=0, description="Offset untuk pagination"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HistoryResponse:
    query = db.query(PredictionHistory).filter(
        PredictionHistory.user_id == current_user.id
    )
    total = query.count()

    histories = (
        query.order_by(PredictionHistory.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    items = [
        HistoryItem(
            id=h.id,
            tanggal=h.tanggal,
            jam=h.jam,
            suhu=h.suhu,
            penghuni=h.penghuni,
            perangkat_aktif=h.perangkat_aktif,
            jam_pemakaian=h.jam_pemakaian,
            is_holiday=h.is_holiday,
            is_weekend=h.is_weekend,
            pred_kwh=h.pred_kwh,
            est_biaya=h.est_biaya,
            kategori=h.kategori,
            created_at=h.created_at.isoformat(),
        )
        for h in histories
    ]

    return HistoryResponse(data=items, total=total, limit=limit, offset=offset)


class DeleteHistoryResponse(BaseModel):
    message: str
    deleted_count: int


@router.delete("/history", response_model=DeleteHistoryResponse, summary="Hapus semua riwayat prediksi")
def delete_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DeleteHistoryResponse:
    deleted_count = db.query(PredictionHistory).filter(
        PredictionHistory.user_id == current_user.id
    ).delete(synchronize_session=False)
    db.commit()
    return DeleteHistoryResponse(message="Riwayat berhasil dihapus", deleted_count=deleted_count)
