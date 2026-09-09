# AgriQuantum Environmental Joining Methodology

## Data Science Rule Compliance
As per specification Section 15:
- **Spatial Alignment:** Exact match on Indian State and District administrative boundary.
- **Temporal Alignment:** Exact match on the agricultural production year (2021 to 2022).
- **Phenological Alignment:** Exact match on the crop season envelope:
  - Kharif: Cumulative Southwest Monsoon rainfall (June-October) and summer mean temperature.
  - Rabi: Cumulative Northeast / Winter precipitation (November-April) and winter mean temperature.
  - Whole Year: 12-month annual cumulative precipitation and annual mean temperature for annual crops (Sugarcane).
- **Missing Data Handling:** If an observation lacks an aligned meteorological record, values are retained as `NULL` rather than synthesized.

## Summary
- Total Yield Records: 64
- Exactly Matched Weather Records: 64
- Unmatched Records (Set to NULL): 0
