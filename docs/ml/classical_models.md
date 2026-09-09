# Classical Machine Learning & Benchmarking Methodology

## 1. Zero Data Leakage Evaluation Pipeline

AgriQuantum rigorously prevents data leakage across training and test splits:
1. **Holdout Split**: Raw continuous observations are partitioned into an 80% training set ($X_{\text{train\_raw}}, y_{\text{train}}$) and a 20% validation set ($X_{\text{test\_raw}}, y_{\text{test}}$) using a fixed random seed (`random_state=42`).
2. **Train-Only Preprocessing**: `StandardScaler` is fitted strictly on $X_{\text{train\_raw}}$. Downstream test data $X_{\text{test\_raw}}$ is transformed using the fitted scaler's mean and variance without refitting.
3. **Identical Partitions**: All 4 model architectures are evaluated on the exact same holdout split to guarantee scientific fairness.

---

## 2. Compared Architectures

1. **Random Forest Regressor** (`Scikit-Learn`):
   - Ensembles 100 decorrelated decision trees.
   - Captures non-linear thresholds and feature interaction splits.
2. **Quantum Support Vector Regressor (`QSVR`)** (`Qiskit Aer` + `Scikit-Learn`):
   - 4-qubit parameterized feature map projecting into 16-dimensional Hilbert space.
   - Dual quadratic optimization over the quantum fidelity Gram matrix.
3. **Classical SVR with RBF Kernel** (`Scikit-Learn`):
   - Infinite-dimensional Gaussian radial basis function: $K(\vec{x}_i, \vec{x}_j) = \exp(-\gamma \|\vec{x}_i - \vec{x}_j\|^2)$.
4. **Ridge Regressor** (`Scikit-Learn`):
   - L2 regularized linear regression baseline demonstrating linear model underfitting on non-linear agronomic dynamics.

---

## 3. Evaluation Metrics

- **Coefficient of Determination ($R^2$)**:
  $$R^2 = 1 - \frac{\sum_{i=1}^n (y_i - \hat{y}_i)^2}{\sum_{i=1}^n (y_i - \bar{y})^2}$$
- **Root Mean Squared Error (RMSE)** (Quintals/acre):
  $$\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^n (y_i - \hat{y}_i)^2}$$
- **Mean Absolute Error (MAE)** (Quintals/acre):
  $$\text{MAE} = \frac{1}{n} \sum_{i=1}^n |y_i - \hat{y}_i|$$
- **Mean Absolute Percentage Error (MAPE)**:
  $$\text{MAPE} = \frac{100\%}{n} \sum_{i=1}^n \left|\frac{y_i - \hat{y}_i}{y_i}\right|$$

---

## 4. Benchmark Results Summary

| Model Name | Paradigm | $R^2$ Score | RMSE (Q/ac) | MAE (Q/ac) | MAPE (%) | Inference Latency |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest** | Classical Ensemble | **0.5880** | **2.807** | **2.089** | 5.2% | 8.6 ms |
| **Quantum SVR (QSVR)** | Quantum Kernel ML | **0.4571** | **3.222** | **2.495** | 6.3% | 170.4 ms |
| **Classical SVR (RBF)** | Classical Kernel | **0.4458** | **3.256** | **2.355** | 5.9% | 0.6 ms |
| **Ridge Regression** | Classical Linear | **0.2956** | **3.671** | **2.936** | 7.4% | 0.2 ms |
