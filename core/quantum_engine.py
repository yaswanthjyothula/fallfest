"""
Quantum Support Vector Regression Engine (QSVR)
================================================
Implements 4-qubit Quantum Machine Learning pipeline using Qiskit and
qiskit-machine-learning for precision agronomic crop-yield modeling.

Architecture:
1. Feature Map: 4-qubit ZZFeatureMap (reps=2, entanglement='linear')
   Encodes continuous agronomic features x in [0, 2π] into Hilbert state space |Φ(x)⟩.
   Applies single-qubit H & P gates and entangling ZZ gates:
   R_ZZ(θ_ij) = exp(i * (π - x_i)(π - x_j) * Z_i ⊗ Z_j)
2. Quantum Kernel Evaluation:
   Computes Gram matrix elements K_ij = |⟨Φ(x_i)|Φ(x_j)⟩|² using FidelityStatevectorKernel
   or FidelityQuantumKernel with ComputeUncompute.
3. Support Vector Regression:
   Precomputed kernel SVR (C=10.0, epsilon=0.1) trained on the quantum Gram matrix.
"""

from typing import Dict, List, Optional, Tuple, Union
import numpy as np
import warnings

# Suppress deprecation warnings from legacy qiskit circuit modules
warnings.filterwarnings("ignore", category=DeprecationWarning)

from qiskit import QuantumCircuit
try:
    from qiskit.circuit.library import zz_feature_map
    _HAS_ZZ_FUNC = True
except ImportError:
    _HAS_ZZ_FUNC = False

from qiskit.circuit.library import ZZFeatureMap
from qiskit_machine_learning.kernels import FidelityStatevectorKernel, FidelityQuantumKernel
from qiskit_machine_learning.state_fidelities import ComputeUncompute
from qiskit.primitives import StatevectorSampler
from sklearn.svm import SVR


class AgriQuantumEngine:
    """
    Precision Agronomy Quantum Kernel & Support Vector Regressor (QSVR).
    """

    def __init__(
        self,
        feature_dimension: int = 4,
        reps: int = 2,
        entanglement: str = "linear",
        c_param: float = 10.0,
        epsilon: float = 0.1,
        kernel_mode: str = "statevector",
        phase_scale: float = 0.1,
    ):
        """
        Initialize the Quantum Engine.

        Parameters:
        -----------
        feature_dimension : int
            Number of quantum features / qubits (default 4).
        reps : int
            Repetitions of the ZZFeatureMap ansatz (default 2).
        entanglement : str
            Entanglement connectivity ('linear', 'full', 'circular').
        c_param : float
            Regularization parameter C for SVR (default 10.0).
        epsilon : float
            Epsilon tube in ε-SVR loss function (default 0.1).
        kernel_mode : str
            'statevector' for ultra-fast exact statevector fidelity,
            or 'sampler' for primitive-based fidelity.
        phase_scale : float
            Harmonic phase scaling factor to map [0, 2π] feature bounds into optimal
            Hilbert space phase separation (default 0.1).
        """
        self.feature_dimension = feature_dimension
        self.reps = reps
        self.entanglement = entanglement
        self.c_param = c_param
        self.epsilon = epsilon
        self.kernel_mode = kernel_mode
        self.phase_scale = phase_scale

        # 1. Build the 4-Qubit ZZFeatureMap
        if _HAS_ZZ_FUNC:
            self.feature_map = zz_feature_map(
                feature_dimension=self.feature_dimension,
                reps=self.reps,
                entanglement=self.entanglement,
            )
        else:
            self.feature_map = ZZFeatureMap(
                feature_dimension=self.feature_dimension,
                reps=self.reps,
                entanglement=self.entanglement,
            )

        # 2. Build the Quantum Kernel evaluator
        if self.kernel_mode == "sampler":
            sampler = StatevectorSampler()
            fidelity = ComputeUncompute(sampler=sampler)
            self.kernel = FidelityQuantumKernel(
                feature_map=self.feature_map,
                fidelity=fidelity,
                enforce_psd=True,
            )
        else:
            self.kernel = FidelityStatevectorKernel(
                feature_map=self.feature_map,
                enforce_psd=True,
            )

        # 3. Initialize ε-SVR with precomputed kernel
        self.model = SVR(
            kernel="precomputed",
            C=self.c_param,
            epsilon=self.epsilon,
        )

        # State cache
        self.X_train: Optional[np.ndarray] = None
        self.y_train: Optional[np.ndarray] = None
        self.K_train: Optional[np.ndarray] = None
        self.is_fitted: bool = False

    def compute_gram_matrix(
        self,
        X1: np.ndarray,
        X2: Optional[np.ndarray] = None,
    ) -> np.ndarray:
        """
        Computes the Quantum Kernel Gram Matrix:
        K(x_i, x_j) = |⟨Φ(x_i)|Φ(x_j)⟩|²

        Parameters:
        -----------
        X1 : np.ndarray of shape (N1, 4), values in [0, 2π]
        X2 : Optional np.ndarray of shape (N2, 4), values in [0, 2π]

        Returns:
        --------
        np.ndarray of shape (N1, N2) or (N1, N1) if X2 is None
        """
        X1_arr = np.asarray(X1, dtype=np.float64) * self.phase_scale
        if X1_arr.ndim == 1:
            X1_arr = X1_arr.reshape(1, -1)

        if X2 is not None:
            X2_arr = np.asarray(X2, dtype=np.float64) * self.phase_scale
            if X2_arr.ndim == 1:
                X2_arr = X2_arr.reshape(1, -1)
            K = self.kernel.evaluate(X1_arr, X2_arr)
        else:
            K = self.kernel.evaluate(X1_arr)

        return np.asarray(K, dtype=np.float64)

    def evaluate_kernel(
        self,
        X1: np.ndarray,
        X2: Optional[np.ndarray] = None,
    ) -> np.ndarray:
        """
        Evaluates the Quantum Kernel Gram Matrix:
        K(x_i, x_j) = |⟨Φ(x_i)|Φ(x_j)⟩|²
        Alias for compute_gram_matrix for API compatibility.
        """
        return self.compute_gram_matrix(X1, X2)

    def fit(self, X_train: np.ndarray, y_train: np.ndarray) -> "AgriQuantumEngine":
        """
        Fits QSVR on the training data.

        Computes training Gram matrix K_train and optimizes dual coefficients
        α_i, α_i* for support vectors.
        """
        self.X_train = np.asarray(X_train, dtype=np.float64)
        self.y_train = np.asarray(y_train, dtype=np.float64)

        # Calculate K(X_train, X_train)
        self.K_train = self.compute_gram_matrix(self.X_train)

        # Fit SVR with precomputed Gram matrix
        self.model.fit(self.K_train, self.y_train)
        self.is_fitted = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Predicts crop yield (Quintals/Acre) for input agricultural features.

        Parameters:
        -----------
        X : np.ndarray of shape (N, 4), values scaled in [0, 2π]

        Returns:
        --------
        np.ndarray of predictions of shape (N,)
        """
        if not self.is_fitted or self.X_train is None:
            raise RuntimeError("AgriQuantumEngine must be fitted before calling predict.")

        X_arr = np.asarray(X, dtype=np.float64)
        if X_arr.ndim == 1:
            X_arr = X_arr.reshape(1, -1)

        # Compute test kernel against training support samples: K(X_test, X_train)
        K_test = self.compute_gram_matrix(X_arr, self.X_train)
        predictions = self.model.predict(K_test)
        return predictions

    def get_circuit_details(self) -> Dict[str, Union[int, str, Dict[str, int]]]:
        """
        Returns architectural details and decomposed representation
        of the 4-Qubit ZZFeatureMap circuit.
        """
        decomposed = self.feature_map.decompose()
        gate_counts = dict(decomposed.count_ops())
        
        return {
            "model_name": "Quantum Support Vector Regressor (QSVR)",
            "feature_map": "ZZFeatureMap (Second-order Pauli-Z expansion)",
            "kernel_type": "FidelityStatevectorKernel (Exact State Fidelity)",
            "num_qubits": self.feature_dimension,
            "reps": self.reps,
            "entanglement": self.entanglement,
            "circuit_depth": decomposed.depth(),
            "total_gates": sum(gate_counts.values()),
            "gate_counts": gate_counts,
            "num_parameters": self.feature_map.num_parameters,
            "c_param": self.c_param,
            "epsilon": self.epsilon,
            "phase_scale": self.phase_scale,
            "backend": "Qiskit Aer Statevector Fidelity Simulator",
            "disclosed_limitations": "4-qubit feature subspace (Soil Nitrogen, Soil Moisture, Rainfall, NDVI) utilized to operate within NISQ statevector simulation boundaries without gate synthesis decoherence.",
        }

    def get_circuit_ascii(self) -> str:
        """
        Returns clean ASCII representation of the parameterized quantum feature map.
        """
        try:
            return self.feature_map.decompose().draw(output="text").single_string()
        except Exception:
            return str(self.feature_map.decompose().draw(output="text"))

    @property
    def support_vectors_count(self) -> int:
        """Returns number of support vectors determined by QSVR."""
        if self.is_fitted and hasattr(self.model, "support_"):
            return len(self.model.support_)
        return 0


if __name__ == "__main__":
    from data.generator import get_train_test_agronomic_data
    from sklearn.metrics import r2_score, mean_squared_error

    data = get_train_test_agronomic_data(n_samples=80, random_state=42)
    engine = AgriQuantumEngine(c_param=10.0, epsilon=0.1)
    engine.fit(data["X_train_quantum"], data["y_train"])
    preds = engine.predict(data["X_test_quantum"])

    r2 = r2_score(data["y_test"], preds)
    rmse = np.sqrt(mean_squared_error(data["y_test"], preds))

    print(f"QSVR Fitted successfully!")
    print(f"QSVR Test R^2: {r2:.4f}, Test RMSE: {rmse:.4f}")
    print(f"Support vectors: {engine.support_vectors_count} / {len(data['y_train'])}")
    details = engine.get_circuit_details()
    print(f"Quantum Circuit Depth: {details['circuit_depth']}, Gates: {details['gate_counts']}")
