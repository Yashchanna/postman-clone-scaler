from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/api/environments",
    tags=["environments"]
)

@router.get("", response_model=List[schemas.EnvironmentResponse])
def get_environments(db: Session = Depends(database.get_db)):
    return db.query(models.Environment).all()

@router.post("", response_model=schemas.EnvironmentResponse)
def create_environment(env: schemas.EnvironmentCreate, db: Session = Depends(database.get_db)):
    db_env = models.Environment(name=env.name, is_active=env.is_active)
    db.add(db_env)
    db.commit()
    db.refresh(db_env)
    
    for var in env.variables:
        db_var = models.EnvironmentVariable(**var.model_dump(), environment_id=db_env.id)
        db.add(db_var)
    db.commit()
    db.refresh(db_env)
    return db_env

@router.put("/{env_id}", response_model=schemas.EnvironmentResponse)
def update_environment(env_id: int, env: schemas.EnvironmentUpdate, db: Session = Depends(database.get_db)):
    db_env = db.query(models.Environment).filter(models.Environment.id == env_id).first()
    if not db_env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    db_env.name = env.name
    db_env.is_active = env.is_active
    
    # Delete old variables and add new ones
    db.query(models.EnvironmentVariable).filter(models.EnvironmentVariable.environment_id == env_id).delete()
    
    for var in env.variables:
        db_var = models.EnvironmentVariable(**var.model_dump(), environment_id=env_id)
        db.add(db_var)
        
    db.commit()
    db.refresh(db_env)
    return db_env

@router.delete("/{env_id}")
def delete_environment(env_id: int, db: Session = Depends(database.get_db)):
    db_env = db.query(models.Environment).filter(models.Environment.id == env_id).first()
    if not db_env:
        raise HTTPException(status_code=404, detail="Environment not found")
        
    db.delete(db_env)
    db.commit()
    return {"message": "Environment deleted successfully"}

@router.put("/{env_id}/activate")
def activate_environment(env_id: int, db: Session = Depends(database.get_db)):
    # Deactivate all
    db.query(models.Environment).update({models.Environment.is_active: False})
    
    if env_id != 0: # 0 might mean no environment
        db_env = db.query(models.Environment).filter(models.Environment.id == env_id).first()
        if not db_env:
            raise HTTPException(status_code=404, detail="Environment not found")
        db_env.is_active = True
        
    db.commit()
    return {"message": "Environment activated successfully"}
