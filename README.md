# AgriQuantum: Precision Agriculture Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.136.1-009688?logo=fastapi&logoColor=white)](http://localhost:8000/docs)
[![Qiskit](https://img.shields.io/badge/Qiskit-2.x%20%7C%201.x-138A4B?logo=qiskit&logoColor=white)](https://qiskit.org/)
[![Qiskit Aer](https://img.shields.io/badge/Qiskit%20Aer-Statevector%20Simulator-075B35)](https://github.com/Qiskit/qiskit-aer)
[![IBM Quantum](https://img.shields.io/badge/IBM%20Quantum-Fall%20Fest%202024-28B866)](https://ibm.biz/qiskit-fall-fest)
[![Centurion University](https://img.shields.io/badge/Hackathon-Centurion%20University%202026-138A4B)](https://cutm.ac.in)
[![Design System](https://img.shields.io/badge/Brand%20Design-White%20%2B%20Green-138A4B)](#2-brand-color-system-and-typography)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

> **Platform Overview**: Commercial grade agritech platform engineered for researchers, farmers, agronomists, investors, and technical evaluators.  
> **Brand Palette**: Professional White and Green identity (`#138A4B`, `#075B35`, `#28B866`, `#E8F6EE`, `#F4FAF6`, `#FFFFFF`, `#F7F9F8`).  
> **Typography**: 'Plus Jakarta Sans', Inter clean modern typography.  
> **Architecture**: Dual engine platform featuring a **Streamlit Web Application** (`:8501`) and a **FastAPI REST Backend** (`:8000`).

---

## 1. Executive Summary

Modern agriculture is data rich, yet critical agronomic decisions remain constrained by complex interactions between soil, weather, and crop factors:
- **Soil Conditions**: Nitrogen, Phosphorus, Potassium (N-P-K), pH, and Volumetric Soil Moisture.
- **Weather Conditions**: Cumulative Rainfall and Ambient Temperature.
- **Crop Health**: Sentinel-2 Multispectral Normalized Difference Vegetation Index (NDVI).

**AgriQuantum** transforms agricultural observations into a quantum format so the model can identify complex relationships across field conditions. By evaluating quantum state transition fidelities ($K(x_i, x_j) = |\langle \Phi(x_i) | \Phi(x_j) \rangle|^2$), AgriQuantum trains a Quantum Support Vector Regressor (`QSVR`) that accurately estimates expected crop production and powers practical fertilizer and irrigation recommendations.

---

## 2. Brand Color System and Typography

The design follows a **75% White/Neutral, 20% Green, 5% Supporting** visual ratio:

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| **Primary Green** | `#138A4B` | Main brand accent, primary buttons, active state highlights |
| **Deep Green** | `#075B35` | Major titles, brand logo, strong typographical contrast |
| **Accent Green** | `#28B866` | Live status pulse, positive indicators, hover accents |
| **Soft Green** | `#E8F6EE` | Active navigation pill, badge fills, highlight card surfaces |
| **Pale Green** | `#F4FAF6` | Alert containers, subtle card backgrounds |
| **White** | `#FFFFFF` | Cards, persistent sidebar, elevated panels |
| **Main Background**| `#F7F9F8` | Clean, spacious application canvas |
| **Primary Text** | `#15231B` | High contrast body text and headers |
| **Secondary Text** | `#68756E` | Explanations, labels, secondary metrics |
| **Border** | `#DFE8E2` | 1px clean card and divider strokes |
| **Typography** | `'Plus Jakarta Sans', Inter, sans-serif` | Clean, modern, highly legible |

---

## 3. Full Stack Architecture

AgriQuantum operates as a complete full stack agritech platform:

```
fallfest/
├── assets/
│   └── hero_agriculture.jpg    # High resolution aerial drone agriculture photography
├── backend/
│   ├── __init__.py
│   └── api.py                  # FastAPI REST API exposing 9 endpoints on port 8000
├── core/
│   ├── __init__.py
│   ├── quantum_engine.py       # 4 Qubit ZZFeatureMap (reps=2, linear) and precomputed QSVR
│   ├── benchmark.py           # QSVR vs Random Forest vs Classical SVR vs Ridge Regression
│   └── recommender.py         # Constrained N-P-K and irrigation optimizer
├── data/
│   ├── __init__.py
│   └── generator.py           # Agronomic biophysical model and [0, 2π] quantum scaler
├── tests/
│   └── test_engine.py          # Complete unit and integration test suite (6 tests passing)
├── app.py                      # Streamlit web application on port 8501
└── README.md                   # Platform documentation and API schema
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

---

## 6. Mathematical and Quantum Formulation

### 6.1 4 Qubit Parameterized Quantum Feature Map
Continuous agronomic drivers $\vec{x} \in [0, 2\pi]^4$ are mapped into quantum states:

$$|\Phi(\vec{x})\rangle = U_{\Phi(\vec{x})} |0\rangle^{\otimes 4}$$

$$U_{\Phi(\vec{x})} = \left( \exp\left(i \sum_{j=1}^4 x_j Z_j + \sum_{j=1}^3 (\pi - x_j)(\pi - x_{j+1}) Z_j Z_{j+1}\right) H^{\otimes 4} \right)^2$$

- **Qubits**: 4 (`soil_nitrogen`, `soil_moisture`, `rainfall`, `ndvi`)
- **Circuit Depth**: 19
- **Entangling Gates**: 12 CNOT gates capturing non-linear cross feature interactions

### 6.2 Quantum Kernel Gram Matrix
Transition fidelity between quantum states:

$$K(\vec{x}_i, \vec{x}_j) = |\langle \Phi(\vec{x}_i) | \Phi(\vec{x}_j) \rangle|^2$$

---

## 7. Quickstart Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Test Suite
```bash
python -m unittest tests/test_engine.py
```
*Result*: `Ran 6 tests in 1.12s. OK`

### 3. Launch Services
- **Streamlit Web Application**:
  ```bash
  python -m streamlit run app.py --server.port 8501
  ```
  Open **`http://localhost:8501`** in your browser.
- **FastAPI REST Service**:
  ```bash
  python -m uvicorn backend.api:app --host 0.0.0.0 --port 8000
  ```
  Open **`http://localhost:8000/docs`** for interactive Swagger API documentation.