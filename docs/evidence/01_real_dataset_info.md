# Evidence Item 01: Agronomic Benchmark Dataset Specification

## Dataset Overview
- **Identifier**: `agri-benchmark-dataset-v2.4-calibrated`
- **Source File**: `data/agri_benchmark_dataset_v2.csv`
- **Total Samples**: 140 agricultural plots
- **Train / Test Split**: 75% train (105 plots), 25% test (35 plots)
- **Target Variable**: `yield_quintals` (Quintals / Acre, where 1 Quintal = 100 kg)
- **Mean Harvest Target**: 37.8 Q/acre (Range: 15.0 to 48.0 Q/acre)
- **Missing Value Policy**: Zero imputation; all sensor and meteorological features are completely observed.

## Feature Schema
| Feature | Agronomic Role | Physical Range | Hilbert Space Mapping |
|---|---|---|---|
| `soil_nitrogen` | Primary vegetative macronutrient (N) | 25.0 – 150.0 kg/ha | Scaled to $[0, 2\pi]$ on Qubit 0 |
| `soil_moisture` | Root-zone volumetric water content | 16.0% – 42.0% | Scaled to $[0, 2\pi]$ on Qubit 1 |
| `rainfall` | Cumulative growing season precipitation | 50.0 – 310.0 mm | Scaled to $[0, 2\pi]$ on Qubit 2 |
| `ndvi` | Sentinel-2 canopy photosynthetic vigor | 0.22 – 0.86 | Scaled to $[0, 2\pi]$ on Qubit 3 |

## Data Leakage Safeguards
- Preprocessing scalers (`StandardScaler` for classical models, `MinMaxScaler` for Quantum SVR) are strictly fitted on the training split only and transformed onto the holdout test set.
