from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/api/history",
    tags=["history"]
)

@router.get("", response_model=List[schemas.HistoryResponse])
def get_history(limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.History).order_by(models.History.timestamp.desc()).limit(limit).all()

@router.delete("")
def clear_history(db: Session = Depends(database.get_db)):
    db.query(models.History).delete()
    db.commit()
    return {"message": "History cleared"}

@router.delete("/{history_id}")
def delete_history(history_id: int, db: Session = Depends(database.get_db)):
    db_history = db.query(models.History).filter(models.History.id == history_id).first()
    if not db_history:
        raise HTTPException(status_code=404, detail="History not found")
        
    db.delete(db_history)
    db.commit()
    return {"message": "History entry deleted"}
