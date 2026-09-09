"""
AgriQuantum Unit & Integration Tests: Personalized Farm Setup, User Profile & Telemetry
========================================================================================
Tests dynamic user profile ('Yaswanth'), empty initial user state, unified farm setup pipeline,
live weather + Sentinel NDVI enrichment, Quantum SVR prediction, risk radar, recommendations,
and actual harvest feedback memory.
"""

import unittest
import json
from fastapi.testclient import TestClient
from backend.api import app
from backend.database import SessionLocal
from backend import models

client = TestClient(app)


class TestPersonalizedFarmFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        db = SessionLocal()
        try:
            test_user = db.query(models.User).filter_by(email="test@gmail.com").first()
            if test_user:
                # Delete predictions, recommendations, and farms
                db.query(models.Recommendation).delete()
                db.query(models.Prediction).delete()
                db.query(models.HarvestRecord).delete()
                farms = db.query(models.Farm).filter(models.Farm.user_id == test_user.id).all()
                for f in farms:
                    db.delete(f)
                db.commit()
        finally:
            db.close()


    def test_01_authenticated_user_profile_dynamic_name(self):
        """Verify GET /api/v1/me returns Yaswanth for the local test account."""
        res = client.get("/api/v1/me")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["full_name"], "Yaswanth")
        self.assertEqual(data["email"], "test@gmail.com")
        self.assertIn("farm_count", data)

    def test_02_empty_farms_for_fresh_user(self):
        """Verify new/fresh user has 0 farms initially (no fake Green Valley fallback)."""
        res = client.get("/api/v1/farms")
        self.assertEqual(res.status_code, 200)
        farms = res.json()
        self.assertEqual(len(farms), 0)

    def test_03_unified_farm_setup_and_quantum_analysis(self):
        """
        Verify POST /api/v1/farms/setup:
        Saves Farm + Field + Crop + Soil -> Enriches Weather & Satellite -> Runs Quantum SVR -> Risk -> Recommendations.
        """
        payload = {
            "farm_name": "Yaswanth Krishna Delta Precision Farm",
            "location": "Krishna River Delta (Zone 4B)",
            "city": "Vijayawada",
            "state": "Andhra Pradesh",
            "country": "India",
            "latitude": 16.5062,
            "longitude": 80.6480,
            "total_area_hectares": 35.0,
            "area_unit": "Hectares",
            "crop_name": "Winter Wheat",
            "crop_variety": "PBW-343 Certified",
            "season": "Rabi",
            "growth_stage": "Stem Elongation (Feekes 6)",
            "cultivated_area_hectares": 30.0,
            "soil_nitrogen": 115.0,
            "soil_phosphorus": 45.0,
            "soil_potassium": 50.0,
            "soil_ph": 6.8,
            "soil_moisture": 28.0,
            "organic_matter": 0.85,
            "soil_type": "Alluvial Loam",
        }

        res = client.post("/api/v1/farms/setup", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()

        # Check Farm creation
        self.assertEqual(data["farm"]["name"], "Yaswanth Krishna Delta Precision Farm")
        self.assertEqual(data["farm"]["latitude"], 16.5062)

        # Check Field & Crop
        self.assertIn("field", data)
        self.assertEqual(data["crop"]["name"], "Winter Wheat")

        # Check Telemetry Enrichment
        self.assertIn("weather", data)
        self.assertIn("temperature_c", data["weather"])
        self.assertIn("satellite", data)
        self.assertIn("ndvi", data["satellite"])

        # Check Quantum Yield Prediction
        self.assertIn("prediction", data)
        self.assertGreater(data["prediction"]["predicted_yield_quintals_acre"], 0.0)
        self.assertEqual(data["prediction"]["qubits"], 4)

        # Check Risk & Recommendations
        self.assertIn("risk_outlook", data)
        self.assertIn("overall_risk_level", data["risk_outlook"])
        self.assertIn("recommendations", data)
        self.assertIn("nitrogen_advisory", data["recommendations"])

        # Check Economic Upside
        self.assertIn("economic_impact", data)
        self.assertGreater(data["economic_impact"]["baseline_gross_revenue_inr"], 0)

        # Verify farm now appears in GET /api/v1/farms
        farms_res = client.get("/api/v1/farms")
        self.assertEqual(farms_res.status_code, 200)
        self.assertEqual(len(farms_res.json()), 1)

    def test_04_record_actual_harvest_feedback(self):
        """Verify POST /api/v1/harvest-results and error computation."""
        farms_res = client.get("/api/v1/farms")
        farms = farms_res.json()
        self.assertGreater(len(farms), 0)
        farm_id = farms[0]["id"]

        payload = {
            "farm_id": farm_id,
            "crop_name": "Winter Wheat",
            "season_year": "Rabi 2025-26",
            "actual_yield": 40.2,
            "predicted_yield": 41.5,
            "actual_nitrogen": 115.0,
            "actual_water_mm": 20.0,
            "notes": "Optimal harvesting window achieved with negligible lodging.",
        }

        res = client.post("/api/v1/harvest-results", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["actual_yield"], 40.2)
        self.assertEqual(data["predicted_yield"], 41.5)
        self.assertGreater(data["error_pct"], 0.0)

        # Verify history endpoint
        hist_res = client.get(f"/api/v1/harvest-results/{farm_id}")
        self.assertEqual(hist_res.status_code, 200)
        self.assertEqual(len(hist_res.json()), 1)

    def test_05_multi_farm_support(self):
        """Verify user can add multiple independent farms."""
        payload2 = {
            "farm_name": "Yaswanth Deccan Agro Center",
            "location": "Telangana Central Plateau",
            "city": "Hyderabad",
            "state": "Telangana",
            "country": "India",
            "latitude": 17.3850,
            "longitude": 78.4867,
            "total_area_hectares": 50.0,
            "crop_name": "Bt Cotton",
            "crop_variety": "RCH-659 BG II",
            "season": "Kharif",
            "growth_stage": "Boll Formation",
            "soil_nitrogen": 140.0,
            "soil_phosphorus": 55.0,
            "soil_potassium": 65.0,
            "soil_ph": 7.2,
            "soil_moisture": 24.0,
            "organic_matter": 0.65,
            "soil_type": "Black Soil (Vertisol)",
        }

        res = client.post("/api/v1/farms/setup", json=payload2)
        self.assertEqual(res.status_code, 201)

        farms_res = client.get("/api/v1/farms")
        self.assertEqual(len(farms_res.json()), 2)

        # Verify updated profile farm count
        me_res = client.get("/api/v1/me")
        self.assertEqual(me_res.json()["farm_count"], 2)


if __name__ == "__main__":
    unittest.main()
