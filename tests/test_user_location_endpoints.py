import unittest
from fastapi.testclient import TestClient
from backend.api import app
from backend.auth import create_access_token
from backend.database import SessionLocal
from backend import models

client = TestClient(app)


class TestUserLocationEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = SessionLocal()
        # Clean or create test user 1
        u1 = cls.db.query(models.User).filter(models.User.email == "loc_test_user1@agriquantum.io").first()
        if not u1:
            u1 = models.User(
                email="loc_test_user1@agriquantum.io",
                hashed_password="mockhash123",
                full_name="Location Test User 1",
                role="Farmer",
            )
            cls.db.add(u1)
            cls.db.commit()
            cls.db.refresh(u1)
        cls.user1 = u1
        cls.token1 = create_access_token({"sub": str(u1.id), "email": u1.email, "role": u1.role})

        # User 2 for isolation testing
        u2 = cls.db.query(models.User).filter(models.User.email == "loc_test_user2@agriquantum.io").first()
        if not u2:
            u2 = models.User(
                email="loc_test_user2@agriquantum.io",
                hashed_password="mockhash123",
                full_name="Location Test User 2",
                role="Farmer",
            )
            cls.db.add(u2)
            cls.db.commit()
            cls.db.refresh(u2)
        cls.user2 = u2
        cls.token2 = create_access_token({"sub": str(u2.id), "email": u2.email, "role": u2.role})

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_user_location_lifecycle_and_validation(self):
        # 1. Invalid coordinates rejected
        res_invalid = client.post(
            "/api/v1/location",
            headers={"Authorization": f"Bearer {self.token1}"},
            json={
                "latitude": 95.0,  # Invalid: > 90
                "longitude": 80.0,
                "source": "gps",
            },
        )
        self.assertEqual(res_invalid.status_code, 422, "Out-of-range latitude must be rejected")

        # 2. Record valid real-world coordinates
        res_post = client.post(
            "/api/v1/location",
            headers={"Authorization": f"Bearer {self.token1}"},
            json={
                "latitude": 17.3850,
                "longitude": 78.4867,
                "accuracy": 14.5,
                "source": "gps",
                "city": "Hyderabad",
                "state": "Telangana",
                "country": "India",
            },
        )
        self.assertEqual(res_post.status_code, 200)
        data = res_post.json()
        self.assertAlmostEqual(data["latitude"], 17.3850, places=3)
        self.assertAlmostEqual(data["longitude"], 78.4867, places=3)
        self.assertEqual(data["city"], "Hyderabad")
        self.assertEqual(data["source"], "gps")

        # 3. GET /location retrieves the user's recorded location
        res_get = client.get(
            "/api/v1/location",
            headers={"Authorization": f"Bearer {self.token1}"},
        )
        self.assertEqual(res_get.status_code, 200)
        loc = res_get.json()
        self.assertEqual(loc["city"], "Hyderabad")
        self.assertNotEqual(loc["city"], "Vijayawada", "Must not default to Vijayawada")

    def test_02_tenant_isolation_user2_unaffected(self):
        # User 2 has not recorded a location yet; should return 404, NOT user 1's location
        res = client.get(
            "/api/v1/location",
            headers={"Authorization": f"Bearer {self.token2}"},
        )
        self.assertEqual(res.status_code, 404, "User 2 must not see User 1's location")


if __name__ == "__main__":
    unittest.main()
