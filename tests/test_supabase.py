"""
Tests for Supabase Cloud Service Integration
"""

import unittest
from backend.services.supabase_service import (
    get_supabase_client,
    get_supabase_status,
    sync_prediction_to_supabase,
)


class TestSupabaseService(unittest.TestCase):
    def test_client_initialization(self):
        client = get_supabase_client()
        self.assertIsNotNone(client, "Supabase client should be successfully initialized.")
        self.assertTrue(hasattr(client, "storage"), "Client should have storage client.")
        self.assertTrue(hasattr(client, "table"), "Client should have table/postgrest client.")

    def test_supabase_connectivity_status(self):
        status = get_supabase_status()
        self.assertTrue(status.get("configured"), "Supabase should be configured.")
        self.assertTrue(status.get("connected"), "Supabase connection probe should succeed.")
        self.assertEqual(status.get("project_id"), "arbykwiinhpaymeuzhtl")
        self.assertIn("https://arbykwiinhpaymeuzhtl.supabase.co", status.get("url"))

    def test_sync_prediction_graceful_handling(self):
        dummy_pred = {
            "field_id": 1,
            "user_id": 1,
            "input_nitrogen": 75.0,
            "input_moisture": 35.0,
            "input_rainfall": 650.0,
            "input_ndvi": 0.72,
            "crop_type": "Winter Wheat",
            "predicted_yield": 38.4,
            "unit": "Quintals per Acre",
            "confidence_score": 98.2,
            "status": "Complete",
        }
        res = sync_prediction_to_supabase(dummy_pred)
        self.assertIn("synced", res)
        # Even if remote table isn't created yet or RLS blocks anon insert, it must handle gracefully without crashing
        self.assertIsInstance(res["synced"], bool)


if __name__ == "__main__":
    unittest.main()
