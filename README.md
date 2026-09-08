# AgriQuantum: Precision Agriculture Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.136.1-009688?logo=fastapi&logoColor=white)](http://localhost:8000/docs)
[![Qiskit](https://img.shields.io/badge/Qiskit-2.x%20%7C%201.x-138A4B?logo=qiskit&logoColor=white)](https://qiskit.org/)
[![Qiskit Aer](https://img.shields.io/badge/Qiskit%20Aer-Statevector%20Simulator-075B35)](https://github.com/Qiskit/qiskit-aer)
[![IBM Quantum](https://img.shields.io/badge/IBM%20Quantum-Fall%20Fest%202024-28B866)](https://ibm.biz/qiskit-fall-fest)
[![Centurion University](https://img.shields.io/badge/Hackathon-Centurion%20University%202026-138A4B)](https://cutm.ac.in)
[![Design System](https://img.shields.io/badge/Brand%20Design-White%20%2B%20Green-138A4B)](#2-brand-color-system-and-typography)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

> **Platform Overview**: Commercial-grade precision agritech platform engineered for researchers, farmers, agronomists, investors, and technical evaluators.  
> **Brand Palette**: Professional White and Green identity (`#138A4B`, `#075B35`, `#28B866`, `#E8F6EE`, `#F4FAF6`, `#FFFFFF`, `#F7F9F8`).  
> **Typography System**: Strict **Inter** sans-serif font globally for UI text; **Geist Mono** strictly for technical codes (qubit counts, model tags, dataset hashes).  
> **Architecture**: Multi-tier production platform featuring a **Next.js 15 Web Application** (`frontend/` on `:3000`), a **Streamlit Dashboard** (`:8501`), and a **FastAPI Production REST Gateway** (`:8000`).

---

## 1. Executive Summary

Modern agriculture is data rich, yet critical agronomic decisions remain constrained by complex interactions between soil, weather, and crop factors:
- **Soil Conditions**: Nitrogen, Phosphorus, Potassium (N-P-K), pH, and Volumetric Soil Moisture.
- **Weather Conditions**: Cumulative Rainfall and Ambient Temperature.
- **Crop Health**: Sentinel-2 Multispectral Normalized Difference Vegetation Index (NDVI).

**AgriQuantum** transforms agricultural observations into a quantum format so the model can identify complex relationships across field conditions. By evaluating quantum state transition fidelities ($K(x_i, x_j) = |\langle \Phi(x_i) | \Phi(x_j) \rangle|^2$), AgriQuantum trains a Quantum Support Vector Regressor (`QSVR`) that accurately estimates expected crop production and powers practical fertilizer and irrigation recommendations.

---

## 2. Typography & Visual Identity

The interface strictly adheres to an enterprise sans-serif design language:

| Visual Element | Specification | Semantic Role |
| :--- | :--- | :--- |
| **Primary Sans Font** | **Inter** (400, 500, 600, 700) | Headings, navigation, body copy, form labels, buttons, tooltips |
| **Technical Font** | **Geist Mono** (monospace) | Model versions, qubit counts, circuit depths, API status badges, hashes |
| **Primary Green** | `#138A4B` | Main brand accent, primary action buttons, active tab highlights |
| **Deep Green** | `#075B35` | Major titles, brand logo, high contrast accents |
| **Accent Green** | `#28B866` | Operational status indicators, positive yields |
| **Soft Green** | `#E8F6EE` | Active navigation pill, badge fills, highlight surfaces |
| **Canvas Background**| `#F8FAFC` | Clean, spacious application workspace canvas |

---

## 3. Full Stack Architecture

AgriQuantum operates as a complete multi-tier enterprise architecture:

```
fallfest/
├── assets/
│   └── hero_agriculture.jpg    # Aerial drone photography
├── backend/                    # FastAPI Production REST Gateway (:8000)
│   ├── api.py                  # Server initialization and middleware
│   ├── api_v1.py               # Versioned REST router (/api/v1/) with 20+ endpoints
│   ├── auth.py                 # Bcrypt hashing + signed JWT Bearer auth
│   ├── database.py             # SQLAlchemy engine & SQLite/PostgreSQL connection
│   ├── models.py               # 15 core relational database entities
│   ├── schemas.py              # Strict Pydantic models for validation
│   ├── security.py             # Rate limiting, secure headers & audit logging
│   └── services/               # Reusable business logic clients
│       ├── visual_crossing_service.py # Visual Crossing Weather API (1-hr TTL cache)
│       ├── satellite_service.py       # Copernicus Sentinel-2 L2A vegetation pipeline
│       ├── report_service.py          # ReportLab certified PDF generator
│       └── supabase_service.py        # Supabase cloud telemetry & health sync
├── frontend/                   # Next.js 15 App Router Frontend (:3000)
│   ├── app/                    # TypeScript page routes
│   │   ├── dashboard/          # Control Center, Farms, Predict, Quantum, etc.
│   │   ├── globals.css         # Inter font tokens and emerald themes
│   │   ├── layout.tsx          # Root layout with Inter & Geist Mono fonts
│   │   └── page.tsx            # Cinematic agritech landing page
│   ├── components/             # Sidebar, Navbar, and widgets
│   └── lib/api.ts              # Typed REST client connecting to FastAPI
├── core/
│   ├── quantum_engine.py       # 4-Qubit ZZFeatureMap & fidelity quantum kernel QSVR
│   ├── benchmark.py            # QSVR vs Random Forest vs RBF SVR vs Ridge
│   └── recommender.py          # Constrained N-P-K and irrigation optimizer
├── data/
│   └── generator.py            # Agronomic biophysical model and [0, 2π] quantum scaler
├── tests/                      # Automated test suite (36 tests passing)
│   ├── test_engine.py
│   ├── test_database.py
│   ├── test_api_v1.py
│   ├── test_supabase.py
│   ├── test_weather_visual_crossing.py
│   └── test_farm_crud_and_data.py
├── app.py                      # Streamlit interactive dashboard on port 8501
├── docker-compose.yml          # Full stack orchestration (Postgres, Redis, API, Next.js, Dashboard)
└── README.md                   # Enterprise architecture and operations manual
```

---

## 4. REST API Documentation (FastAPI on `:8000`)

The backend exposes interactive Swagger documentation at **`http://localhost:8000/docs`**:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Platform health, simulator status, active qubits |
| `POST` | `/api/predict` | Executes 4 Qubit QSVR inference on continuous field measurements |
| `POST` | `/api/recommend` | Constrained fertilizer and irrigation optimization |
| `GET` | `/api/benchmark` | Statistical comparison (R², RMSE, MAE) across 4 architectures |
| `GET` | `/api/kernel-matrix` | Evaluates $K(x_i, x_j) = \|\langle \Phi(x_i)\|\Phi(x_j)\rangle\|^2$ Gram matrix |
| `GET` | `/api/quantum-circuit` | Circuit depth, gate counts, and decomposed ASCII diagram |
| `GET` | `/api/plots` | Monitored agricultural holdings with regional baselines |
| `GET` | `/api/ndvi` | Spatial 30 acre Sentinel-2 NDVI canopy grid |
| `POST` | `/api/reports` | Generates official agronomic audit report text |

---

## 5. Dashboard and Landing Page (Streamlit on `:8501`)

### 5.1 Landing Page
- **Navigation Bar**: Brand logo, anchor links (*Home, Platform, Technology, How It Works, Impact*), *Sign In*, and *Open Dashboard*.
- **Hero Section**:
  - Small Label: `PRECISION AGRICULTURE PLATFORM`
  - Headline: **Make Better Farming Decisions With Better Data**
  - Supporting Text: AgriQuantum combines soil information, weather conditions, satellite data, and quantum machine learning to predict crop yield and recommend better agricultural inputs.
  - High resolution aerial agricultural landscape (`assets/hero_agriculture.jpg`).
  - Subtle floating data overlays: Expected Yield (`38.4 Quintals per Acre`), Vegetation Health (`0.82`), Model Status (`Ready`).
- **Problem Section**: 3 cards (Soil Conditions, Weather Conditions, Crop Health).
- **How It Works**: 5 step workflow from Farm Data to Practical Recommendations.
- **Features Section**: 8 capability cards for smarter crop planning.
- **Quantum Technology Section**: 4 qubit parameterized quantum circuit visualization.
- **Impact Section and Action**: Verified field metrics and *Open Dashboard*.

### 5.2 Dashboard (Persistent 250px Left Sidebar)
Routes across 9 operational modules:
1. **Overview**: Farm Overview summary, metric cards (Expected Yield, Model Accuracy, Estimated Input Savings, Prediction Confidence), Actual and Predicted Yield chart.
2. **Yield Prediction**: Farm Information input form with continuous sliders and numeric inputs.
3. **Farm Analysis**: Detailed conditions for each agricultural plot, Soil Health index, Climate Stress, and historical trend.
4. **Recommendations**: Recommended Plan for Nitrogen, Phosphorus, Potassium, and Irrigation with estimated farm cost savings.
5. **Quantum Analysis**: Quantum Data Map, Quantum Similarity Matrix, and 4 qubit Quantum Circuit inspection.
6. **Model Comparison**: Side by side evaluation of Quantum SVR, Random Forest, RBF SVR, and Ridge Regression across R², RMSE, and MAE.
7. **Crop Health**: Vegetation Health (NDVI 0.82 Healthy), Vegetation Trend, Field Health, and Areas Requiring Attention.
8. **Data**: Upload CSV, Choose Dataset, Validate Data, and Download Dataset.
9. **Reports**: Complete agricultural analysis summary with instant text and PDF download.
10. **Weather Conditions**: Real-time atmospheric telemetry, dual-axis 7-day forecast, 7-day historical precipitation trend, and weather impact on crop yield powered by Visual Crossing.

---

## 6. Agro-Meteorological Weather Service (Visual Crossing)

AgriQuantum integrates Visual Crossing's Global Weather Timeline API:

```
Next.js / Streamlit Dashboard
          ↓
FastAPI Gateway (:8000)
          ↓
VisualCrossingWeatherService (1-Hour In-Memory TTL Cache)
          ↓
Visual Crossing Weather Timeline API
          ↓
Clean Pydantic Response Models
          ↓
PostgreSQL Persistence (weather_observations) & UI Telemetry
```

### Endpoints
- `GET /api/v1/weather/current?latitude={lat}&longitude={lon}`: Real-time temperature, humidity, precipitation, solar radiation, pressure, wind, clouds.
- `GET /api/v1/weather/forecast?latitude={lat}&longitude={lon}&days={days}`: Up to 15-day daily agricultural projections.
- `GET /api/v1/weather/history?latitude={lat}&longitude={lon}&start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}`: Historical observations for biophysical model calibration.
- `GET /api/v1/weather/farm/{farm_id}`: Consolidated current, 7-day forecast, 7-day history, and agricultural advisory impact with database persistence.

---

## 7. Mathematical and Quantum Formulation

### 7.1 4 Qubit Parameterized Quantum Feature Map
Continuous agronomic drivers $\vec{x} \in [0, 2\pi]^4$ are mapped into quantum states:

$$|\Phi(\vec{x})\rangle = U_{\Phi(\vec{x})} |0\rangle^{\otimes 4}$$

$$U_{\Phi(\vec{x})} = \left( \exp\left(i \sum_{j=1}^4 x_j Z_j + \sum_{j=1}^3 (\pi - x_j)(\pi - x_{j+1}) Z_j Z_{j+1}\right) H^{\otimes 4} \right)^2$$

- **Qubits**: 4 (`soil_nitrogen`, `soil_moisture`, `rainfall`, `ndvi`)
- **Circuit Depth**: 19
- **Entangling Gates**: 12 CNOT gates capturing non-linear cross feature interactions

### 7.2 Quantum Kernel Gram Matrix
Transition fidelity between quantum states:

$$K(\vec{x}_i, \vec{x}_j) = |\langle \Phi(\vec{x}_i) | \Phi(\vec{x}_j) \rangle|^2$$

---

## 8. Quickstart Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and set your credentials:
```env
VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key_here
SUPABASE_URL=https://arbykwiinhpaymeuzhtl.supabase.co
SUPABASE_KEY=your_supabase_anon_key
COPERNICUS_CLIENT_ID=your_client_id
COPERNICUS_CLIENT_SECRET=your_client_secret
```

### 3. Run Automated Test Suite
```bash
python -m unittest discover -s tests -p "test_*.py" -v
```
*Result*: `Ran 36 tests in 11.4s. OK (100% Passing across quantum engine, database, API v1, Supabase, Visual Crossing, and Farm CRUD)`

### 4. Launch Services

#### A. Next.js 15 Enterprise Web Frontend (`:3000`)
```bash
cd frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser for the React/Next.js interface.

#### B. FastAPI REST Production Gateway (`:8000`)
```bash
python -m uvicorn backend.api:app --host 0.0.0.0 --port 8000
```
Open **`http://localhost:8000/docs`** for interactive Swagger API documentation.

#### C. Streamlit Python Dashboard (`:8501`)
```bash
python -m streamlit run app.py --server.port 8501
```
Open **`http://localhost:8501`** in your browser for the Python-native dashboard.

#### D. Full-Stack Docker Compose
```bash
docker compose up --build -d
```
Spins up PostgreSQL 15, FastAPI (`:8000`), Next.js (`:3000`), and Streamlit (`:8501`).