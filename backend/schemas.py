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


class FieldUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    area_hectares: Optional[float] = Field(None, gt=0.1, le=10000.0)
    soil_type: Optional[str] = None
    boundary_geojson: Optional[str] = None


class CropCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    variety: Optional[str] = None
    season: str = Field(default="Rabi")
    growth_stage: str = Field(default="Vegetative")
    planting_date: Optional[datetime] = None
    expected_harvest_date: Optional[datetime] = None


class CropResponse(BaseModel):
    id: int
    field_id: int
    name: str
    variety: Optional[str]
    season: str
    growth_stage: str
    planting_date: Optional[datetime]
    expected_harvest_date: Optional[datetime]
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


class FarmUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    location: Optional[str] = Field(None, min_length=2, max_length=200)
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    total_area_hectares: Optional[float] = Field(None, gt=0.5, le=50000.0)


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
    source: str = "Visual Crossing"
    retrieved_at: datetime


class CurrentWeatherResponse(BaseModel):
    latitude: float
    longitude: float
    resolved_address: str
    timezone: str
    observed_at: str
    timestamp: str
    temperature_c: float
    feels_like_c: float
    humidity_pct: float
    dew_point_c: float
    precipitation_mm: float
    precip_prob_pct: float
    wind_speed_kmh: float
    wind_gust_kmh: Optional[float] = None
    wind_direction_deg: float
    pressure_hpa: float
    cloud_coverage_pct: float
    solar_radiation_wm2: float
    uv_index: float
    visibility_km: float
    conditions: str
    weather_provider: str = "Visual Crossing Weather API"
    cached: bool = False


class ForecastDayResponse(BaseModel):
    date: str
    temp_max_c: float
    temp_min_c: float
    temp_mean_c: float
    precipitation_mm: float
    precip_prob_pct: float
    humidity_pct: float
    solar_radiation_wm2: float
    wind_speed_kmh: float
    cloud_cover_pct: float
    conditions: str
    description: str


class ForecastWeatherResponse(BaseModel):
    latitude: float
    longitude: float
    resolved_address: str
    forecast_days_count: int
    forecast: List[ForecastDayResponse]
    weather_provider: str = "Visual Crossing Weather API"
    cached: bool = False


class HistoricalWeatherDayResponse(BaseModel):
    date: str
    temp_max_c: float
    temp_min_c: float
    temp_mean_c: float
    precipitation_mm: float
    humidity_pct: float
    solar_radiation_wm2: float
    wind_speed_kmh: float
    conditions: str


class HistoricalWeatherResponse(BaseModel):
    latitude: float
    longitude: float
    start_date: str
    end_date: str
    records_count: int
    history: List[HistoricalWeatherDayResponse]
    weather_provider: str = "Visual Crossing Weather API"
    cached: bool = False


class FarmConsolidatedWeatherResponse(BaseModel):
    farm_id: int
    farm_name: str
    latitude: float
    longitude: float
    current: CurrentWeatherResponse
    forecast: List[ForecastDayResponse]
    history_7d: List[HistoricalWeatherDayResponse]
    summary: Dict[str, Any]
    weather_provider: str = "Visual Crossing Weather API"


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


# ==============================================================================
# QUANTUM KERNEL & ADVANCED ML SCHEMAS
# ==============================================================================
class QuantumKernelMatrixResponse(BaseModel):
    dimension: int
    sample_ids: List[str]
    matrix: List[List[float]]
    min_kernel_value: float
    max_kernel_value: float
    qubit_count: int = 4
    feature_map: str = "ZZFeatureMap (2 Repetitions, Linear Entanglement)"
    backend: str = "Qiskit Aer Simulator (Fidelity Statevector Kernel)"
    generated_at: datetime


class AgriculturalDataCSVUploadResponse(BaseModel):
    filename: str
    total_rows: int
    valid_rows: int
    invalid_rows: int
    columns_detected: List[str]
    validation_errors: List[str] = []
    preview: List[Dict[str, Any]] = []
    status: str


class CropHealthAnalysisResponse(BaseModel):
    field_id: int
    field_name: str
    mean_ndvi: float
    health_status: str
    growth_stage: str
    ndvi_anomaly: float
    cloud_coverage_pct: float
    satellite_mission: str = "Copernicus Sentinel-2 L2A"
    credentials_configured: bool
    historical_ndvi_trend: List[Dict[str, Any]]
    observed_at: datetime


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    token: str
    new_password: str = Field(..., min_length=8)


# ==============================================================================
# DECISION INTELLIGENCE SCHEMAS
# ==============================================================================

class ScenarioResult(BaseModel):
    scenario_id: str
    scenario_name: str
    description: str
    nitrogen_kg_ha: float
    phosphorus_kg_ha: float
    potassium_kg_ha: float
    moisture_pct: float
    irrigation_mm: float
    predicted_yield_q_acre: float
    predicted_yield_t_ha: float
    input_cost_inr_acre: float
    estimated_revenue_inr_acre: float
    net_profit_inr_acre: float
    savings_vs_baseline_inr_acre: float
    water_stress_index: float  # 0 to 1
    risk_tier: str  # Low, Moderate, High


class WhatIfSimulationRequest(BaseModel):
    crop_type: str = "Winter Wheat"
    cultivated_area_hectares: float = 120.0
    current_nitrogen: float = 85.0
    current_phosphorus: float = 45.0
    current_potassium: float = 55.0
    current_moisture: float = 24.0
    current_rainfall: float = 420.0
    current_ndvi: float = 0.68
    temperature: float = 24.5
    soil_ph: float = 6.8


class WhatIfSimulationResponse(BaseModel):
    crop_type: str
    area_hectares: float
    scenarios: List[ScenarioResult]
    recommended_scenario_id: str
    computed_at: datetime


class FeatureAttribution(BaseModel):
    feature_name: str
    unit: str
    current_value: float
    influence_score: float  # Percentage contribution (0 to 100)
    influence_level: str  # High, Moderate, Low
    effect_direction: str  # Positive, Negative, Neutral
    rationale: str


class SensitivityCurve(BaseModel):
    feature_name: str
    unit: str
    curve_points: List[Dict[str, float]]  # [{"x": value, "predicted_yield": yield}]


class ExplainabilityResponse(BaseModel):
    prediction_id: Optional[int] = None
    predicted_yield_q_acre: float
    confidence_score: float
    quantum_kernel_dimension: int
    top_factors: List[FeatureAttribution]
    sensitivity_curves: List[SensitivityCurve]
    technical_explanation: str
    evaluated_at: datetime


class RiskFactor(BaseModel):
    category: str  # Water Stress, Weather Risk, Crop Health, Yield Risk, Input Risk
    score: float  # 0 to 100
    risk_level: str  # Low, Moderate, High, Critical, Insufficient Data
    headline: str
    explanation: str
    mitigation_action: str
    action_link: Optional[str] = None
    action_label: Optional[str] = None


class FarmRiskOutlookResponse(BaseModel):
    farm_id: int
    farm_name: str
    overall_risk_score: float  # 0 to 100
    overall_risk_level: str  # Low, Moderate, High, Critical
    risk_factors: List[RiskFactor]
    data_freshness: str
    evaluated_at: datetime


class DigitalTwinResponse(BaseModel):
    farm_id: int
    farm_name: str
    location: str
    state: Optional[str] = None
    country: str = "India"
    latitude: float
    longitude: float
    total_area_hectares: float
    crop: str
    variety: str
    growth_stage: str
    soil_type: str
    mean_ph: float
    mean_nitrogen_kg_ha: float
    mean_moisture_pct: float
    current_weather: Dict[str, Any]
    current_ndvi: float
    historical_yield_trend: List[Dict[str, Any]]
    active_risk_level: str
    active_risk_score: float
    latest_prediction_q_acre: Optional[float] = None
    latest_recommendation_benefit_inr: Optional[float] = None
    boundary_coordinates: Optional[List[List[float]]] = None


class CopilotQueryRequest(BaseModel):
    farm_id: int = 1
    query: str


class CopilotQueryResponse(BaseModel):
    query: str
    answer: str
    sources_used: List[str]
    confidence: float
    context_timestamp: str


class HarvestRecordCreate(BaseModel):
    farm_id: int
    field_id: Optional[int] = None
    season_year: str
    crop_name: str
    predicted_yield: float
    actual_yield: float
    actual_nitrogen: Optional[float] = None
    actual_water_mm: Optional[float] = None
    notes: Optional[str] = None


class HarvestRecordResponse(BaseModel):
    id: int
    farm_id: int
    field_id: Optional[int] = None
    season_year: str
    crop_name: str
    predicted_yield: float
    actual_yield: float
    error_pct: float
    accuracy_pct: float
    actual_nitrogen: Optional[float] = None
    actual_water_mm: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FarmTimelineEventResponse(BaseModel):
    id: int
    farm_id: int
    event_type: str
    title: str
    description: str
    severity: str
    timestamp: datetime
    category: Optional[str] = None
    impact_level: Optional[str] = None
    event_date: Optional[str] = None

    class Config:
        from_attributes = True


class DiseaseDetectionRequest(BaseModel):
    field_id: int = 1
    crop_name: str = "Winter Wheat"
    image_base64: Optional[str] = None


class DiseaseDetectionResponse(BaseModel):
    field_id: int
    crop_name: str
    disease_name: str
    confidence: float
    severity: str
    inspection_notes: str
    cultural_controls: str
    detected_at: datetime


class QuantumScenarioRequest(BaseModel):
    farm_id: Optional[int] = 1
    crop: str = "Winter Wheat"
    nitrogen: float = Field(90.0, ge=10.0, le=300.0)
    phosphorus: float = Field(42.0, ge=5.0, le=150.0)
    potassium: float = Field(42.0, ge=5.0, le=150.0)
    soil_moisture: float = Field(32.0, ge=5.0, le=95.0)
    soil_ph: float = Field(6.8, ge=3.5, le=10.0)
    rainfall: float = Field(450.0, ge=0.0, le=3000.0)
    temperature: float = Field(24.0, ge=-10.0, le=55.0)
    ndvi: float = Field(0.72, ge=0.0, le=1.0)
    irrigation: float = Field(14.0, ge=0.0, le=300.0)
    scenario_name: Optional[str] = "Precision Optimized Plan"
    scenario_type: Optional[str] = "optimized"


class QuantumScenarioResponse(BaseModel):
    scenario_id: str
    scenario_name: str
    scenario_type: str
    predicted_yield: float
    predicted_yield_q_acre: float
    prediction_range: Dict[str, float]
    input_cost: float
    water_requirement: float
    risk: str
    yield_change_pct: float
    economic_estimate: Dict[str, float]
    decision_score: float
    decision_score_breakdown: Dict[str, float]
    model_name: str
    model_version: str
    quantum_configuration: Dict[str, Any]
    why_it_changed: List[Dict[str, Any]]
    timestamp: datetime


class HourlyForecastItem(BaseModel):
    time: str
    temperature_c: float
    precipitation_mm: float
    pop_pct: float
    humidity_pct: float
    wind_speed_kmh: float
    conditions: str


class DailyForecastItem(BaseModel):
    date: str
    temp_max_c: float
    temp_min_c: float
    temp_mean_c: float
    precipitation_mm: float
    precip_prob_pct: float
    humidity_pct: float
    wind_speed_kmh: float
    wind_direction_deg: Optional[float] = None
    conditions: str
    uv_index: Optional[float] = None
    sunrise: Optional[str] = None
    sunset: Optional[str] = None


class RainfallIntelligenceItem(BaseModel):
    recent_observed_mm: float
    forecast_7d_cumulative_mm: float
    baseline_30d_normal_mm: float
    deviation_pct: float
    trend_direction: str  # Deficit, Normal, Surplus
    interpretation: str


class FarmWeatherStatusItem(BaseModel):
    status: str  # Favorable, Watch, Attention, High Risk, Insufficient Data
    headline: str
    rationale: str
    checklist: List[str]


class WeatherImpactCurvePoint(BaseModel):
    variable_val: float
    yield_t_ha: float


class WeatherImpactCurves(BaseModel):
    rainfall_vs_yield: List[WeatherImpactCurvePoint]
    temp_vs_yield: List[WeatherImpactCurvePoint]
    optimal_rainfall_range_mm: str
    optimal_temp_range_c: str
    r2_rainfall: float
    r2_temperature: float


class WeatherIntelligenceResponse(BaseModel):
    farm_id: int
    farm_name: str
    latitude: float
    longitude: float
    weather_provider: str
    data_provenance: str
    last_updated: datetime
    current: Dict[str, Any]
    daily_forecast: List[DailyForecastItem]
    hourly_forecast: List[HourlyForecastItem]
    rainfall_intelligence: RainfallIntelligenceItem
    farm_weather_status: FarmWeatherStatusItem
    weather_impact_curves: WeatherImpactCurves
    operational_advisories: Dict[str, str]


class QuantumWeatherScenarioRequest(BaseModel):
    farm_id: Optional[int] = 1
    crop: str = "Winter Wheat"
    rainfall_delta_pct: float = Field(0.0, ge=-70.0, le=100.0, description="Simulated precipitation variation %")
    temperature_delta_c: float = Field(0.0, ge=-8.0, le=10.0, description="Simulated temperature deviation in °C")
    irrigation_adjustment_mm: float = Field(0.0, ge=0.0, le=100.0, description="Supplemental irrigation mitigation in mm")
    scenario_type: Optional[str] = "custom"
    scenario_name: Optional[str] = "Weather What-If Simulation"


class QuantumWeatherScenarioResponse(BaseModel):
    scenario_id: str
    scenario_name: str
    scenario_type: str
    simulated_rainfall_mm: float
    simulated_temperature_c: float
    simulated_moisture_pct: float
    simulated_yield_t_ha: float
    baseline_yield_t_ha: float
    yield_delta_t_ha: float
    yield_delta_pct: float
    water_requirement_mm: float
    water_stress_tier: str
    economic_estimate: Dict[str, float]
    decision_score: float
    model_name: str
    model_version: str
    quantum_configuration: Dict[str, Any]
    why_it_changed: List[Dict[str, Any]]
    is_simulation_disclaimer: str
    timestamp: datetime


# ==============================================================================
# MODEL BENCHMARK & COMPARISON SCHEMAS
# ==============================================================================

class BenchmarkScatterPoint(BaseModel):
    sample_id: str
    actual: float
    predicted: float


class BenchmarkResidualPoint(BaseModel):
    sample_id: str
    predicted: float
    residual: float


class ModelEvaluationMetricItem(BaseModel):
    model_id: str
    model: str
    type: str
    framework: str
    r2: float
    rmse: float
    mae: float
    mape: float
    train_time_sec: float
    inf_time_sec: float
    rank: int


class HeadlineComparisonModel(BaseModel):
    name: str
    r2: float
    rmse: float
    mae: float
    mape: float
    train_time_sec: float
    inf_time_sec: float


class HeadlineComparisonData(BaseModel):
    quantum_model: HeadlineComparisonModel
    best_classical_model: HeadlineComparisonModel
    r2_delta: float
    rmse_delta: float
    mae_delta: float
    winner: str
    summary_statement: str


class EvaluationDatasetInfo(BaseModel):
    name: str
    version: str
    sample_count: int
    train_count: int
    test_count: int
    features: List[str]
    target: str
    train_split: float
    test_split: float
    validation_method: str
    random_seed: int


class EvaluationEnvironmentInfo(BaseModel):
    cpu: str
    cores: int
    memory_gb: float
    python_version: str
    qiskit_version: str
    qiskit_aer_version: str
    os: str


class QuantumModelTechnicalDetails(BaseModel):
    model_name: str
    feature_map: str
    kernel_type: str
    entanglement: str
    num_qubits: int
    reps: int
    circuit_depth: int
    total_gates: int
    backend: str
    regularization_c: float
    epsilon: float
    disclosed_limitations: str


class BenchmarkResponse(BaseModel):
    benchmark_id: str
    timestamp: datetime
    models: List[ModelEvaluationMetricItem]
    headline_comparison: HeadlineComparisonData
    dataset: EvaluationDatasetInfo
    evaluation_environment: EvaluationEnvironmentInfo
    quantum_details: QuantumModelTechnicalDetails
    actual_vs_predicted: Dict[str, List[BenchmarkScatterPoint]]
    residuals: Dict[str, List[BenchmarkResidualPoint]]
    residual_distributions: Optional[Dict[str, List[Dict[str, Any]]]] = None
    robustness_analysis: Optional[List[Dict[str, Any]]] = None


class BenchmarkRunRequest(BaseModel):
    sample_count: int = Field(130, ge=40, le=500, description="Total sample plots in agronomic dataset")
    random_seed: int = Field(42, ge=0, le=999999, description="Random seed for reproducible train/test split")
    test_size: float = Field(0.25, ge=0.1, le=0.4, description="Test split proportion")


# ==============================================================================
# UNIFIED FARM SETUP & HARVEST FEEDBACK SCHEMAS
# ==============================================================================

class UserProfileExtended(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    farm_count: int = 0
    location_preference: Optional[str] = None

    class Config:
        from_attributes = True


class FarmSetupRequest(BaseModel):
    # Farm Info
    farm_name: str = Field(..., min_length=2, max_length=150, description="Farm identifier name")
    location: str = Field(..., min_length=2, max_length=200, description="District / Region name")
    city: Optional[str] = "Guntur"
    state: Optional[str] = "Andhra Pradesh"
    country: str = Field(default="India")
    pincode: Optional[str] = Field(default=None, description="Postal PIN / Zip Code")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="GPS Latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="GPS Longitude")
    total_area_hectares: float = Field(..., gt=0.1, le=50000.0, description="Total farm area")
    area_unit: str = Field(default="Hectares", description="Hectares or Acres")

    # Crop Info
    crop_name: str = Field(..., min_length=2, max_length=100, description="Primary crop name")
    crop_variety: Optional[str] = Field(default="Certified High Yield (PBW-343 / Swarna)")
    season: str = Field(default="Rabi", description="Kharif, Rabi, or Zaid")
    planting_date: Optional[datetime] = None
    expected_harvest_date: Optional[datetime] = None
    growth_stage: str = Field(default="Vegetative / Tillering")
    cultivated_area_hectares: Optional[float] = None

    # Soil Info
    soil_nitrogen: float = Field(..., ge=5.0, le=500.0, description="Nitrogen level in kg/ha")
    soil_phosphorus: float = Field(..., ge=2.0, le=250.0, description="Phosphorus level in kg/ha")
    soil_potassium: float = Field(..., ge=5.0, le=600.0, description="Potassium level in kg/ha")
    soil_ph: float = Field(..., ge=4.0, le=9.5, description="Soil pH level")
    soil_moisture: float = Field(..., ge=2.0, le=75.0, description="Soil moisture %")
    organic_matter: Optional[float] = Field(default=0.75, ge=0.05, le=10.0, description="Organic matter %")
    soil_type: Optional[str] = Field(default="Alluvial Loam", description="Soil classification")


class FarmSetupResponse(BaseModel):
    status: str = "success"
    message: str
    farm: FarmResponse
    field: FieldResponse
    crop: CropResponse
    soil_telemetry: Dict[str, Any]
    weather: Dict[str, Any]
    satellite: Dict[str, Any]
    prediction: Dict[str, Any]
    quantum_analysis: Dict[str, Any]
    risk_outlook: Dict[str, Any]
    recommendations: Dict[str, Any]
    economic_impact: Dict[str, Any]


class HarvestResultCreate(BaseModel):
    farm_id: int
    field_id: Optional[int] = None
    crop_name: str = Field(..., min_length=2)
    season_year: str = Field(..., min_length=2)
    actual_yield: float = Field(..., gt=0.0, description="Actual recorded yield in Quintals/Acre")
    predicted_yield: Optional[float] = None
    actual_nitrogen: Optional[float] = None
    actual_water_mm: Optional[float] = None
    notes: Optional[str] = None


class HarvestResultResponse(BaseModel):
    id: int
    farm_id: int
    field_id: Optional[int]
    crop_name: str
    season_year: str
    predicted_yield: float
    actual_yield: float
    error_pct: float
    actual_nitrogen: Optional[float]
    actual_water_mm: Optional[float]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ==============================================================================
# DUAL-ENGINE OPTIMIZATION & WEATHER IMPACT SCHEMAS
# ==============================================================================

class OptimizationScenarioRequest(BaseModel):
    objective_type: str = Field(default="balanced_plan", description="maximum_yield, minimum_cost, minimum_water, balanced_plan")
    current_nitrogen: float = Field(default=85.0, ge=10.0, le=300.0)
    current_phosphorus: float = Field(default=45.0, ge=5.0, le=150.0)
    current_potassium: float = Field(default=40.0, ge=5.0, le=150.0)
    soil_moisture: float = Field(default=28.0, ge=5.0, le=60.0)
    rainfall: float = Field(default=140.0, ge=0.0, le=1000.0)
    ndvi: float = Field(default=0.62, ge=0.0, le=1.0)
    budget_limit_usd_ha: Optional[float] = Field(default=240.0, ge=50.0, le=2000.0)
    target_yield_q_acre: Optional[float] = Field(default=32.0, ge=10.0, le=60.0)


class OptimizationSolutionItem(BaseModel):
    method: str
    nitrogen_kg_ha: float
    phosphorus_kg_ha: float
    potassium_kg_ha: float
    irrigation_mm: float
    predicted_yield_q_acre: float
    predicted_yield_t_ha: float
    input_cost_usd_ha: float
    objective_score: float
    runtime_ms: float
    iterations: Optional[int] = None
    tunneling_steps: Optional[int] = None
    status: str


class OptimizationScenarioResponse(BaseModel):
    objective: str
    classical_solution: OptimizationSolutionItem
    quantum_inspired_solution: OptimizationSolutionItem
    objective_delta: float
    runtime_ratio: float
    superior_method: str
    scientific_assessment: str
    constraints: Dict[str, Any]
    timestamp: datetime


class WeatherImpactScenarioItem(BaseModel):
    scenario_id: str
    name: str
    description: str
    temperature_shift_c: float
    rainfall_shift_pct: float
    classical_yield_q_acre: float
    quantum_yield_q_acre: float
    yield_delta_q_acre: float
    risk_level: str
    scientific_rationale: str


class FarmWeatherImpactResponse(BaseModel):
    farm_id: int
    farm_name: str
    observed_weather: Dict[str, Any]
    baseline_classical_yield: float
    baseline_quantum_yield: float
    stress_simulations: List[WeatherImpactScenarioItem]
    model_type_disclaimer: str = "Model Simulation — Evaluates classical vs quantum yield response under climate shock scenarios. Not a physical weather forecast."
    timestamp: datetime


# ==============================================================================
# USER REAL-TIME LOCATION SCHEMAS
# ==============================================================================
class UserLocationPayload(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude between -90 and 90")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude between -180 and 180")
    accuracy: Optional[float] = Field(None, ge=0.0, description="GPS accuracy radius in meters")
    altitude: Optional[float] = None
    heading: Optional[float] = Field(None, ge=0.0, le=360.0)
    speed: Optional[float] = Field(None, ge=0.0)
    source: str = Field(default="gps", description="gps, manual, farm, or last_known")
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    timestamp: Optional[datetime] = None


class UserLocationResponse(BaseModel):
    user_id: int
    latitude: float
    longitude: float
    accuracy: Optional[float]
    altitude: Optional[float]
    heading: Optional[float]
    speed: Optional[float]
    source: str
    city: Optional[str]
    district: Optional[str]
    state: Optional[str]
    country: Optional[str]
    timestamp: datetime

