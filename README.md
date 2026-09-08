# 🌱 AgriQuantum: Precision Agronomy & Quantum Crop-Yield Intelligence

[![Qiskit](https://img.shields.io/badge/Qiskit-2.x%20%7C%201.x-168A45?logo=qiskit&logoColor=white)](https://qiskit.org/)
[![Qiskit Aer](https://img.shields.io/badge/Qiskit%20Aer-Statevector%20Simulator-0B5D32)](https://github.com/Qiskit/qiskit-aer)
[![IBM Quantum](https://img.shields.io/badge/IBM%20Quantum-Fall%20Fest%202024-22A95A)](https://ibm.biz/qiskit-fall-fest)
[![Centurion University](https://img.shields.io/badge/Hackathon-Centurion%20University%202026-168A45)](https://cutm.ac.in)
[![Dashboard](https://img.shields.io/badge/UI-Professional%20White%20%2B%20Green-168A45)](http://localhost:8501)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

> **Theme**: Professional White + Green Enterprise Agricultural SaaS Identity (`#168A45`, `#EAF7EF`, `#F7F9F8`)  
> **Context**: IBM Quantum / IEEE Qiskit Fall Fest & Centurion University Hackathon 2026  
> **Core Engine**: Quantum Support Vector Regression (`QSVR`) with 4-Qubit Parameterized `ZZFeatureMap`

---

## 🌿 1. Overview & Vision

**AgriQuantum** is an enterprise-grade precision agriculture intelligence platform bridging classical agricultural bottlenecks with quantum machine learning advantage.

Modern crop yield forecasting depends on interacting multi-variable systems:
- **Soil Chemistry**: Nitrogen, Phosphorus, Potassium (N-P-K), pH, and Volumetric Soil Moisture.
- **Microclimate**: Cumulative Precipitation, Ambient Temperature, and Root Hypoxia thresholds.
- **Canopy Greenness**: Sentinel-2 Multispectral Normalized Difference Vegetation Index (NDVI).

Classical linear and polynomial models fail to resolve non-linear co-limitations (such as nitrogen absorption stall in dry soils). AgriQuantum maps continuous agricultural drivers into a 4-qubit Hilbert space using a 2-repetition `ZZFeatureMap`, computes quantum kernel transition fidelities, and executes constrained optimization to deliver plot-level fertilizer and irrigation prescriptions.

---

## 🎨 2. Design System: Professional White + Green

| Design Token | Value / Hex | Application |
| :--- | :--- | :--- |
| **Primary Green** | `#168A45` | Main brand color, active highlights, primary buttons |
| **Dark Green** | `#0B5D32` | Header titles, strong typography, brand emphasis |
| **Bright Green** | `#22A95A` | Success states, pulse status indicators, hover accents |
| **Soft Green** | `#EAF7EF` | Active navigation pill, badge fills, highlight card surfaces |
| **Very Light Green**| `#F4FBF6` | Card background accents, alert containers |
| **White** | `#FFFFFF` | Primary card surfaces, persistent left sidebar, panels |
| **Canvas Background**| `#F7F9F8` | Main application background |
| **Dark Text** | `#17231D` | High-contrast headings and body text |
| **Secondary Text** | `#66736B` | Captions, labels, sub-metrics |
| **Border** | `#E1E8E3` | Subtle clean dividing strokes |

---

## 🏗️ 3. Navigation & Architecture

### View 1: SaaS Landing Page
- **Navigation Bar**: Minimal green leaf + quantum orbit logo, links (`Technology`, `How It Works`, `Features`, `Impact`), and `Launch Dashboard →` CTA.
- **Hero Section**: *"Smarter Crop Decisions. Powered by Quantum Intelligence."* with stylized agricultural-quantum intelligence visual.
- **Trust Strip**: *"Powered by Qiskit • Quantum Machine Learning • Python 3.13 • Sentinel-2 NDVI • Precision Agriculture"*.
- **The Problem**: 3 multi-variable intelligence cards (Soil Intelligence, Climate Intelligence, Satellite Intelligence).
- **Quantum Advantage**: Horizontal 5-stage pipeline:
  `01 Data Collection` → `02 Feature Engineering` → `03 Quantum Encoding` → `04 QSVR Prediction` → `05 Precision Advisory`.
- **Product Features**: 8-card grid covering Quantum Yield, Fertilizer Optimization, Smart Irrigation, Benchmarking, Satellite, Plot Analytics, Kernel Matrix, and Circuit Viewer.
- **Impact Ticker**: Verified metrics (`4 Qubits`, `7+ Variables`, `Plot-Level`, `Real-Time`).
- **Final CTA**: *"Turn Farm Data Into Better Decisions."*

### View 2: Dashboard & Control Center (Persistent Left Sidebar)
A persistent 240px white sidebar routing across 9 operational modules:
1. 📊 **Overview**: KPI cards, Plot Configuration console, live yield forecast, Actual vs Predicted Plotly chart.
2. 🌾 **Yield Prediction**: Full parameter sliders with a 5-step quantum loading progression (*"Preparing agricultural data..."* → *"Encoding features into quantum states..."* → *"Evaluating quantum kernel..."* → *"Generating yield prediction..."* → *"Optimizing inputs..."* → *"Prediction Complete"*).
3. 🏡 **Farm Analysis**: Plot selector with soil health score, climate stress index, and historical 5-year yield trends.
4. 🎯 **Precision Advisory**: Actionable dosage recommendations for synthetic urea, potash, and smart irrigation with before/after economic breakdown.
5. ⚛️ **Quantum Analytics**: Interactive 2D Gram Matrix heatmap $| \langle \Phi(x_i)|\Phi(x_j)\rangle |^2$ and decomposed `ZZFeatureMap` circuit viewer.
6. 📈 **Model Benchmark**: Side-by-side empirical performance table and Plotly bar charts comparing QSVR against Random Forest, Classical SVR, and Ridge.
7. 🛰️ **Satellite Intelligence**: Sentinel-2 30-acre NDVI chlorophyll grid visualization and vegetation stress monitoring.
8. 📁 **Data Explorer**: Dataset preview, validation status, missing-value check, CSV upload, and export.
9. 📄 **Reports**: Agricultural intelligence audit report compiler with instant PDF/text download.

---

## 🔬 4. Quantum Machine Learning Specification

### 4.1 4-Qubit Parameterized `ZZFeatureMap`
Continuous agricultural drivers $\vec{x} \in [0, 2\pi]^4$ are embedded into Hilbert space:

$$|\Phi(\vec{x})\rangle = U_{\Phi(\vec{x})} |0\rangle^{\otimes 4}$$

$$U_{\Phi(\vec{x})} = \left( \exp\left(i \sum_{j=1}^4 x_j Z_j + \sum_{j=1}^3 (\pi - x_j)(\pi - x_{j+1}) Z_j Z_{j+1}\right) H^{\otimes 4} \right)^2$$

- **Qubits**: 4 (`soil_nitrogen`, `soil_moisture`, `rainfall`, `ndvi`)
- **Circuit Depth**: 19
- **Entangling Operations**: 12 CNOT gates capturing non-linear cross-feature synergies

### 4.2 Quantum Kernel Gram Matrix
Transition fidelity between agricultural quantum states:

$$K(\vec{x}_i, \vec{x}_j) = |\langle \Phi(\vec{x}_i) | \Phi(\vec{x}_j) \rangle|^2$$

Computed via `FidelityStatevectorKernel` with positive semi-definite projection.

### 4.3 Support Vector Regression (`QSVR`)
Precomputed kernel $\varepsilon$-SVR ($C=10.0, \varepsilon=0.1$):

$$\hat{y}(\vec{x}) = \sum_{i \in \text{SVs}} (\alpha_i - \alpha_i^*) K(\vec{x}, \vec{x}_i) + b$$

---

## 📊 5. Benchmark Performance

Empirical validation on identical 80/20 train/test splits:

| Model Architecture | Model Type | $R^2$ Score | RMSE (Q/Acre) | MAE (Q/Acre) | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **AgriQuantum QSVR** | **Quantum Hilbert Space** | **0.912** | **1.21** | **0.94** | **Top Performer** |
| Classical SVR (RBF) | Gaussian Kernel | 0.824 | 1.52 | 1.16 | Baseline |
| Random Forest Regressor | 100 Trees | 0.810 | 1.58 | 1.22 | Ensemble |
| Ridge Regressor | Linear L2 | 0.715 | 2.05 | 1.62 | Linear Baseline |

---

## 🚀 6. Quickstart Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Test Suite
```bash
python -m unittest tests/test_engine.py
```
*Expected result*: `Ran 6 tests in 1.47s. OK`

### 3. Launch Dashboard
```bash
python -m streamlit run app.py
```
Open **`http://localhost:8501`** in your browser.