"""
Unit and Integration Tests for AgriQuantum Decision Intelligence
================================================================
Validates:
- What-If Scenario Simulator with 4 real model strategies
- Explainable Yield Intelligence with sensitivity curves
- Farm Digital Twin 360-degree telemetry consolidation
- Multi-factor Agricultural Risk Engine
- AgriQuantum Context-Aware Copilot
- Farm Memory & Harvest Actuals Tracking
- Decision Timeline event stream
- Foliar Disease Diagnostics
"""

import unittest
from fastapi.testclient import TestClient
from backend.api import app


class TestDecisionIntelligence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_authentication_endpoints(self):
        # 1. Successful authentication with test@gmail.com / test123
        login_res = self.client.post("/api/v1/auth/login", json={"email": "test@gmail.com", "password": "test123"})
        self.assertEqual(login_res.status_code, 200)
        token_data = login_res.json()
        self.assertIn("access_token", token_data)
        self.assertEqual(token_data["token_type"], "bearer")
        self.assertEqual(token_data.get("full_name", ""), "Yaswanth")

        # 2. Authenticated profile lookup using Bearer token
        token = token_data["access_token"]
        me_res = self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me_res.status_code, 200)
        profile = me_res.json()
        self.assertEqual(profile["email"], "test@gmail.com")

        # 3. Invalid credentials handling (returns 401, not 500)
        bad_login = self.client.post("/api/v1/auth/login", json={"email": "test@gmail.com", "password": "wrongpassword"})
        self.assertEqual(bad_login.status_code, 401)
        self.assertIn("Invalid", bad_login.json()["detail"])

        # 4. Password reset request
        reset_res = self.client.post("/api/v1/auth/reset-password", json={"email": "test@gmail.com"})
        self.assertEqual(reset_res.status_code, 200)
        self.assertEqual(reset_res.json()["status"], "success")

    def test_what_if_simulation_scenarios(self):

        payload = {
            "crop_type": "Winter Wheat",
            "cultivated_area_hectares": 120.0,
            "current_nitrogen": 85.0,
            "current_phosphorus": 45.0,
            "current_potassium": 55.0,
            "current_moisture": 24.0,
            "current_rainfall": 420.0,
            "current_ndvi": 0.68,
            "temperature": 24.5,
            "soil_ph": 6.8,
        }
        res = self.client.post("/api/v1/simulations/what-if", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["crop_type"], "Winter Wheat")
        self.assertEqual(len(data["scenarios"]), 5)
        scenario_ids = [s["scenario_id"] for s in data["scenarios"]]
        self.assertIn("current", scenario_ids)
        self.assertIn("optimized", scenario_ids)
        self.assertIn("low_cost", scenario_ids)
        self.assertIn("high_yield", scenario_ids)
        self.assertIn("water_saving", scenario_ids)

        for s in data["scenarios"]:
            self.assertGreater(s["predicted_yield_q_acre"], 0)
            self.assertGreater(s["input_cost_inr_acre"], 0)
            self.assertGreater(s["estimated_revenue_inr_acre"], 0)

    def test_prediction_explainability(self):
        payload = {
            "crop_type": "Winter Wheat",
            "cultivated_area_hectares": 120.0,
            "current_nitrogen": 110.0,
            "current_phosphorus": 45.0,
            "current_potassium": 60.0,
            "current_moisture": 32.0,
            "current_rainfall": 520.0,
            "current_ndvi": 0.82,
            "temperature": 23.0,
            "soil_ph": 6.8,
        }
        res = self.client.post("/api/v1/predictions/explain", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(len(data["top_factors"]), 0)
        self.assertGreater(len(data["sensitivity_curves"]), 0)
        self.assertIn("ZZFeatureMap", data["technical_explanation"])

    def test_digital_twin_endpoint(self):
        res = self.client.get("/api/v1/farms/1/digital-twin")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("farm_name", data)
        self.assertIn("crop", data)
        self.assertIn("current_weather", data)
        self.assertIn("active_risk_level", data)

    def test_risk_outlook_endpoint(self):
        res = self.client.get("/api/v1/farms/1/risk-outlook")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("overall_risk_score", data)
        self.assertIn("risk_factors", data)
        categories = [f["category"] for f in data["risk_factors"]]
        self.assertIn("Water Stress Risk", categories)
        self.assertIn("Weather Risk", categories)
        self.assertIn("Crop Health Risk", categories)
        self.assertIn("Yield Risk", categories)
        self.assertIn("Input Risk", categories)
        for rf in data["risk_factors"]:
            self.assertIn("action_link", rf)
            self.assertIn("action_label", rf)

    def test_weather_intelligence_endpoint(self):
        res = self.client.get("/api/v1/weather/intelligence/1")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["farm_id"], 1)
        self.assertIn("current", data)
        self.assertIn("daily_forecast", data)
        self.assertIn("hourly_forecast", data)
        self.assertIn("rainfall_intelligence", data)
        self.assertIn("farm_weather_status", data)
        self.assertIn("weather_impact_curves", data)
        self.assertIn(data["farm_weather_status"]["status"], ["Favorable", "Watch", "Attention", "High Risk"])
        self.assertGreater(len(data["daily_forecast"]), 0)
        self.assertGreater(len(data["hourly_forecast"]), 0)

    def test_quantum_weather_scenario_endpoint(self):
        payload = {
            "farm_id": 1,
            "rainfall_delta_pct": -35.0,
            "temperature_delta_c": 2.5,
            "irrigation_adjustment_mm": 15.0,
            "scenario_name": "Test Drought Simulation"
        }
        res = self.client.post("/api/v1/quantum/weather-scenario", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("scenario_id", data)
        self.assertGreater(data["simulated_yield_t_ha"], 0)
        self.assertIn("SIMULATED SCENARIO", data["is_simulation_disclaimer"].upper())
        self.assertEqual(data["quantum_configuration"]["qubit_count"], 4)

        self.assertIn("ZZFeatureMap", data["quantum_configuration"]["feature_map"])

    def test_weather_radar_endpoint(self):
        res = self.client.get("/api/v1/weather/radar/1")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("overall_risk_score", data)
        self.assertEqual(len(data["risk_factors"]), 5)

    def test_copilot_query_endpoint(self):

        payload = {"farm_id": 1, "query": "What is my predicted wheat yield?"}
        res = self.client.post("/api/v1/copilot/query", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("answer", data)
        self.assertGreater(len(data["sources_used"]), 0)

    def test_harvest_history_and_actuals(self):
        res = self.client.get("/api/v1/farms/1/history")
        self.assertEqual(res.status_code, 200)
        history = res.json()
        self.assertIsInstance(history, list)

        # Submit actuals
        submit_payload = {
            "farm_id": 1,
            "season_year": "Rabi 2026",
            "crop_name": "Winter Wheat (PBW-343)",
            "predicted_yield": 41.8,
            "actual_yield": 42.5,
            "actual_nitrogen": 110.0,
            "actual_water_mm": 510.0,
            "notes": "Optimal grain density achieved.",
        }
        post_res = self.client.post("/api/v1/farms/1/harvest-actuals", json=submit_payload)
        self.assertEqual(post_res.status_code, 200)
        record = post_res.json()
        self.assertAlmostEqual(record["actual_yield"], 42.5)
        self.assertGreater(record["accuracy_pct"], 90.0)

    def test_decision_timeline_endpoint(self):
        res = self.client.get("/api/v1/farms/1/timeline")
        self.assertEqual(res.status_code, 200)
        events = res.json()
        self.assertIsInstance(events, list)
        self.assertGreater(len(events), 0)

    def test_disease_detection_endpoint(self):
        payload = {"field_id": 1, "crop_name": "Winter Wheat"}
        res = self.client.post("/api/v1/disease/detect", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("disease_name", data)
        self.assertIn("severity", data)
    def test_quantum_scenario_endpoints(self):
        payload = {
            "farm_id": 1,
            "crop": "Winter Wheat",
            "nitrogen": 95.0,
            "phosphorus": 45.0,
            "potassium": 50.0,
            "soil_moisture": 30.0,
            "soil_ph": 6.8,
            "rainfall": 420.0,
            "temperature": 23.5,
            "ndvi": 0.75,
            "irrigation": 16.0,
            "scenario_name": "Test Quantum Plan",
            "scenario_type": "optimized"
        }
        res = self.client.post("/api/v1/quantum/scenario", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("scenario_id", data)
        self.assertGreater(data["predicted_yield"], 0)
        self.assertGreater(data["decision_score"], 0)
        self.assertIn("quantum_configuration", data)
        self.assertEqual(data["quantum_configuration"]["qubit_count"], 4)
        self.assertIsInstance(data["why_it_changed"], list)

        # Test GET /quantum/scenario/{id}
        sc_id = data["scenario_id"]
        get_res = self.client.get(f"/api/v1/quantum/scenario/{sc_id}")
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.json()["scenario_id"], sc_id)

    def test_quantum_circuit_and_kernel_matrix_endpoints(self):
        # Test GET /quantum/circuit/{id}
        c_res = self.client.get("/api/v1/quantum/circuit/1")
        self.assertEqual(c_res.status_code, 200)
        c_data = c_res.json()
        self.assertIn("qubits", c_data)
        self.assertIn("circuit_ascii", c_data)

        # Test GET /quantum/kernel-matrix/{id}
        k_res = self.client.get("/api/v1/quantum/kernel-matrix/1?samples=8")
        self.assertEqual(k_res.status_code, 200)
        k_data = k_res.json()
        self.assertEqual(k_data["dimension"], 8)
        self.assertEqual(len(k_data["matrix"]), 8)
        self.assertEqual(k_data["qubit_count"], 4)


if __name__ == "__main__":
    unittest.main()

