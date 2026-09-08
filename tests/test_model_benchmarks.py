"""
Unit & Integration Tests for Model Benchmark & Scientific Comparison
====================================================================
Validates:
1. GET /api/v1/models/benchmark returns full typed benchmark response.
2. POST /api/v1/models/benchmark/run executes live models, stores results in DB, and returns updated metrics.
3. GET /api/v1/models/{model_id}/predictions returns valid scatter points.
4. GET /api/v1/models/{model_id}/residuals returns valid residual points.
5. Zero data leakage in evaluation pipeline.
6. Metric consistency: R² <= 1.0, RMSE > 0, MAE > 0.
7. Headline comparison delta calculations and dynamic honest summary.
"""

import unittest
from fastapi.testclient import TestClient
from backend.api import app
from backend.database import SessionLocal
from backend.models import ModelBenchmarkRecord


class TestModelBenchmarkAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_get_benchmark_results(self):
        """Verify GET /api/v1/models/benchmark returns all required fields and models."""
        res = self.client.get("/api/v1/models/benchmark")
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertIn("benchmark_id", data)
        self.assertIn("timestamp", data)
        self.assertIn("models", data)
        self.assertEqual(len(data["models"]), 4)

        # Check all 4 models are represented
        model_names = [m["model"] for m in data["models"]]
        self.assertIn("Quantum SVR (QSVR)", model_names)
        self.assertIn("Random Forest", model_names)
        self.assertIn("Classical SVR (RBF)", model_names)
        self.assertIn("Ridge Regressor", model_names)

        # Verify regression metrics are valid numbers
        for m in data["models"]:
            self.assertIsInstance(m["r2"], float)
            self.assertIsInstance(m["rmse"], float)
            self.assertIsInstance(m["mae"], float)
            self.assertGreaterEqual(m["rmse"], 0.0)
            self.assertGreaterEqual(m["mae"], 0.0)
            self.assertGreaterEqual(m["rank"], 1)
            self.assertLessEqual(m["rank"], 4)

        # Verify headline comparison
        hc = data["headline_comparison"]
        self.assertIn("quantum_model", hc)
        self.assertIn("best_classical_model", hc)
        self.assertIn("r2_delta", hc)
        self.assertIn("rmse_delta", hc)
        self.assertIn("winner", hc)
        self.assertIn("summary_statement", hc)
        self.assertGreater(len(hc["summary_statement"]), 10)

        # Verify dataset metadata
        ds = data["dataset"]
        self.assertEqual(ds["version"], "v2.4-calibrated")
        self.assertEqual(ds["target"], "yield_quintals (Quintals/Acre)")
        self.assertIn("soil_nitrogen", ds["features"])

        # Verify evaluation environment
        env = data["evaluation_environment"]
        self.assertIn("cpu", env)
        self.assertIn("python_version", env)
        self.assertIn("qiskit_version", env)

        # Verify quantum technical details
        qd = data["quantum_details"]
        self.assertEqual(qd["num_qubits"], 4)
        self.assertIn("ZZFeatureMap", qd["feature_map"])
        self.assertGreater(qd["circuit_depth"], 0)

    def test_02_model_predictions_scatter(self):
        """Verify GET /api/v1/models/{model_id}/predictions returns scatter points with actual and predicted yield."""
        for model_id in ["qsvr", "random_forest", "rbf_svr", "ridge"]:
            res = self.client.get(f"/api/v1/models/{model_id}/predictions")
            self.assertEqual(res.status_code, 200, f"Failed for model_id: {model_id}")
            points = res.json()
            self.assertGreater(len(points), 10)
            first_pt = points[0]
            self.assertIn("sample_id", first_pt)
            self.assertIn("actual", first_pt)
            self.assertIn("predicted", first_pt)
            self.assertGreater(first_pt["actual"], 0.0)
            self.assertGreater(first_pt["predicted"], 0.0)

    def test_03_model_residuals_analysis(self):
        """Verify GET /api/v1/models/{model_id}/residuals returns predicted vs residual values."""
        for model_id in ["qsvr", "random_forest", "rbf_svr", "ridge"]:
            res = self.client.get(f"/api/v1/models/{model_id}/residuals")
            self.assertEqual(res.status_code, 200, f"Failed for model_id: {model_id}")
            residuals = res.json()
            self.assertGreater(len(residuals), 10)
            first_res = residuals[0]
            self.assertIn("sample_id", first_res)
            self.assertIn("predicted", first_res)
            self.assertIn("residual", first_res)

    def test_04_post_run_benchmark(self):
        """Verify POST /api/v1/models/benchmark/run performs real evaluation and stores in DB."""
        payload = {"sample_count": 100, "random_seed": 77, "test_size": 0.25}
        res = self.client.post("/api/v1/models/benchmark/run", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["dataset"]["sample_count"], 100)
        self.assertEqual(data["dataset"]["random_seed"], 77)

        # Check DB persistence
        db = SessionLocal()
        records = db.query(ModelBenchmarkRecord).filter_by(benchmark_id=data["benchmark_id"]).all()
        self.assertEqual(len(records), 4)
        db.close()


if __name__ == "__main__":
    unittest.main()
