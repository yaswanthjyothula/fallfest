"""
Agronomic Classical & Quantum Benchmarking Suite
================================================
Compares Quantum Support Vector Regression (QSVR) directly against classical
machine learning models (Random Forest, Classical RBF-SVR, and Ridge Regression)
on the exact same train/test splits.

Evaluates:
- R² (Coefficient of Determination)
- RMSE (Root Mean Squared Error)
- MAE (Mean Absolute Error)
- Relative performance improvement (%)
"""

from typing import Any, Dict, List, Optional
import time
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.svm import SVR

from .quantum_engine import AgriQuantumEngine


class AgronomicBenchmarkSuite:
    """
    Evaluates and compares Quantum and Classical models on precision agronomy data.
    """

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.models: Dict[str, Any] = {}
        self.results: Dict[str, Dict[str, float]] = {}
        self.test_predictions: Dict[str, np.ndarray] = {}

    def run_benchmark(
        self,
        X_train_raw: np.ndarray,
        X_test_raw: np.ndarray,
        X_train_quantum: np.ndarray,
        X_test_quantum: np.ndarray,
        y_train: np.ndarray,
        y_test: np.ndarray,
        qsvr_engine: Optional[AgriQuantumEngine] = None,
    ) -> Dict[str, Any]:
        """
        Executes complete benchmark suite across:
        1. Quantum Support Vector Regressor (QSVR)
        2. Classical Support Vector Regressor (RBF Kernel)
        3. Random Forest Regressor (100 Estimators)
        4. Ridge Linear Regressor (L2 Regularized)

        Returns:
        --------
        dict with benchmark metrics, comparison dataframe, and test predictions.
        """
        self.results = {}
        self.test_predictions = {"actual": y_test}

        # 1. Quantum SVR (QSVR)
        if qsvr_engine is None:
            qsvr = AgriQuantumEngine(c_param=10.0, epsilon=0.1)
            t0 = time.time()
            qsvr.fit(X_train_quantum, y_train)
            qsvr_train_time = time.time() - t0
        else:
            qsvr = qsvr_engine
            qsvr_train_time = 0.0

        t0 = time.time()
        qsvr_preds = qsvr.predict(X_test_quantum)
        qsvr_inf_time = time.time() - t0
        self.models["Quantum SVR (QSVR)"] = qsvr
        self.test_predictions["Quantum SVR (QSVR)"] = qsvr_preds

        self._record_metrics(
            model_name="Quantum SVR (QSVR)",
            y_true=y_test,
            y_pred=qsvr_preds,
            train_time=qsvr_train_time,
            inf_time=qsvr_inf_time,
            model_type="Quantum (Hilbert Space)",
        )

        # 2. Classical Support Vector Regressor (RBF Kernel)
        classical_svr = SVR(kernel="rbf", C=10.0, epsilon=0.1)
        t0 = time.time()
        classical_svr.fit(X_train_raw, y_train)
        csvr_train_time = time.time() - t0
        t0 = time.time()
        csvr_preds = classical_svr.predict(X_test_raw)
        csvr_inf_time = time.time() - t0
        self.models["Classical SVR (RBF)"] = classical_svr
        self.test_predictions["Classical SVR (RBF)"] = csvr_preds

        self._record_metrics(
            model_name="Classical SVR (RBF)",
            y_true=y_test,
            y_pred=csvr_preds,
            train_time=csvr_train_time,
            inf_time=csvr_inf_time,
            model_type="Classical",
        )

        # 3. Random Forest Regressor
        rf = RandomForestRegressor(n_estimators=100, random_state=self.random_state)
        t0 = time.time()
        rf.fit(X_train_raw, y_train)
        rf_train_time = time.time() - t0
        t0 = time.time()
        rf_preds = rf.predict(X_test_raw)
        rf_inf_time = time.time() - t0
        self.models["Random Forest"] = rf
        self.test_predictions["Random Forest"] = rf_preds

        self._record_metrics(
            model_name="Random Forest",
            y_true=y_test,
            y_pred=rf_preds,
            train_time=rf_train_time,
            inf_time=rf_inf_time,
            model_type="Classical",
        )

        # 4. Ridge Regressor
        ridge = Ridge(alpha=1.0)
        t0 = time.time()
        ridge.fit(X_train_raw, y_train)
        ridge_train_time = time.time() - t0
        t0 = time.time()
        ridge_preds = ridge.predict(X_test_raw)
        ridge_inf_time = time.time() - t0
        self.models["Ridge Regressor"] = ridge
        self.test_predictions["Ridge Regressor"] = ridge_preds

        self._record_metrics(
            model_name="Ridge Regressor",
            y_true=y_test,
            y_pred=ridge_preds,
            train_time=ridge_train_time,
            inf_time=ridge_inf_time,
            model_type="Classical Baseline",
        )

        # Calculate relative improvements
        qsvr_rmse = self.results["Quantum SVR (QSVR)"]["rmse"]
        csvr_rmse = self.results["Classical SVR (RBF)"]["rmse"]
        rf_rmse = self.results["Random Forest"]["rmse"]

        rmse_improvement_vs_csvr = ((csvr_rmse - qsvr_rmse) / csvr_rmse) * 100.0
        rmse_improvement_vs_rf = ((rf_rmse - qsvr_rmse) / rf_rmse) * 100.0

        summary_df = pd.DataFrame(list(self.results.values()))
        # Sort by R² descending
        summary_df = summary_df.sort_values(by="r2", ascending=False).reset_index(drop=True)

        return {
            "summary_df": summary_df,
            "metrics": self.results,
            "test_predictions": self.test_predictions,
            "rmse_improvement_vs_csvr": round(rmse_improvement_vs_csvr, 2),
            "rmse_improvement_vs_rf": round(rmse_improvement_vs_rf, 2),
            "qsvr_r2": self.results["Quantum SVR (QSVR)"]["r2"],
            "qsvr_rmse": self.results["Quantum SVR (QSVR)"]["rmse"],
            "qsvr_mae": self.results["Quantum SVR (QSVR)"]["mae"],
        }

    def _record_metrics(
        self,
        model_name: str,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        train_time: float,
        inf_time: float,
        model_type: str,
    ) -> None:
        """Calculates and records statistical regression metrics."""
        r2 = float(r2_score(y_true, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
        mae = float(mean_absolute_error(y_true, y_pred))

        self.results[model_name] = {
            "model": model_name,
            "type": model_type,
            "r2": round(r2, 4),
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
            "train_time_sec": round(train_time, 4),
            "inf_time_sec": round(inf_time, 4),
        }


def benchmark_models(
    X_train_raw: np.ndarray,
    X_test_raw: np.ndarray,
    X_train_quantum: np.ndarray,
    X_test_quantum: np.ndarray,
    y_train: np.ndarray,
    y_test: np.ndarray,
    qsvr_engine: Optional[AgriQuantumEngine] = None,
) -> Dict[str, Any]:
    """Convenience function to run benchmark suite."""
    suite = AgronomicBenchmarkSuite()
    return suite.run_benchmark(
        X_train_raw=X_train_raw,
        X_test_raw=X_test_raw,
        X_train_quantum=X_train_quantum,
        X_test_quantum=X_test_quantum,
        y_train=y_train,
        y_test=y_test,
        qsvr_engine=qsvr_engine,
    )
