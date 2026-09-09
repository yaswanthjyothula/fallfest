# Biophysical & Agro-Meteorological Data Sources

AgriQuantum combines ground-truth farmer observations with live atmospheric and satellite remote sensing.

---

## 1. Ground-Truth Farmer Inputs

Collected directly via the Farm Setup form or IoT in-situ sensors:

| Feature | Agronomic Role | Range | Typical Units |
| :--- | :--- | :--- | :--- |
| **Nitrogen (N)** | Primary vegetative macro-nutrient for chlorophyll synthesis | $0 - 300$ | kg/ha |
| **Phosphorus (P)** | Macro-nutrient driving root establishment and flowering | $0 - 150$ | kg/ha |
| **Potassium (K)** | Macro-nutrient regulating stomatal conductance and water uptake | $0 - 300$ | kg/ha |
| **Soil pH** | Acidity/alkalinity governing nutrient bioavailability | $3.5 - 10.0$ | pH scale |
| **Soil Moisture** | Volumetric water content in topsoil root zone ($0-30\text{ cm}$) | $0 - 100$ | % volumetric |
| **Soil Texture** | Physical texture classification (Loam, Clay, Sand, Black Cotton) | Categorical | Classification |

---

## 2. Weather Data: Visual Crossing Weather Timeline API

AgriQuantum interfaces with Visual Crossing's global meteorological services:
- **Real-Time Observations**: Ambient 2m temperature, relative humidity, current precipitation, wind speed, solar radiation, and dew point.
- **7-Day Agricultural Forecast**: Daily maximum/minimum temperature envelopes, precipitation probability, and expected evaporative demand.
- **7-Day Historical Trajectory**: Rolling precipitation sum used to evaluate short-term drought or waterlogging stress.
- **Caching Layer**: In-memory 1-hour TTL cache indexed by `(round(lat, 3), round(lon, 3))` to respect API quotas while providing instant response times.
- **Graceful Fallback**: In the event of API key exhaustion or network timeouts, transitions seamlessly to calibrated regional open-access agro-climatic envelopes.

---

## 3. Satellite Remote Sensing: Copernicus Sentinel-2 L2A

Multispectral imagery from the European Space Agency (ESA) Copernicus constellation:
- **Instrument**: MultiSpectral Instrument (MSI) aboard Sentinel-2A and Sentinel-2B.
- **Spatial Resolution**: 10 meters per pixel for Band 4 (Red, 665 nm) and Band 8 (Near-Infrared / NIR, 842 nm).
- **Temporal Resolution**: 5-day orbital revisit frequency.
- **NDVI Calculation**:
  $$\text{NDVI} = \frac{\rho_{\text{NIR}} - \rho_{\text{Red}}}{\rho_{\text{NIR}} + \rho_{\text{Red}}} = \frac{\text{B08} - \text{B04}}{\text{B08} + \text{B04}}$$
- **Agronomic Interpretation**:
  - $\text{NDVI} < 0.20$: Bare soil, rock, or dormant stubble.
  - $0.20 \le \text{NDVI} < 0.40$: Sparse or stressed early canopy.
  - $0.40 \le \text{NDVI} < 0.65$: Moderate vegetative growth.
  - $\text{NDVI} \ge 0.65$: Dense, photosynthetically active healthy canopy.
