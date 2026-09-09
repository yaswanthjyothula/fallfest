# AgriQuantum REST API Endpoints Guide

All production REST endpoints are versioned under `/api/v1/` and documented via OpenAPI 3.1 Swagger UI at `http://localhost:8000/docs`.

---

## 1. Authentication & Profile Endpoints

### `GET /api/v1/me`
- **Description**: Returns authenticated user profile, full name, role, and registered farm count.
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": 1,
    "email": "test@gmail.com",
    "full_name": "Yaswanth",
    "role": "Farmer",
    "location_preference": "Andhra Pradesh, India",
    "farm_count": 1,
    "created_at": "2026-09-08T00:00:00Z"
  }
  ```

### `POST /api/v1/auth/login`
- **Description**: Authenticates user via email and password; returns JWT access token.
- **Payload**: `{"email": "test@gmail.com", "password": "test123"}`
- **Response**: `{"access_token": "...", "token_type": "bearer", "full_name": "Yaswanth"}`

---

## 2. Farm Management & Unified Setup

### `POST /api/v1/farms/setup`
- **Description**: Master onboarding orchestrator. Validates agricultural inputs, creates Farm, Field, Crop, and Soil records, pulls live Visual Crossing weather and Copernicus Sentinel-2 satellite NDVI, executes 4-Qubit QSVR yield prediction, calculates 5-factor agro-climatic risk, generates precision N-P-K and irrigation recommendations, and estimates economic upside.
- **Payload**:
  ```json
  {
    "farm_name": "Krishna Delta Farm",
    "location": "Vijayawada, Andhra Pradesh, India",
    "latitude": 16.5062,
    "longitude": 80.6480,
    "total_area_hectares": 12.5,
    "crop_name": "Paddy / Rice",
    "crop_variety": "BPT-5204 Samba Mahsuri",
    "season": "Kharif",
    "soil_type": "Alluvial Loam",
    "nitrogen_kg_ha": 95.0,
    "phosphorus_kg_ha": 40.0,
    "potassium_kg_ha": 45.0,
    "soil_ph": 6.8,
    "soil_moisture_pct": 30.0
  }
  ```
- **Response**: Returns complete aggregated `FarmSetupResponse` with populated predictions, risk radar, recommendations, and weather context.

### `GET /api/v1/farms`
- **Description**: Retrieves list of registered farms belonging strictly to the authenticated user.

### `DELETE /api/v1/farms/{farm_id}`
- **Description**: Removes farm and cascades deletion across fields, crops, telemetry records, and predictions.

---

## 3. Weather Intelligence Endpoints

### `GET /api/v1/weather/farm/{farm_id}`
- **Description**: Retrieves current weather, 7-day forecast, 7-day precipitation history, and agronomic advisory impact for the target farm.

### `GET /api/v1/weather/intelligence/{farm_id}`
- **Description**: Deep weather intelligence including 24-hour hourly progressions, precipitation baseline deviations, and empirical weather-to-yield sensitivity curves.

### `POST /api/v1/quantum/weather-scenario`
- **Description**: Simulates yield impact under precipitation deltas (e.g. $-40\%$ drought, $+50\%$ flood) and temperature shifts using the Quantum ML engine.

---

## 4. Satellite & Crop Health Endpoints

### `GET /api/v1/crop-health/{farm_id}`
- **Description**: Retrieves latest Sentinel-2 L2A multispectral observations, mean canopy NDVI, cloud cover fraction, and vegetative vigor categorization.

---

## 5. Machine Learning & Benchmarking Endpoints

### `POST /api/v1/predictions/yield`
- **Description**: Runs 4-Qubit QSVR yield prediction on field measurements.
- **Payload**:
  ```json
  {
    "crop": "Paddy / Rice",
    "area": 12.5,
    "nitrogen": 95.0,
    "phosphorus": 40.0,
    "potassium": 45.0,
    "soil_moisture": 30.0,
    "soil_ph": 6.8,
    "rainfall": 520.0,
    "temperature": 26.5,
    "ndvi": 0.72
  }
  ```

### `GET /api/v1/models/benchmark`
- **Description**: Returns live statistical evaluation results ($R^2$, RMSE, MAE, MAPE, latency) comparing Quantum SVR, Random Forest, Classical SVR (RBF), and Ridge Regression across zero-leakage holdout splits.

### `POST /api/v1/models/benchmark/run`
- **Description**: Re-evaluates benchmark suite on demand and updates relational model benchmark logs.

---

## 6. Recommendations & Risk Endpoints

### `GET /api/v1/risk/{farm_id}`
- **Description**: 5-factor agricultural risk radar assessing Soil Moisture Stress, Precipitation Anomaly, Thermal Stress, Nutrient Imbalance, and Vegetative Health Deficit.

### `GET /api/v1/recommendations/{farm_id}`
- **Description**: Formulates optimal N-P-K nutrient dosage, supplemental irrigation requirements, and net profit delta in local currency.

---

## 7. Actual Harvest Feedback Endpoints

### `POST /api/v1/harvest-results`
- **Description**: Records post-harvest actual crop output and computes model prediction error.
- **Payload**:
  ```json
  {
    "farm_id": 1,
    "field_id": 1,
    "crop_name": "Paddy / Rice",
    "actual_yield_q_acre": 34.5,
    "actual_inputs_summary": "95 kg N, 40 kg P, 45 kg K, 25mm irrigation",
    "notes": "Optimal harvesting conditions"
  }
  ```
- **Response**: Calculates `variance_q_acre`, `error_pct`, and updates historical ledger.
