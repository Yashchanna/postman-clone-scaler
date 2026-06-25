from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter(
    prefix="/api/requests",
    tags=["requests"]
)

@router.post("", response_model=schemas.SavedRequestResponse)
def create_request(request: schemas.SavedRequestCreate, db: Session = Depends(database.get_db)):
    db_request = models.SavedRequest(**request.model_dump())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.put("/{request_id}", response_model=schemas.SavedRequestResponse)
def update_request(request_id: int, request: schemas.SavedRequestUpdate, db: Session = Depends(database.get_db)):
    db_request = db.query(models.SavedRequest).filter(models.SavedRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(db_request, key, value)
        
    db.commit()
    db.refresh(db_request)
    return db_request

@router.delete("/{request_id}")
def delete_request(request_id: int, db: Session = Depends(database.get_db)):
    db_request = db.query(models.SavedRequest).filter(models.SavedRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    db.delete(db_request)
    db.commit()
    return {"message": "Request deleted successfully"}
