from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/api/collections",
    tags=["collections"]
)

@router.get("", response_model=List[schemas.CollectionTreeResponse])
def get_collections(db: Session = Depends(database.get_db)):
    collections = db.query(models.Collection).filter(models.Collection.parent_id == None).all()
    return collections

@router.post("", response_model=schemas.CollectionResponse)
def create_collection(collection: schemas.CollectionCreate, db: Session = Depends(database.get_db)):
    db_collection = models.Collection(**collection.model_dump())
    db.add(db_collection)
    db.commit()
    db.refresh(db_collection)
    return db_collection

@router.put("/{collection_id}", response_model=schemas.CollectionResponse)
def update_collection(collection_id: int, collection: schemas.CollectionUpdate, db: Session = Depends(database.get_db)):
    db_collection = db.query(models.Collection).filter(models.Collection.id == collection_id).first()
    if not db_collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    for key, value in collection.model_dump(exclude_unset=True).items():
        setattr(db_collection, key, value)
        
    db.commit()
    db.refresh(db_collection)
    return db_collection

@router.delete("/{collection_id}")
def delete_collection(collection_id: int, db: Session = Depends(database.get_db)):
    db_collection = db.query(models.Collection).filter(models.Collection.id == collection_id).first()
    if not db_collection:
        raise HTTPException(status_code=404, detail="Collection not found")
        
    db.delete(db_collection)
    db.commit()
    return {"message": "Collection deleted successfully"}

@router.get("/{collection_id}/requests", response_model=List[schemas.SavedRequestResponse])
def get_collection_requests(collection_id: int, db: Session = Depends(database.get_db)):
    requests = db.query(models.SavedRequest).filter(models.SavedRequest.collection_id == collection_id).all()
    return requests
