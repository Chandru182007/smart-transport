from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    reg_number = Column(String, unique=True, index=True)
    name = Column(String)
    type = Column(String)
    max_load = Column(Float)
    odometer = Column(Float)
    acquisition_cost = Column(Float)
    status = Column(String, default="Available")  # Available, On Trip, In Shop, Retired

class Driver(Base):
    __tablename__ = "drivers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    license_number = Column(String, unique=True)
    license_expiry = Column(Date)
    status = Column(String, default="Available")  # Available, On Trip, Off Duty, Suspended

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String)
    destination = Column(String)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    cargo_weight = Column(Float)
    status = Column(String, default="Draft")  # Draft, Dispatched, Completed, Cancelled