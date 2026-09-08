"""
AgriQuantum Pydantic Schemas & Validation Models
================================================
Validates all agricultural, authentication, and prediction payloads.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, validator


# ==============================================================================
# AUTHENTICATION SCHEMAS
# ==============================================================================
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(default="Farmer", description="Farmer, Agronomist, Researcher, or Administrator")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    expires_in_seconds: int = 86400


class UserProfile(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==============================================================================
# FARM & FIELD SCHEMAS
# ==============================================================================
class FieldCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    area_hectares: float = Field(..., gt=0.1, le=10000.0)
    soil_type: str = Field(default="Alluvial Loam")
    boundary_geojson: Optional[str] = None


class FieldResponse(BaseModel):
    id: int
    farm_id: int
    name: str
    area_hectares: float
    soil_type: str
    boundary_geojson: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FarmCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    location: str = Field(..., min_length=2, max_length=200)
    state: Optional[str] = "Andhra Pradesh"
    country: str = "India"
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    total_area_hectares: float = Field(..., gt=0.5, le=50000.0)


class FarmResponse(BaseModel):
    id: int
    name: str
    location: str
    state: Optional[str]
    country: str
    latitude: float
    longitude: float
    total_area_hectares: float
    created_at: datetime
    fields: List[FieldResponse] = []

    class Config:
        from_attributes = True


# ==============================================================================
# PREDICTION & AGRICULTURAL INPUT SCHEMAS
# ==============================================================================
class YieldPredictionInput(BaseModel):
    field_id: Optional[int] = None
    soil_nitrogen: float = Field(
        ...,
        ge=15.0,
        le=160.0,
        description="Available elemental nitrogen in kg/ha. Normal range: 40-120.",
    )
    soil_phosphorus: float = Field(
        default=45.0,
        ge=10.0,
        le=100.0,
        description="Available phosphorus in kg/ha. Normal range: 20-80.",
    )
    soil_potassium: float = Field(
        default=50.0,
        ge=15.0,
        le=120.0,
        description="Available potassium in kg/ha. Normal range: 20-80.",
    )
    soil_moisture: float = Field(
        ...,
        ge=10.0,
        le=55.0,
        description="Volumetric soil moisture percentage. Normal range: 15-40%.",
    )
    soil_ph: float = Field(
        default=6.8,
        ge=5.0,
        le=8.5,
        description="Soil pH value. Optimal agronomic range: 6.0-7.5.",
    )
    rainfall: float = Field(
        ...,
        ge=50.0,
        le=1500.0,
        description="Cumulative seasonal rainfall in mm. Normal range: 400-1200 mm.",
    )
    temperature: float = Field(
        default=24.5,
        ge=10.0,
        le=45.0,
        description="Mean ambient growing temperature in °C. Optimal: 18-32 °C.",
    )
    ndvi: float = Field(
        ...,
        ge=0.10,
        le=0.95,
        description="Normalized Difference Vegetation Index. Healthy canopy: > 0.65.",
    )
    crop_type: str = Field(default="Winter Wheat")
    cultivated_area_hectares: float = Field(default=120.0, gt=0.1)


class YieldPredictionOutput(BaseModel):
    prediction_id: Optional[int] = None
    predicted_yield_quintals_acre: float
    predicted_yield_tonnes_hectare: float
    model_version: str
    quantum_backend: str
    circuit_qubits: int
    confidence_score: float
    status: str
    prediction_timestamp: datetime
    input_summary: Dict[str, float]
    historical_comparison: str


# ==============================================================================
# RECOMMENDATION SCHEMAS
# ==============================================================================
class RecommendationInput(BaseModel):
    prediction_id: Optional[int] = None
    field_id: Optional[int] = None
    soil_nitrogen: float = Field(..., ge=15.0, le=160.0)
    soil_moisture: float = Field(..., ge=10.0, le=55.0)
    rainfall: float = Field(..., ge=50.0, le=1500.0)
    ndvi: float = Field(..., ge=0.10, le=0.95)
    crop_type: str = "Winter Wheat"


class RecommendationOutput(BaseModel):
    recommendation_id: Optional[int] = None
    baseline_yield_q_acre: float
    optimized_yield_q_acre: float
    yield_improvement_pct: float
    current_nitrogen_kg_ha: float
    recommended_nitrogen_kg_ha: float
    delta_nitrogen_kg_ha: float
    current_moisture_pct: float
    recommended_moisture_pct: float
    supplemental_irrigation_mm: float
    cost_savings_inr_acre: float
    net_economic_benefit_inr_acre: float
    nitrogen_advisory: str
    irrigation_advisory: str
    advisory_summary: str
    disclaimer: str = "Recommendations are model-generated suggestions based on current soil and weather conditions. Always validate with local agronomic expertise before field application."


# ==============================================================================
# WEATHER & SATELLITE SCHEMAS
# ==============================================================================
class WeatherResponse(BaseModel):
    farm_id: int
    location: str
    latitude: float
    longitude: float
    current_temperature_c: float
    current_rainfall_mm: float
    relative_humidity_pct: float
    forecast_days: List[Dict[str, Any]]
    source: str = "Open-Meteo"
    retrieved_at: datetime


class SatelliteCropHealthResponse(BaseModel):
    field_id: int
    observed_at: datetime
    ndvi: float
    health_status: str
    cloud_coverage_pct: float
    spatial_grid: List[List[float]]
    satellite_mission: str = "Sentinel-2 Multispectral"
    credentials_configured: bool


# ==============================================================================
# REPORT SCHEMAS
# ==============================================================================
class ReportGenerateRequest(BaseModel):
    farm_id: int
    crop: str = "Winter Wheat"
    include_quantum_analysis: bool = True
    report_type: str = "Certified Agronomic Audit"


class ReportResponse(BaseModel):
    report_id: int
    title: str
    format: str
    file_url: str
    summary: str
    generated_at: datetime
