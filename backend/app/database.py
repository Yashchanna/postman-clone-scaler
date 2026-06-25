from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Vercel's serverless environment requires SQLite to be in /tmp
if os.environ.get("VERCEL"):
    DATABASE_URL = "sqlite:////tmp/api_client.db"
else:
    DATABASE_URL = "sqlite:///./api_client.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
