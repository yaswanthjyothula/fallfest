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
        self.assertEqual(len(data["scenarios"]), 4)
        scenario_ids = [s["scenario_id"] for s in data["scenarios"]]
        self.assertIn("current", scenario_ids)
        self.assertIn("optimized", scenario_ids)
        self.assertIn("low_cost", scenario_ids)
        self.assertIn("high_yield", scenario_ids)

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
        self.assertIn("Thermal & Climate Risk", categories)
        self.assertIn("Canopy Vigor Risk", categories)
        self.assertIn("Nutrient Imbalance Risk", categories)

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
        self.assertIn("cultural_controls", data)


if __name__ == "__main__":
    unittest.main()
