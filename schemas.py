from pydantic import BaseModel, ConfigDict
from datetime import date

class TripCreate(BaseModel):
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float

class TripResponse(BaseModel):
    id: int
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    status: str

    # Updated for Pydantic V2 compatibility
    model_config = ConfigDict(from_attributes=True)