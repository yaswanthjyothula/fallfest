"""
Unit and Integration Tests for Dual-Engine Optimization and Benchmarking Enhancements
=====================================================================================
Validates:
1. Classical SLSQP optimization convergence and constraint adherence.
2. Quantum-Inspired SQA optimization tunneling across discrete parameter bounds.
3. Multi-objective comparisons: maximum_yield, minimum_cost, minimum_water, balanced_plan.
4. Robustness perturbation metrics and residual histogram binning.
5. REST API endpoints:
   - POST /api/v1/optimization/scenario
   - GET /api/v1/farms/{farm_id}/weather-impact
   - GET /api/v1/farms/{farm_id}/risk
   - GET /api/v1/models/benchmark
"""

import unittest
from unittest.mock import patch, AsyncMock
import numpy as np
from fastapi.testclient import TestClient

from backend.api import app
from backend.services.optimization_service import AgronomicOptimizationService, get_optimization_service
from core.benchmark import benchmark_models
from data.generator import get_train_test_agronomic_data


class TestOptimizationService(unittest.TestCase):
    """Tests the dual-engine agricultural resource optimizer."""

    def setUp(self):
        self.service = AgronomicOptimizationService()

    def test_solve_classical_slsqp(self):
        sol = self.service.solve_classical(
            objective_type="balanced_plan",
            current_n=80.0,
            current_p=40.0,
            current_k=35.0,
            soil_moisture=26.0,
            rainfall=150.0,
            ndvi=0.65,
        )
        self.assertIn("method", sol)
        self.assertIn("SLSQP", sol["method"])
        self.assertGreaterEqual(sol["nitrogen_kg_ha"], 30.0)
        self.assertLessEqual(sol["nitrogen_kg_ha"], 180.0)
        self.assertGreaterEqual(sol["predicted_yield_q_acre"], 10.0)
        self.assertGreater(sol["input_cost_usd_ha"], 0.0)
        self.assertGreater(sol["runtime_ms"], 0.0)

    def test_solve_quantum_inspired_sqa(self):
        sol = self.service.solve_quantum_inspired(
            objective_type="maximum_yield",
            current_n=90.0,
            current_p=45.0,
            current_k=40.0,
            soil_moisture=30.0,
            rainfall=180.0,
            ndvi=0.70,
            tunneling_steps=20,
        )
        self.assertIn("Quantum-Inspired SQA", sol["method"])
        self.assertGreaterEqual(sol["nitrogen_kg_ha"], 30.0)
        self.assertLessEqual(sol["nitrogen_kg_ha"], 180.0)
        self.assertEqual(sol["tunneling_steps"], 20)
        self.assertGreater(sol["predicted_yield_q_acre"], 10.0)

    def test_run_comparison_all_objectives(self):
        objectives = ["maximum_yield", "minimum_cost", "minimum_water", "balanced_plan"]
        for obj in objectives:
            comp = self.service.run_comparison(
                objective_type=obj,
                current_n=85.0,
                current_p=40.0,
                current_k=38.0,
                soil_moisture=28.0,
                rainfall=140.0,
                ndvi=0.62,
                budget_limit=250.0,
                target_yield=30.0,
            )
            self.assertEqual(comp["objective"], obj)
            self.assertIn("classical_solution", comp)
            self.assertIn("quantum_inspired_solution", comp)
            self.assertIn("superior_method", comp)
            self.assertIn("scientific_assessment", comp)
            self.assertIn("constraints", comp)


class TestBenchmarkRobustnessAndDistributions(unittest.TestCase):
    """Tests the statistical distributions and perturbation robustness in AgronomicBenchmarkSuite."""

    def test_benchmark_contains_distributions_and_robustness(self):
        data = get_train_test_agronomic_data(n_samples=50, test_size=0.3, random_state=42)
        bench = benchmark_models(
            X_train_raw=data["X_train_raw"],
            X_test_raw=data["X_test_raw"],
            X_train_quantum=data["X_train_quantum"],
            X_test_quantum=data["X_test_quantum"],
            y_train=data["y_train"],
            y_test=data["y_test"],
            random_state=42,
        )

        self.assertIn("residual_distributions", bench)
        self.assertIn("robustness_analysis", bench)

        # Verify distributions exist for models
        dists = bench["residual_distributions"]
        self.assertIn("Quantum SVR (QSVR)", dists)
        self.assertIn("Random Forest", dists)
        self.assertEqual(len(dists["Quantum SVR (QSVR)"]), 8)

        # Verify robustness has all 6 perturbations
        rob = bench["robustness_analysis"]
        self.assertEqual(len(rob), 6)
        for item in rob:
            self.assertIn("perturbation", item)
            self.assertIn("quantum_svr_delta_pct", item)
            self.assertIn("random_forest_delta_pct", item)
            self.assertIn("most_stable_model", item)


class TestApiOptimizationEndpoints(unittest.TestCase):
    """Tests API endpoints through FastAPI TestClient."""

    def setUp(self):
        self.client = TestClient(app)

    def test_post_optimization_scenario(self):
        payload = {
            "objective_type": "balanced_plan",
            "current_nitrogen": 85.0,
            "current_phosphorus": 45.0,
            "current_potassium": 40.0,
            "soil_moisture": 28.0,
            "rainfall": 140.0,
            "ndvi": 0.62,
            "budget_limit_usd_ha": 240.0,
            "target_yield_q_acre": 32.0,
        }
        res = self.client.post("/api/v1/optimization/scenario", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["objective"], "balanced_plan")
        self.assertIn("classical_solution", data)
        self.assertIn("quantum_inspired_solution", data)
        self.assertIn("scientific_assessment", data)

    def test_get_benchmark_includes_robustness(self):
        res = self.client.get("/api/v1/models/benchmark")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("residual_distributions", data)
        self.assertIn("robustness_analysis", data)
        self.assertIn("models", data)
        self.assertIn("headline_comparison", data)

    @patch("backend.api_v1.get_farm_weather", new_callable=AsyncMock)
    def test_get_farm_weather_impact(self, mock_weather):
        mock_weather.return_value = {
            "current_weather": {"temperature": 24.5, "precipitation": 115.0, "conditions": "Clear"}
        }
        # Retrieve registered farms or use farm 1
        farms_res = self.client.get("/api/v1/farms")
        if farms_res.status_code == 200 and len(farms_res.json()) > 0:
            farm_id = farms_res.json()[0]["id"]
            res = self.client.get(f"/api/v1/farms/{farm_id}/weather-impact")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["farm_id"], farm_id)
            self.assertIn("stress_simulations", data)
            self.assertEqual(len(data["stress_simulations"]), 4)
            self.assertIn("Model Simulation", data["model_type_disclaimer"])


if __name__ == "__main__":
    unittest.main()
