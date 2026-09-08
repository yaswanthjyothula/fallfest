"""
AgriQuantum Database & Relational Persistence Tests
===================================================
Verifies table creation, relationships, foreign keys, and CRUD operations.
"""

import unittest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

from backend.database import Base
from backend import models
from backend.auth import get_password_hash, verify_password


class TestDatabaseModels(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=test_engine)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=test_engine)

    def setUp(self):
        self.db = TestingSessionLocal()

    def tearDown(self):
        self.db.rollback()
        self.db.close()

    def test_user_creation_and_auth(self):
        """Test User model creation and bcrypt password verification."""
        hashed = get_password_hash("TestPassword123!")
        user = models.User(
            email="test_user@agriquantum.com",
            hashed_password=hashed,
            full_name="Agronomist User",
            role="Agronomist",
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        self.assertIsNotNone(user.id)
        self.assertEqual(user.email, "test_user@agriquantum.com")
        self.assertTrue(verify_password("TestPassword123!", user.hashed_password))

    def test_farm_and_field_relationship(self):
        """Test Farm and Field relationship with foreign keys."""
        user = models.User(
            email="farm_owner@agriquantum.com",
            hashed_password=get_password_hash("pass"),
            full_name="Owner",
            role="Farmer",
        )
        self.db.add(user)
        self.db.commit()

        farm = models.Farm(
            user_id=user.id,
            name="Test Delta Farm",
            location="Krishna Delta",
            latitude=16.5,
            longitude=80.6,
            total_area_hectares=50.0,
        )
        self.db.add(farm)
        self.db.commit()

        field = models.Field(
            farm_id=farm.id,
            name="Field A",
            area_hectares=25.0,
            soil_type="Black Cotton Soil",
        )
        self.db.add(field)
        self.db.commit()

        # Check relationships
        self.assertEqual(len(farm.fields), 1)
        self.assertEqual(farm.fields[0].name, "Field A")
        self.assertEqual(farm.fields[0].farm.name, "Test Delta Farm")

    def test_prediction_and_recommendation_models(self):
        """Test Prediction model persistence and Recommendation relationship."""
        user = models.User(email="pred_user@agriquantum.com", hashed_password="h", full_name="U", role="Farmer")
        self.db.add(user)
        self.db.commit()

        farm = models.Farm(user_id=user.id, name="F", location="L", latitude=0.0, longitude=0.0, total_area_hectares=10.0)
        self.db.add(farm)
        self.db.commit()

        field = models.Field(farm_id=farm.id, name="Field 1", area_hectares=10.0)
        self.db.add(field)
        self.db.commit()

        pred = models.Prediction(
            field_id=field.id,
            user_id=user.id,
            input_nitrogen=85.0,
            input_moisture=26.0,
            input_rainfall=600.0,
            input_ndvi=0.75,
            predicted_yield=36.4,
            unit="Quintals per Acre",
        )
        self.db.add(pred)
        self.db.commit()
        self.db.refresh(pred)

        rec = models.Recommendation(
            prediction_id=pred.id,
            current_nitrogen=85.0,
            recommended_nitrogen=95.0,
            delta_nitrogen=10.0,
            current_moisture=26.0,
            recommended_moisture=30.0,
            delta_moisture=4.0,
            supplemental_irrigation_mm=15.0,
            baseline_yield=36.4,
            optimized_yield=40.2,
            yield_increase_pct=10.4,
            cost_savings_inr_acre=1200.0,
            net_economic_benefit_inr_acre=9800.0,
            nitrogen_advisory="Increase top dressing",
            irrigation_advisory="Apply 15mm irrigation",
        )
        self.db.add(rec)
        self.db.commit()

        self.assertIsNotNone(pred.id)
        self.assertIsNotNone(rec.id)
        self.assertEqual(pred.recommendation.delta_nitrogen, 10.0)


if __name__ == "__main__":
    unittest.main()
