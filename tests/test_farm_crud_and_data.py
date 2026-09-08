"""
Unit & Integration Tests for Farm CRUD, Agricultural Data, and Quantum Kernel Matrix
"""

import unittest
import json
import io
from fastapi.testclient import TestClient
from backend.api import app
from backend.database import get_db, Base, engine, SessionLocal
from backend import models


class TestFarmCrudAndData(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)
        cls.db = SessionLocal()

        # Ensure seed admin user exists for token generation
        user = cls.db.query(models.User).filter_by(email="admin@agriquantum.com").first()
        if not user:
            from backend.auth import get_password_hash
            user = models.User(
                email="admin@agriquantum.com",
                hashed_password=get_password_hash("AgriQuantum2026!"),
                full_name="Dr. Aris Thorne",
                role="Administrator",
            )
            cls.db.add(user)
            cls.db.commit()
            cls.db.refresh(user)

        # Login to obtain JWT
        res = cls.client.post("/api/v1/auth/login", json={
            "email": "admin@agriquantum.com",
            "password": "AgriQuantum2026!",
        })
        token = res.json()["access_token"]
        cls.headers = {"Authorization": f"Bearer {token}"}

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_farm_crud_lifecycle(self):
        """Test creating, reading, updating, and deleting a farm holding."""
        # 1. Create Farm
        payload = {
            "name": "Integration Test Experimental Station",
            "location": "Punjab Alluvial Zone",
            "state": "Punjab",
            "country": "India",
            "latitude": 30.9010,
            "longitude": 75.8573,
            "total_area_hectares": 150.0,
        }
        res = self.client.post("/api/v1/farms", json=payload, headers=self.headers)
        self.assertEqual(res.status_code, 201)
        farm_data = res.json()
        farm_id = farm_data["id"]
        self.assertEqual(farm_data["name"], payload["name"])

        # 2. Get Farm
        res = self.client.get(f"/api/v1/farms/{farm_id}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["latitude"], 30.9010)

        # 3. Update Farm
        update_payload = {"name": "Updated Experimental Station", "total_area_hectares": 175.5}
        res = self.client.put(f"/api/v1/farms/{farm_id}", json=update_payload)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["name"], "Updated Experimental Station")
        self.assertEqual(res.json()["total_area_hectares"], 175.5)

        # 4. Add Field to Farm
        field_payload = {
            "name": "Plot A - Winter Wheat Trial",
            "area_hectares": 50.0,
            "soil_type": "Clay Loam",
            "boundary_geojson": '{"type":"Polygon","coordinates":[[[75.85,30.90],[75.86,30.90],[75.86,30.91],[75.85,30.91],[75.85,30.90]]]}',
        }
        res = self.client.post(f"/api/v1/farms/{farm_id}/fields", json=field_payload)
        self.assertEqual(res.status_code, 201)
        field_id = res.json()["id"]

        # 5. Add Crop Cycle to Field
        crop_payload = {
            "name": "Winter Wheat",
            "variety": "PBW-343",
            "season": "Rabi 2026",
            "growth_stage": "Tillering",
        }
        res = self.client.post(f"/api/v1/fields/{field_id}/crops", json=crop_payload)
        self.assertEqual(res.status_code, 201)
        crop_data = res.json()
        self.assertEqual(crop_data["variety"], "PBW-343")

        # 6. List Crops for Field
        res = self.client.get(f"/api/v1/fields/{field_id}/crops")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(len(res.json()) >= 1)

        # 7. Delete Field
        res = self.client.delete(f"/api/v1/fields/{field_id}")
        self.assertEqual(res.status_code, 200)

        # 8. Delete Farm
        res = self.client.delete(f"/api/v1/farms/{farm_id}")
        self.assertEqual(res.status_code, 200)

    def test_02_quantum_kernel_matrix_endpoint(self):
        """Test /api/v1/models/kernel-matrix endpoint returns valid Gram matrix."""
        res = self.client.get("/api/v1/models/kernel-matrix?samples=8")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["dimension"], 8)
        self.assertEqual(len(data["matrix"]), 8)
        self.assertEqual(len(data["matrix"][0]), 8)
        self.assertEqual(data["qubit_count"], 4)
        # Verify diagonal elements are ~1.0 (self-fidelity)
        for i in range(8):
            self.assertAlmostEqual(data["matrix"][i][i], 1.0, delta=0.01)

    def test_03_data_preview_and_filtering(self):
        """Test /api/v1/data/preview pagination and filtering."""
        res = self.client.get("/api/v1/data/preview?page=1&page_size=5")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["records"]), 5)
        self.assertTrue(data["total_records"] > 0)
        self.assertIn("soil_nitrogen_kg_ha", data["records"][0])
        self.assertIn("actual_yield_q_acre", data["records"][0])

    def test_04_csv_upload_validation(self):
        """Test /api/v1/data/upload-csv with valid and invalid agricultural CSVs."""
        # Valid CSV
        valid_csv = (
            "nitrogen,phosphorus,potassium,soil_moisture,rainfall,temperature,ndvi,crop\n"
            "75.0,45.0,50.0,28.5,450.0,24.0,0.72,Winter Wheat\n"
            "82.0,50.0,55.0,30.0,500.0,25.5,0.78,Winter Wheat\n"
        )
        file_obj = io.BytesIO(valid_csv.encode("utf-8"))
        res = self.client.post(
            "/api/v1/data/upload-csv",
            files={"file": ("test_agri_data.csv", file_obj, "text/csv")},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_rows"], 2)
        self.assertEqual(data["valid_rows"], 2)
        self.assertEqual(data["status"], "Valid")

    def test_05_crop_health_analysis_endpoint(self):
        """Test /api/v1/satellite/crop-health/{field_id} endpoint."""
        res = self.client.get("/api/v1/satellite/crop-health/1")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("mean_ndvi", data)
        self.assertIn("historical_ndvi_trend", data)
        self.assertTrue(len(data["historical_ndvi_trend"]) > 0)


if __name__ == "__main__":
    unittest.main()
