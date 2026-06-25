from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    parent_id = Column(Integer, ForeignKey("collections.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    children = relationship("Collection", backref="parent", remote_side=[id])
    requests = relationship("SavedRequest", back_populates="collection", cascade="all, delete-orphan")


class SavedRequest(Base):
    __tablename__ = "saved_requests"

    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(Integer, ForeignKey("collections.id"))
    name = Column(String, index=True)
    method = Column(String)
    url = Column(String)
    headers = Column(Text, nullable=True) # Stored as JSON string
    params = Column(Text, nullable=True) # Stored as JSON string
    body = Column(Text, nullable=True) # Stored as JSON string
    body_type = Column(String) # none/raw/form-data/x-www-form-urlencoded
    auth = Column(Text, nullable=True) # Stored as JSON string
    auth_type = Column(String) # none/bearer/basic
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    collection = relationship("Collection", back_populates="requests")


class Environment(Base):
    __tablename__ = "environments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    variables = relationship("EnvironmentVariable", back_populates="environment", cascade="all, delete-orphan")


class EnvironmentVariable(Base):
    __tablename__ = "environment_variables"

    id = Column(Integer, primary_key=True, index=True)
    environment_id = Column(Integer, ForeignKey("environments.id"))
    key = Column(String, index=True)
    value = Column(String)
    enabled = Column(Boolean, default=True)

    environment = relationship("Environment", back_populates="variables")


class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    method = Column(String)
    url = Column(String)
    request_headers = Column(Text, nullable=True) # JSON string
    request_body = Column(Text, nullable=True) # JSON string
    body_type = Column(String, nullable=True)
    status_code = Column(Integer, nullable=True)
    response_headers = Column(Text, nullable=True) # JSON string
    response_body = Column(Text, nullable=True) # Text
    response_time_ms = Column(Integer, nullable=True)
    response_size_bytes = Column(Integer, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
