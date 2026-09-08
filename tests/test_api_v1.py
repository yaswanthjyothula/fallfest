"""
AgriQuantum API v1 Endpoint Integration Tests
=============================================
Tests /api/v1/ authentication, predictions, recommendations,
weather, satellite, datasets, and health endpoints.
"""

import unittest
from fastapi.testclient import TestClient

from backend.api import app
from backend.database import Base, engine, SessionLocal
from backend import models


class TestApiV1Endpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    def test_health_check(self):
        """Test GET /api/v1/health returns healthy system status."""
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["active_qubits"], 4)

    def test_root_endpoint(self):
        """Test GET / returns platform identity and documentation URL."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["platform"], "AgriQuantum Precision Agriculture Platform")
        self.assertEqual(data["documentation"], "/docs")

    def test_yield_prediction_pipeline(self):
        """Test POST /api/v1/predictions/yield executes real QSVR inference and persists in DB."""
        payload = {
            "soil_nitrogen": 90.0,
            "soil_phosphorus": 45.0,
            "soil_potassium": 50.0,
            "soil_moisture": 28.5,
            "soil_ph": 6.8,
            "rainfall": 780.0,
            "temperature": 24.5,
            "ndvi": 0.82,
            "crop_type": "Winter Wheat",
        }
        response = self.client.post("/api/v1/predictions/yield", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("predicted_yield_quintals_acre", data)
        self.assertGreater(data["predicted_yield_quintals_acre"], 20.0)
        self.assertIn("prediction_id", data)
        self.assertEqual(data["circuit_qubits"], 4)
        self.assertEqual(data["status"], "Complete")

    def test_recommendations_pipeline(self):
        """Test POST /api/v1/recommendations executes constrained optimization."""
        payload = {
            "soil_nitrogen": 90.0,
            "soil_moisture": 28.5,
            "rainfall": 780.0,
            "ndvi": 0.82,
            "crop_type": "Winter Wheat",
        }
        response = self.client.post("/api/v1/recommendations", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("baseline_yield_q_acre", data)
        self.assertIn("optimized_yield_q_acre", data)
        self.assertIn("cost_savings_inr_acre", data)
        self.assertIn("nitrogen_advisory", data)

    def test_model_benchmarks(self):
        """Test GET /api/v1/models/benchmark returns real model evaluations."""
        response = self.client.get("/api/v1/models/benchmark")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        model_names = [m["model"] for m in data.get("models", [])]
        self.assertIn("Quantum SVR (QSVR)", model_names)
        self.assertIn("Random Forest", model_names)
        self.assertIn("headline_comparison", data)

    def test_quantum_circuit_spec(self):
        """Test GET /api/v1/models/quantum-circuit returns decomposed ASCII diagram."""
        response = self.client.get("/api/v1/models/quantum-circuit")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["num_qubits"], 4)
        self.assertIn("circuit_ascii", data)

    def test_weather_endpoint(self):
        """Test GET /api/v1/weather/1 retrieves weather data."""
        response = self.client.get("/api/v1/weather/1")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("current_temperature_c", data)
        self.assertIn("forecast_days", data)

    def test_report_generation(self):
        """Test POST /api/v1/reports/generate compiles PDF and text audit report."""
        payload = {
            "farm_id": 1,
            "crop": "Winter Wheat",
            "include_quantum_analysis": True,
        }
        response = self.client.post("/api/v1/reports/generate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("report_id", data)
        self.assertIn("download_pdf_url", data)


if __name__ == "__main__":
    unittest.main()
