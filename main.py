from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
import models
import schemas
from database import engine, SessionLocal

app = FastAPI(title="TransitOps API")

# This creates the database tables based on your models
models.Base.metadata.create_all(bind=engine)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return {"message": "TransitOps API is running"}