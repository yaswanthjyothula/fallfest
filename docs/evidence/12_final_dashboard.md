# Evidence Item 12: Integrated Farm Intelligence Dashboard

## Full Pipeline Architecture
```text
  Postal PIN Code (e.g. 522001)
               │
               ▼
   Agro-Climatic Intelligence
   (Guntur, AP | Vertisol | 16 Crops)
               │
   ┌───────────┴───────────┐
   ▼                       ▼
Copernicus Sentinel-2   Visual Crossing Weather
(NDVI = 0.65)           (Temp = 28°C, Rain = 120mm)
   └───────────┬───────────┘
               │
               ▼
  Biophysical Feature Engineering
               │
     ┌─────────┴─────────┐
     ▼                   ▼
Classical Baselines    Quantum SVR (Qiskit Aer)
(RF / SVR / Ridge)     (4-Qubit ZZFeatureMap)
     └─────────┬─────────┘
               │
               ▼
   Empirical Evidence Center
   (R², RMSE, MAE, Scatter & Residuals)
               │
   ┌───────────┴───────────┐
   ▼                       ▼
What-If Scenario Lab   5-Factor Risk Radar
(Fertilizer/Water)     (Mitigation Actions)
   └───────────┬───────────┘
               │
               ▼
   Dual-Engine SQA Optimization
   (Maximum Yield / Balanced Plan)
```

## Scientific Truthfulness Guarantee
- **Simulator Labeling**: Always disclosed as *Qiskit Aer Quantum Simulation*.
- **Empirical Honesty**: Classical models are recognized when they outperform quantum models.
- **Zero Placeholder Data**: Fresh accounts begin with empty holdings and zero fabricated metrics.
