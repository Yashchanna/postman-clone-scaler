from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict, Union
from datetime import datetime

class EnvironmentVariableBase(BaseModel):
    key: str
    value: str
    enabled: bool = True

class EnvironmentVariableCreate(EnvironmentVariableBase):
    pass

class EnvironmentVariableResponse(EnvironmentVariableBase):
    id: int
    environment_id: int

    class Config:
        from_attributes = True

class EnvironmentBase(BaseModel):
    name: str
    is_active: bool = False

class EnvironmentCreate(EnvironmentBase):
    variables: List[EnvironmentVariableCreate] = []

class EnvironmentUpdate(EnvironmentBase):
    variables: List[EnvironmentVariableCreate] = []

class EnvironmentResponse(EnvironmentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    variables: List[EnvironmentVariableResponse] = []

    class Config:
        from_attributes = True

class KeyValue(BaseModel):
    key: str
    value: str
    enabled: bool = True

class SavedRequestBase(BaseModel):
    name: str
    method: str
    url: str
    headers: str = "[]" # JSON string of List[KeyValue]
    params: str = "[]" # JSON string of List[KeyValue]
    body: str = "{}" # JSON string
    body_type: str = "none"
    auth: str = "{}" # JSON string
    auth_type: str = "none"
    sort_order: int = 0

class SavedRequestCreate(SavedRequestBase):
    collection_id: int

class SavedRequestUpdate(SavedRequestBase):
    pass

class SavedRequestResponse(SavedRequestBase):
    id: int
    collection_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CollectionBase(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

class CollectionCreate(CollectionBase):
    pass

class CollectionUpdate(CollectionBase):
    pass

class CollectionResponse(CollectionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    requests: List[SavedRequestResponse] = []

    class Config:
        from_attributes = True

class CollectionTreeResponse(CollectionResponse):
    children: Optional[List['CollectionTreeResponse']] = None

class HistoryBase(BaseModel):
    method: str
    url: str
    request_headers: str = "[]"
    request_body: str = "{}"
    body_type: str = "none"
    status_code: Optional[int] = None
    response_headers: str = "[]"
    response_body: str = ""
    response_time_ms: Optional[int] = None
    response_size_bytes: Optional[int] = None

class HistoryCreate(HistoryBase):
    pass

class HistoryResponse(HistoryBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class ProxyRequest(BaseModel):
    method: str
    url: str
    headers: List[KeyValue] = []
    params: List[KeyValue] = []
    body_type: str = "none"
    body: Any = None
    auth_type: str = "none"
    auth: Dict[str, Any] = {}
    environment_id: Optional[int] = None

class ProxyResponse(BaseModel):
    status_code: int
    headers: List[KeyValue] = []
    body: Any = None
    time_ms: int
    size_bytes: int
    is_error: bool = False
    error_message: Optional[str] = None
