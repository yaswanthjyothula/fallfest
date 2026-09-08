"""
AgriQuantum Relational Database Models
======================================
15 Core entities with foreign key constraints, timestamps, and indexes.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Index,
)
from sqlalchemy.orm import relationship
from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="Farmer", nullable=False)  # Farmer, Agronomist, Researcher, Administrator
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India", nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    total_area_hectares = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    owner = relationship("User", back_populates="farms")
    fields = relationship("Field", back_populates="farm", cascade="all, delete-orphan")
    weather_records = relationship("WeatherObservation", back_populates="farm", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="farm")


class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    area_hectares = Column(Float, nullable=False)
    soil_type = Column(String(100), default="Alluvial Loam", nullable=False)
    boundary_geojson = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    farm = relationship("Farm", back_populates="fields")
    crops = relationship("Crop", back_populates="field", cascade="all, delete-orphan")
    soil_measurements = relationship("SoilMeasurement", back_populates="field", cascade="all, delete-orphan")
    satellite_observations = relationship("SatelliteObservation", back_populates="field", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="field")


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)  # e.g., Winter Wheat
    variety = Column(String(100), nullable=True)  # e.g., Triticum aestivum PBW-343
    season = Column(String(50), default="Rabi", nullable=False)
    growth_stage = Column(String(100), default="Stem Elongation (Feekes 6)", nullable=False)
    planting_date = Column(DateTime, nullable=True)
    expected_harvest_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    field = relationship("Field", back_populates="crops")


class Season(Base):
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # e.g., Kharif 2026, Rabi 2025-26
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)


class SoilMeasurement(Base):
    __tablename__ = "soil_measurements"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id", ondelete="CASCADE"), nullable=False, index=True)
    measured_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    nitrogen = Column(Float, nullable=False)  # kg/ha
    phosphorus = Column(Float, nullable=False)  # kg/ha
    potassium = Column(Float, nullable=False)  # kg/ha
    moisture = Column(Float, nullable=False)  # % volumetric
    ph = Column(Float, nullable=False)  # pH units
    ec = Column(Float, default=0.45, nullable=False)  # Electrical conductivity dS/m
    organic_carbon = Column(Float, default=0.72, nullable=False)  # %
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    field = relationship("Field", back_populates="soil_measurements")


class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    temperature = Column(Float, nullable=False)  # °C
    rainfall = Column(Float, nullable=False)  # mm cumulative
    humidity = Column(Float, nullable=True)  # %
    solar_radiation = Column(Float, nullable=True)  # MJ/m2
    wind_speed = Column(Float, nullable=True)  # km/h
    source = Column(String(50), default="Open-Meteo", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    farm = relationship("Farm", back_populates="weather_records")


class SatelliteObservation(Base):
    __tablename__ = "satellite_observations"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id", ondelete="CASCADE"), nullable=False, index=True)
    observed_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    ndvi = Column(Float, nullable=False)  # Normalized Difference Vegetation Index
    evi = Column(Float, nullable=True)  # Enhanced Vegetation Index
    ndre = Column(Float, nullable=True)  # Normalized Difference Red Edge
    cloud_coverage = Column(Float, default=0.0, nullable=False)  # %
    satellite_source = Column(String(100), default="Sentinel-2 Multispectral", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    field = relationship("Field", back_populates="satellite_observations")


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    version_tag = Column(String(50), unique=True, nullable=False, index=True)  # e.g., v2.5.0
    model_name = Column(String(100), nullable=False)  # AgriQuantum QSVR
    framework = Column(String(100), nullable=False)  # Qiskit Aer
    parameters_json = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    predictions = relationship("Prediction", back_populates="model_version")
    evaluations = relationship("ModelEvaluation", back_populates="model_version")


class ModelEvaluation(Base):
    __tablename__ = "model_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False, index=True)
    evaluated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    dataset_name = Column(String(100), nullable=False)
    r2_score = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    mae = Column(Float, nullable=False)
    train_time_sec = Column(Float, nullable=False)
    inference_time_ms = Column(Float, nullable=False)

    model_version = relationship("ModelVersion", back_populates="evaluations")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=True)
    predicted_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Input values for full auditability
    input_nitrogen = Column(Float, nullable=False)
    input_phosphorus = Column(Float, default=45.0, nullable=False)
    input_potassium = Column(Float, default=50.0, nullable=False)
    input_moisture = Column(Float, nullable=False)
    input_rainfall = Column(Float, nullable=False)
    input_temperature = Column(Float, default=24.5, nullable=False)
    input_ndvi = Column(Float, nullable=False)
    crop_type = Column(String(100), default="Winter Wheat", nullable=False)

    # Output prediction
    predicted_yield = Column(Float, nullable=False)
    unit = Column(String(50), default="Quintals per Acre", nullable=False)
    confidence_score = Column(Float, default=98.2, nullable=False)
    status = Column(String(50), default="Complete", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    field = relationship("Field", back_populates="predictions")
    user = relationship("User", back_populates="predictions")
    model_version = relationship("ModelVersion", back_populates="predictions")
    recommendation = relationship("Recommendation", back_populates="prediction", uselist=False)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id", ondelete="CASCADE"), nullable=False, unique=True)
    recommended_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    current_nitrogen = Column(Float, nullable=False)
    recommended_nitrogen = Column(Float, nullable=False)
    delta_nitrogen = Column(Float, nullable=False)

    current_moisture = Column(Float, nullable=False)
    recommended_moisture = Column(Float, nullable=False)
    delta_moisture = Column(Float, nullable=False)
    supplemental_irrigation_mm = Column(Float, nullable=False)

    baseline_yield = Column(Float, nullable=False)
    optimized_yield = Column(Float, nullable=False)
    yield_increase_pct = Column(Float, nullable=False)

    cost_savings_inr_acre = Column(Float, nullable=False)
    net_economic_benefit_inr_acre = Column(Float, nullable=False)

    nitrogen_advisory = Column(Text, nullable=False)
    irrigation_advisory = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    prediction = relationship("Prediction", back_populates="recommendation")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    record_count = Column(Integer, nullable=False)
    feature_count = Column(Integer, nullable=False)
    quality_score = Column(Float, default=100.0, nullable=False)
    file_path = Column(String(500), nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    generated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    report_type = Column(String(50), default="Certified Agronomic Audit", nullable=False)
    format = Column(String(20), default="PDF", nullable=False)  # PDF, TXT
    file_path = Column(String(500), nullable=True)
    summary_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    farm = relationship("Farm", back_populates="reports")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., PREDICTION_EXECUTED, REPORT_GENERATED
    resource = Column(String(100), nullable=False)
    ip_address = Column(String(50), nullable=True)
    details_json = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="audit_logs")
