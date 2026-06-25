from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import collections, requests, environments, history, proxy

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Postman Clone API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development. In production, restrict this.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(proxy.router)
app.include_router(collections.router)
app.include_router(requests.router)
app.include_router(environments.router)
app.include_router(history.router)

@app.get("/")
def root():
    return {"message": "API Client Platform Backend is running"}
