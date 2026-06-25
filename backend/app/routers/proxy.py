from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, database
from ..services import proxy_service

router = APIRouter(
    prefix="/api/proxy",
    tags=["proxy"]
)

@router.post("/send", response_model=schemas.ProxyResponse)
async def send_request(request: schemas.ProxyRequest, db: Session = Depends(database.get_db)):
    return await proxy_service.execute_request(request, db)
