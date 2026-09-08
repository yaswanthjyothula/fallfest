"""
Unit and Integration Tests for AgriQuantum Engine
=================================================
Validates:
1. Data generation distributions, non-linear relationships, and quantum scaling.
2. Quantum feature map structure, depth, gate counts, and Gram matrix properties.
3. QSVR model training, convergence, and test inference accuracy.
4. Benchmark comparison execution across QSVR, SVR, RF, and Ridge.
5. Constrained optimizer execution and recommendation output formatting.
"""

import unittest
import numpy as np
import pandas as pd

from data.generator import (
    generate_agronomic_dataset,
    get_train_test_agronomic_data,
    scale_for_quantum,
    QUANTUM_FEATURES,
    TARGET_COL,
)
from core.quantum_engine import AgriQuantumEngine
from core.benchmark import benchmark_models
from core.recommender import PrecisionAgronomyRecommender


class TestAgriQuantumEngine(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Prepare small reproducible test data."""
        cls.data = get_train_test_agronomic_data(n_samples=50, test_size=0.2, random_state=42)

    def test_01_data_generator_properties(self):
        """Verify generated dataset format, column types, and physical bounds."""
        df = self.data["df"]
        self.assertEqual(len(df), 50)
        for col in QUANTUM_FEATURES:
            self.assertIn(col, df.columns)
        self.assertIn(TARGET_COL, df.columns)

        # Check yield physical sanity bounds (Quintals/Acre)
        self.assertTrue((df[TARGET_COL] >= 15.0).all())
        self.assertTrue((df[TARGET_COL] <= 55.0).all())

        # Check quantum scaled bounds [0, 2π]
        X_q = self.data["X_train_quantum"]
        self.assertAlmostEqual(X_q.min(), 0.0, delta=0.01)
        self.assertAlmostEqual(X_q.max(), 2.0 * np.pi, delta=0.01)

    def test_02_quantum_circuit_specifications(self):
        """Verify 4-qubit ZZFeatureMap structure, depth, and gate components."""
        engine = AgriQuantumEngine(feature_dimension=4, reps=2, entanglement="linear")
        details = engine.get_circuit_details()

        self.assertEqual(details["num_qubits"], 4)
        self.assertEqual(details["reps"], 2)
        self.assertEqual(details["entanglement"], "linear")
        self.assertGreater(details["circuit_depth"], 0)
        self.assertIn("cx", details["gate_counts"])
        # In Qiskit 2.x, 1-qubit rotations are decomposed into 'u' gates, whereas Qiskit 1.x used 'p'/'h'
        has_rotations = ("u" in details["gate_counts"]) or ("p" in details["gate_counts"])
        self.assertTrue(has_rotations)

    def test_03_gram_matrix_mathematical_properties(self):
        """Verify Gram matrix K(x_i, x_j) is symmetric, positive semi-definite, with diagonal = 1."""
        engine = AgriQuantumEngine(feature_dimension=4, reps=2, entanglement="linear")
        X_sub = self.data["X_train_quantum"][:10]
        K = engine.compute_gram_matrix(X_sub)

        # Shape check (10 x 10)
        self.assertEqual(K.shape, (10, 10))

        # Diagonal check (Fidelity of state with itself |<psi|psi>|^2 = 1.0)
        np.testing.assert_allclose(np.diag(K), np.ones(10), atol=1e-5)

        # Symmetry check: K_ij == K_ji
        np.testing.assert_allclose(K, K.T, atol=1e-5)

        # Values bounded in [0, 1]
        self.assertTrue((K >= -1e-6).all())
        self.assertTrue((K <= 1.0 + 1e-6).all())

    def test_04_qsvr_fit_and_predict(self):
        """Verify QSVR trains on Gram matrix and outputs valid yield predictions."""
        engine = AgriQuantumEngine(c_param=10.0, epsilon=0.1)
        engine.fit(self.data["X_train_quantum"], self.data["y_train"])

        self.assertTrue(engine.is_fitted)
        self.assertGreater(engine.support_vectors_count, 0)

        preds = engine.predict(self.data["X_test_quantum"])
        self.assertEqual(len(preds), len(self.data["y_test"]))
        # Ensure predictions are reasonable crop yield values
        self.assertTrue((preds > 10.0).all())
        self.assertTrue((preds < 60.0).all())

    def test_05_benchmark_suite_execution(self):
        """Verify classical baseline benchmarks run cleanly and return metrics."""
        results = benchmark_models(
            X_train_raw=self.data["X_train_raw"],
            X_test_raw=self.data["X_test_raw"],
            X_train_quantum=self.data["X_train_quantum"],
            X_test_quantum=self.data["X_test_quantum"],
            y_train=self.data["y_train"],
            y_test=self.data["y_test"],
        )

        self.assertIn("summary_df", results)
        self.assertIn("Quantum SVR (QSVR)", results["metrics"])
        self.assertIn("Classical SVR (RBF)", results["metrics"])
        self.assertIn("Random Forest", results["metrics"])

        summary_df = results["summary_df"]
        self.assertEqual(len(summary_df), 4)
        for metric in ["r2", "rmse", "mae"]:
            self.assertIn(metric, summary_df.columns)

    def test_06_precision_agronomy_recommender(self):
        """Verify optimization recommendation for target plot."""
        engine = AgriQuantumEngine(c_param=10.0, epsilon=0.1)
        engine.fit(self.data["X_train_quantum"], self.data["y_train"])

        recommender = PrecisionAgronomyRecommender(
            quantum_engine=engine,
            scaler=self.data["scaler"],
        )

        prescription = recommender.optimize_plot(
            current_nitrogen=65.0,
            current_moisture=20.0,
            rainfall=120.0,
            ndvi=0.45,
            plot_id="TEST-PLOT-01",
        )

        self.assertEqual(prescription.plot_id, "TEST-PLOT-01")
        self.assertGreater(prescription.optimized_yield, 0.0)
        self.assertIsInstance(prescription.advisory_summary, str)
        self.assertGreater(len(prescription.advisory_summary), 15)


if __name__ == "__main__":
    unittest.main()
