# AgriQuantum Architecture & System Overview

## 1. High-Level Architectural Paradigm

AgriQuantum is engineered as a decoupled, multi-tier precision agriculture intelligence platform. It ingests continuous biophysical agricultural observations from the farm holder, enriches them with real-time geospatial meteorology and multispectral satellite telemetry, executes 4-qubit Quantum Support Vector Regression (`QSVR`) and classical machine learning ensembles, assesses 5-factor agro-climatic risk, and delivers personalized fertilizer and irrigation optimization plans.

```
┌────────────────────────────────────────────────────────────────────────┐
│               AgriQuantum Web Application (Next.js 16)                │
│             TailwindCSS • ECharts • MapLibre GL • Client State         │
│                           http://localhost:3000                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             FastAPI Production REST Gateway (Python 3.13)              │
│       JWT Auth • OpenAPI 3.1 • Rate Limiting • CORS Middleware         │
│                           http://localhost:8000                        │
└───────┬──────────────┬──────────────┬──────────────┬───────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌────────────────────────┐
│  Supabase /  ││VisualCrossing││  Copernicus  ││ Quantum & ML Engines   │
│  PostgreSQL  ││ Weather API  ││ Sentinel-2   ││ Qiskit 2.x • Aer       │
│  Database    ││ (1h Cache)   ││ L2A Surface  ││ Scikit-Learn (SVR, RF) │
└──────────────┘└──────────────┘└──────────────┘└────────────────────────┘
        ▲
        │
┌───────┴────────────────────────────────────────────────────────────────┐
│             Streamlit Quantum Agronomy Research Terminal               │
│       Internal Research & Simulation Console (Python Native)           │
│                           http://localhost:8501                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Roles & Responsibilities

### A. Next.js 16 Frontend (`frontend/` on `:3000`)
- **Primary Farmer & Agronomist Interface**: Responsive, accessible web portal designed for mobile phones (360px) through desktop 4K displays.
- **Form-Driven Agricultural Workflow**: Multi-section farm onboarding form collecting farm boundary coordinates, crop varieties, and laboratory soil N-P-K assays.
- **Geospatial & Telemetry Visualization**: Interactive MapLibre GL field polygon maps, Sentinel-2 vegetation heatmaps, and Apache ECharts dual-axis weather progressions.
- **Zero Mock Fallbacks**: Empty-by-default architecture; unauthenticated or fresh users see clean onboarding states (*"Let's set up your farm"*) rather than fabricated mock data.

### B. FastAPI REST Production Gateway (`backend/` on `:8000`)
- **API Versioning**: All production endpoints are organized strictly under `/api/v1/`.
- **Data Isolation & Ownership**: Enforces user authentication and strict ownership verification on all farm records, field profiles, and predictive historical runs.
- **Asynchronous Telemetry Ingestion**: Concurrently queries Visual Crossing and Copernicus Sentinel-2 while maintaining fault-tolerant fallback mechanisms if external third-party quotas are exceeded.
- **ReportLab Certified PDF Engine**: Generates cryptographic SHA-256 sealed agronomic certificates for farm financing, crop insurance claims, and cooperative audits.

### C. Quantum Machine Learning Engine (`core/quantum_engine.py`)
- **4-Qubit Circuit Representation**: Maps 4 continuous agricultural drivers (Soil Nitrogen, Soil Moisture, Cumulative Rainfall, Sentinel NDVI) into quantum state transitions in Hilbert space ($2^4 = 16$ dimensions).
- **Quantum Kernel Evaluation**: Evaluates quantum transition fidelity $K(x_i, x_j) = |\langle \Phi(x_i) | \Phi(x_j) \rangle|^2$ using Qiskit Aer statevector simulation.
- **Phase Scaling**: Incorporates harmonic phase damping ($\alpha = 0.1$) to prevent chaotic phase wrap-around and preserve smooth biophysical crop response curves.

### D. Supabase / PostgreSQL Persistence (`backend/database.py`, `backend/models.py`)
- **Normalized Schema**: 15 relational tables covering `users`, `farms`, `fields`, `crops`, `soil_profiles`, `weather_observations`, `satellite_records`, `predictions`, `recommendations`, `risk_evaluations`, `scenarios`, `reports`, `harvest_results`, `model_benchmark_records`, and `audit_logs`.
- **Row-Level Security**: Isolates agricultural records so no user can access another grower's operational telemetry.
