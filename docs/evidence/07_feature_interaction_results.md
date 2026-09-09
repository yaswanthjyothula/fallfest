# Evidence Item 07: Agronomic Feature Interaction Analysis

## Measured Agronomic Correlations with Yield
| Feature Interaction Pair | Correlation with Yield ($r$) | Empirical Significance | Quantum Encoding Role |
|---|---|---|---|
| **N x Moisture (Water-Nitrogen Co-limitation)** | +0.7403 | High | Directly encoded into 2-qubit ZZ entangling phase gates |
| **N x P (Liebig Stoichiometry)** | +0.5164 | High | Directly encoded into 2-qubit ZZ entangling phase gates |
| **N x K (Osmotic Buffer)** | +0.5444 | High | Directly encoded into 2-qubit ZZ entangling phase gates |
| **Rainfall x Temperature (Evaporative Index)** | -0.0359 | Low | Directly encoded into 2-qubit ZZ entangling phase gates |
| **NDVI x Moisture (Canopy Transpiration)** | +0.5087 | High | Directly encoded into 2-qubit ZZ entangling phase gates |


### Takeaway
The strongest interaction affecting crop yield is **Water-Nitrogen Co-limitation** ($r = +0.7403$). The two-qubit entangling $R_{ZZ}$ gate on $(q_0, q_1)$ directly models this cross-term in Hilbert space without requiring manual polynomial feature expansion.
