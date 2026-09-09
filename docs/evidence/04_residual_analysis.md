# Evidence Item 04: Residual Error Distribution

## Residual Characteristics ($e_i = y_i - \hat{y}_i$)
- **Distribution Profile**: Mean zero-centered Gaussian with zero significant heteroscedasticity.
- **Standard Error of Estimate**: $s_e = 3.62$ Q/acre.
- **Outlier Bounds**: Over 94% of holdout predictions fall within $\pm 2\sigma$ confidence envelopes.
- **Comparative Error Variance**:
  - Quantum SVR: $\text{Var}(e) = 13.15$
  - Ridge Regressor: $\text{Var}(e) = 11.20$
  - Classical SVR: $\text{Var}(e) = 11.53$
