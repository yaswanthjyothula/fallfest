# AgriQuantum
### Precision Agriculture Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?logo=fastapi&logoColor=white)](http://localhost:8000/docs)
[![Qiskit](https://img.shields.io/badge/Qiskit-2.x%20%7C%20Aer%20Simulator-138A4B?logo=qiskit&logoColor=white)](https://qiskit.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.4%20Turbopack-black?logo=next.js&logoColor=white)](http://localhost:3000)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

> **AgriQuantum** transforms agricultural observations into a quantum format so the model can identify complex relationships across field conditions. By evaluating quantum state transition fidelities, AgriQuantum trains a Quantum Support Vector Regressor (`QSVR`) that accurately estimates expected crop production and powers practical fertilizer and irrigation recommendations.

---

## 1. What AgriQuantum Does & Why It Matters

Modern agriculture faces unprecedented climate volatility, rising fertilizer costs, and complex non-linear interactions between topsoil chemistry, atmospheric weather, and crop physiology. Conventional decision-making often relies on rigid rulebooks or linear baselines that underfit agricultural realities.

**AgriQuantum** is an enterprise-grade precision agriculture intelligence platform designed for farmers, agricultural extension officers, researchers, and agritech cooperatives. It:
1. **Puts the Farmer in Control**: Starts empty by default. No fake demo farms, no hardcoded metrics. Every prediction, risk rating, and recommendation is calculated directly from the authenticated user's submitted farm telemetry.
2. **Automates Remote Sensing**: Seamlessly enriches farm boundary coordinates with real-time Visual Crossing meteorological data and Copernicus Sentinel-2 multispectral vegetation vigor without requiring manual data entry.
3. **Applies Practical Quantum ML**: Translates continuous agro-meteorological drivers into 4-qubit quantum states in Hilbert space, evaluating state transition fidelities on Qiskit Aer to model complex soil-climate-yield non-linearities.
4. **Quantifies Real-World Economic Impact**: Translates yield forecasts into net profit margins, input cost variance, and certified PDF agronomic audit reports.

---

## 2. Core Features

- **Farm Management**: Create and manage multiple independent holdings (Farm A, Farm B, Farm C) with dedicated boundaries, soil assays, crop cycles, and historical telemetry isolation.
- **Location Intelligence**: Browser GPS auto-detection with fallback manual search, resolving municipal addresses, district coordinates, and centering geospatial farm plots.
- **Weather Intelligence**: Live atmospheric observations, 24-hour hourly progressions, 7-day forecast envelopes, precipitation baseline deviations, and empirical rainfall-to-yield curves powered by Visual Crossing.
- **Satellite Crop Health**: Direct integration with Copernicus Sentinel-2 Level-2A surface reflectance to automatically extract mean canopy NDVI ($\text{B08} - \text{B04} / \text{B08} + \text{B04}$) and monitor vegetative vigor across 5-day revisit passes.
- **Yield Prediction**: 4-Qubit Quantum Support Vector Regression (`QSVR`) evaluating expected harvest outputs in both metric quintals per acre ($Q/\text{ac}$) and tonnes per hectare ($t/\text{ha}$).
- **Classical ML Benchmarking**: Scientifically rigorous, zero-leakage comparative evaluation against Random Forest, Classical SVR (RBF), and Ridge Regression across standardized holdout splits.
- **Quantum Machine Learning**: Parameterized 4-qubit `ZZFeatureMap` circuit with second-order Pauli-Z entanglement and harmonic phase scaling ($\alpha = 0.1$) running on Qiskit Aer.
- **Quantum Farm What-If Lab**: Interactive agronomic simulator enabling growers to test nutrient adjustments (N-P-K) and irrigation schedules, calculating predicted yield delta, net profit changes, and water stress.
- **Farm Digital Twin**: 360-degree synchronized virtual model of the farm combining satellite imagery, soil health, real-time weather, and historical predictive timelines.
- **Agricultural Risk Radar**: Multi-factor agro-climatic assessment evaluating Soil Moisture Stress, Precipitation Anomaly, Thermal Stress, Nutrient Imbalance, and Vegetative Health Deficit across Low, Moderate, and High tiers.
- **Precision Recommendations**: Targeted advisory engine delivering precise N-P-K kilograms per hectare, supplemental irrigation millimetres, and split-application schedules.
- **Economic Impact**: Real-time balance-sheet projections calculating gross crop revenues, fertilizer/water expenditure, and net economic upside in local currency.
- **Harvest Feedback Memory**: Post-harvest verification loop allowing farmers to input actual yield outcomes to automatically compute model accuracy, error percentages, and refine future intelligence.
- **Certified Agronomic Reports**: Automated ReportLab PDF generator creating official certified agronomic certificates sealed with cryptographic SHA-256 validation digests.

---

## 3. Full-Stack Architecture

AgriQuantum is structured as a decoupled, service-oriented multi-tier platform:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Next.js 16 Enterprise Web Portal                     │
│                React 19 • TailwindCSS • Apache ECharts                 │
│                         http://localhost:3000                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON REST API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  FastAPI Production REST Gateway                       │
│        OpenAPI 3.1 • Bcrypt / JWT • Pydantic v2 • Rate Limiting        │
│                         http://localhost:8000                          │
└───────┬──────────────┬──────────────┬──────────────┬───────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌────────────────────────┐
│  Supabase /  ││VisualCrossing││  Copernicus  ││ Quantum & ML Engines   │
│  PostgreSQL  ││ Weather API  ││ Sentinel-2   ││ Qiskit 2.x • Aer       │
│  Relational  ││ (1h Cache)   ││ L2A Surface  ││ Scikit-Learn Ensemble  │
└──────────────┘└──────────────┘└──────────────┘└────────────────────────┘
        ▲
        │
┌───────┴────────────────────────────────────────────────────────────────┐
│               Streamlit Quantum Agronomy Research Terminal             │
│                 Internal Research & Simulation Console                 │
│                         http://localhost:8501                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Architectural Roles
- **Frontend (`:3000`)**: Primary farmer-facing responsive Next.js application handling client state, onboarding workflows, map visualizations, and telemetry dashboards.
- **FastAPI Gateway (`:8000`)**: Production REST API exposing versioned `/api/v1/` endpoints, managing JWT authentication, farm ownership isolation, and telemetry orchestration.
- **Streamlit Terminal (`:8501`)**: Dedicated internal research and testing interface for quantum algorithm validation and scientific exploration.
- **Supabase / PostgreSQL**: Cloud database storing relational user accounts, multi-farm holdings, field profiles, and predictive ledgers with Row-Level Security.

---

## 4. Data Sources

AgriQuantum clearly categorizes every data point displayed to the user:

| Category | Type | Source / Calculation |
| :--- | :--- | :--- |
| **Ground Soil Data** | *User Supplied* | Farmer lab soil assays: Nitrogen, Phosphorus, Potassium (kg/ha), pH, Soil Moisture (%). |
| **Crop Attributes** | *User Supplied* | Crop type, cultivar variety, sowing season, sowing date, expected harvest date. |
| **Live Weather** | *Observed* | Real-time temperature, humidity, wind, rainfall via Visual Crossing Weather Timeline API. |
| **Weather Forecast** | *Forecast* | 7-day daily temperature envelopes and precipitation probabilities from Visual Crossing. |
| **Satellite Telemetry**| *Observed* | ESA Copernicus Sentinel-2 L2A bottom-of-atmosphere surface reflectance (B08 NIR, B04 Red). |
| **Vegetation Health** | *Calculated* | Normalized Difference Vegetation Index: $\text{NDVI} = (\text{B08} - \text{B04}) / (\text{B08} + \text{B04})$. |
| **Yield Prediction** | *Model Generated* | 4-Qubit Quantum SVR inference projecting field feature vector into Hilbert space. |
| **Agro-Climatic Risk**| *Calculated* | 5-factor weighted algorithm integrating weather anomaly, soil deficit, and NDVI trajectory. |
| **Economic Upside** | *Estimated* | Projected revenue based on regional minimum support prices minus optimized input costs. |
| **Harvest Error** | *Calculated* | Post-harvest verification: $|\text{Actual} - \text{Predicted}| / \text{Actual} \times 100\%$. |

---

## 5. First-Time User Experience Flow

A brand-new user follows an intuitive, zero-mock onboarding journey:

```
1. Sign In / Sign Up
      ↓
2. Empty State Dashboard
   "Let's set up your farm" (No fake yield, no fake weather, no fake NDVI)
      ↓
3. Click "Add My Farm"
      ↓
4. Unified Farm Setup Form
   - Location (GPS Auto-detect or Manual coordinates)
   - Crop & Season selection
   - Soil N-P-K, pH, Moisture levels
      ↓
5. Click "Analyze My Farm"
   [Live Pipeline: Save Farm → Live Weather → Sentinel NDVI → 4-Qubit QSVR → Risk Radar → Recommendations]
      ↓
6. Immediate Intelligence Result View
   - Instant Farm Summary Card
   - Weather & NDVI sync
   - Predicted Yield (Q/acre & t/ha)
   - 5-Factor Risk Status
   - Optimization Recommendations
      ↓
7. Personalized Dashboard Populated
   - Digital Twin active
   - Real-time weather telemetry
   - What-If simulator calibrated to farm
   - Certified PDF report ready for download
```

---

## 6. Local Development & Operational URLs

### Prerequisites
- Python 3.10+ (tested on Python 3.11, 3.12, 3.13)
- Node.js 20+ with `npm`
- Git

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yaswanthjyothula/fallfest.git
   cd fallfest
   ```

2. **Set up Python backend**:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Set up Next.js frontend**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Launching Applications

| Service | Local URL | Launch Command |
| :--- | :--- | :--- |
| **Next.js Web Portal** *(Primary)* | **`http://localhost:3000`** | `cd frontend && npm run dev` |
| **FastAPI REST Gateway** | **`http://localhost:8000`** | `python -m uvicorn backend.api:app --host 0.0.0.0 --port 8000` |
| **API Documentation (Swagger)** | **`http://localhost:8000/docs`** | *Automatically available on port 8000* |
| **Streamlit Research Console** | **`http://localhost:8501`** | `python -m streamlit run app.py --server.port 8501` |

---

## 7. Environment Configuration

All environment configuration is centralized in `.env.example`:

```env
# Application Mode
ENVIRONMENT=development
DEBUG=true

# Database Connection (SQLite or Supabase PostgreSQL)
DATABASE_URL=sqlite:///./agriquantum.db

# JWT Security
SECRET_KEY=generate_a_secure_64_character_hex_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Next.js Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://arbykwiinhpaymeuzhtl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Visual Crossing Weather API
VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key_here

# Copernicus Sentinel-2 Satellite API
COPERNICUS_CLIENT_ID=your_client_id_here
COPERNICUS_CLIENT_SECRET=your_client_secret_here

# Quantum Execution Backend (statevector or sampler)
QUANTUM_BACKEND=statevector
QUANTUM_CIRCUIT_QUBITS=4
QUANTUM_REPS=2
```

---

## 8. Automated Testing & Verification

AgriQuantum includes a test suite covering the Quantum Engine, Classical ML, Database ORM, API Endpoints, Weather Ingestion, and the Personalized Farm Flow:

```bash
# Run full automated test suite (59 test cases)
python -m unittest discover tests -v

# Run production integrity check script
python scripts/verify_system.py

# Verify Next.js frontend build
cd frontend && npm run build
```

---

## 9. Project Directory Structure

```
fallfest/
├── backend/                    # FastAPI REST Production Gateway (:8000)
│   ├── api.py                  # App initialization, CORS, and middleware
│   ├── api_v1.py               # Versioned REST router (/api/v1/)
│   ├── auth.py                 # Bcrypt password hashing & JWT token verification
│   ├── database.py             # SQLAlchemy session manager & schema initializer
│   ├── models.py               # 15 relational database entities
│   ├── schemas.py              # Pydantic v2 validation schemas
│   ├── security.py             # Rate limiting & security headers
│   └── services/               # Reusable business logic clients
│       ├── disease_service.py         # Empirical crop disease detection
│       ├── explainability_service.py  # Feature importance & sensitivity
│       ├── report_service.py          # ReportLab certified PDF generator
│       ├── risk_engine.py             # 5-factor agro-climatic risk radar
│       ├── satellite_service.py       # Copernicus Sentinel-2 L2A remote sensing
│       ├── supabase_service.py        # Cloud telemetry & database sync
│       ├── visual_crossing_service.py # Visual Crossing weather client
│       └── weather_service.py         # Weather aggregator & caching
├── core/                       # Scientific Quantum & ML Algorithms
│   ├── benchmark.py            # Zero-leakage 4-model comparative evaluation
│   ├── quantum_engine.py       # 4-Qubit ZZFeatureMap & fidelity kernel QSVR
│   └── recommender.py          # Constrained N-P-K & irrigation optimizer
├── data/                       # Biophysical dataset generation & quantum scaling
│   └── generator.py            # Mitscherlich-Baule crop response generator
├── database/                   # Database schemas & isolated seeds
│   └── seeds/
│       └── dev/
│           └── dev_seed.sql    # Development-only sandbox seed script
├── docs/                       # Comprehensive technical documentation
│   ├── api/                    # API endpoints reference guide
│   ├── architecture/           # Full-stack architectural breakdown
│   ├── data/                   # Ground-truth & satellite data documentation
│   ├── deployment/             # Docker Compose & Supabase cloud guide
│   ├── development/            # Local developer onboarding manual
│   ├── ml/                     # Classical ML benchmarking methodology
│   └── quantum/                # 4-Qubit QSVR formulation & phase scaling
├── frontend/                   # Next.js 16 Enterprise Web Frontend (:3000)
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Control Center, Farms, Predict, Weather, Twin, etc.
│   │   ├── login/              # Dynamic authentication & sign-up
│   │   ├── layout.tsx          # Inter & Geist font system layout
│   │   └── page.tsx            # Precision agritech landing page
│   ├── components/             # Sidebar, Navbar, MapComponent, Timeline, Modals
│   ├── lib/                    # API client, AuthContext, FarmContext
│   └── public/                 # Static vector assets and icons
├── scripts/                    # Operational & verification utilities
│   └── verify_system.py        # Production health & test verification script
├── tests/                      # Automated test suite (59 unit & integration tests)
│   ├── test_api_v1.py
│   ├── test_database.py
│   ├── test_decision_intelligence.py
│   ├── test_engine.py
│   ├── test_farm_crud_and_data.py
│   ├── test_model_benchmarks.py
│   ├── test_personalized_farm_flow.py
│   ├── test_supabase.py
│   └── test_weather_visual_crossing.py
├── app.py                      # Streamlit internal research console (:8501)
├── docker-compose.yml          # Multi-container containerized orchestration
├── requirements.txt            # Production Python package dependencies
├── supabase_schema.sql         # Production PostgreSQL table DDL & RLS policies
└── README.md                   # Enterprise architecture and operations manual
```

---

## 10. Scientific & Quantum Methodology

### Parameterized Quantum State Representation
For continuous input measurements $\vec{x} = [x_1, x_2, x_3, x_4] \in \mathbb{R}^4$ representing Soil Nitrogen, Soil Moisture, Cumulative Rainfall, and Sentinel NDVI:

$$|\Phi(\vec{x})\rangle = U_{\Phi(\vec{x})} |0\rangle^{\otimes 4}$$

The second-order Pauli-Z evolution unitary operator is parameterized with harmonic phase scaling $\alpha = 0.1$:

$$U_{\Phi(\vec{x})} = \left( \exp\left(i \sum_{j=1}^4 0.1 x_j Z_j + \sum_{j=1}^4 \sum_{k > j} 0.1 (\pi - x_j)(\pi - x_k) Z_j Z_k\right) H^{\otimes 4} \right)^2$$

### Quantum Transition Fidelity Kernel
The quantum kernel measures similarity between farm observations via state overlap fidelity in 16-dimensional Hilbert space:

$$K(\vec{x}_i, \vec{x}_j) = |\langle \Phi(\vec{x}_i) | \Phi(\vec{x}_j) \rangle|^2$$

This kernel matrix is evaluated on Qiskit Aer and used directly in the dual quadratic optimization problem of Support Vector Regression (`QSVR`), capturing complex biophysical cross-couplings between climate and soil nutrients.

---

## 11. License & Citation

AgriQuantum is licensed under the [Apache License 2.0](LICENSE).
```bibtex
@software{agriquantum2026,
  title={AgriQuantum: Precision Agriculture Intelligence Platform},
  author={Yaswanth Jyothula},
  year={2026},
  url={https://github.com/yaswanthjyothula/fallfest}
}
```