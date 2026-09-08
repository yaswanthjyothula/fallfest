"""
Tests for Visual Crossing Weather Service
=========================================
Verifies:
- Successful weather request (live/mocked)
- Coordinate bounds validation (-90 <= lat <= 90, -180 <= lon <= 180)
- API failure & rate limit handling (401, 429)
- Missing data tolerance
- Timeout exception mapping
- Malformed API response handling
- In-memory 1-hour TTL caching
"""

import unittest
from unittest.mock import patch, MagicMock
import httpx

from backend.services.visual_crossing_service import (
    VisualCrossingWeatherService,
    validate_coordinates,
    WeatherValidationError,
    WeatherServiceTimeoutError,
    WeatherServiceRateLimitError,
    WeatherServiceAPIError,
    WeatherServiceMalformedDataError,
    WeatherServiceError,
)


class TestVisualCrossingWeatherService(unittest.TestCase):
    def setUp(self):
        self.service = VisualCrossingWeatherService(
            api_key="TEST_KEY_FOR_MOCKING_12345",
            base_url="https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline",
        )

    def test_coordinate_validation_valid(self):
        lat, lon = validate_coordinates(30.9010, 75.8573)
        self.assertEqual(lat, 30.9010)
        self.assertEqual(lon, 75.8573)

        lat, lon = validate_coordinates("-45.5", "120.2")
        self.assertEqual(lat, -45.5)
        self.assertEqual(lon, 120.2)

    def test_coordinate_validation_invalid_latitude(self):
        with self.assertRaises(WeatherValidationError):
            validate_coordinates(95.0, 75.0)

        with self.assertRaises(WeatherValidationError):
            validate_coordinates(-91.0, 75.0)

    def test_coordinate_validation_invalid_longitude(self):
        with self.assertRaises(WeatherValidationError):
            validate_coordinates(25.0, 185.0)

        with self.assertRaises(WeatherValidationError):
            validate_coordinates(25.0, -181.0)

    def test_coordinate_validation_non_numeric(self):
        with self.assertRaises(WeatherValidationError):
            validate_coordinates("invalid_lat", 75.0)

    @patch("httpx.Client.get")
    def test_successful_current_weather(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "resolvedAddress": "Ludhiana, Punjab, India",
            "timezone": "Asia/Kolkata",
            "currentConditions": {
                "datetime": "12:00:00",
                "temp": 32.5,
                "feelslike": 35.0,
                "humidity": 62.0,
                "precip": 0.0,
                "windspeed": 14.5,
                "pressure": 1010.2,
                "cloudcover": 20.0,
                "solarradiation": 450.0,
                "conditions": "Partly Cloudy",
            },
            "days": [{"datetime": "2026-09-08", "temp": 32.5, "precip": 0.0}],
        }
        mock_get.return_value = mock_response

        # Use unique coords to avoid cache collision with other tests
        data = self.service.get_current_weather(30.123, 75.456)
        self.assertEqual(data["temperature_c"], 32.5)
        self.assertEqual(data["humidity_pct"], 62.0)
        self.assertEqual(data["conditions"], "Partly Cloudy")
        self.assertEqual(data["weather_provider"], "Visual Crossing Weather API")
        self.assertFalse(data["cached"])

    @patch("httpx.Client.get")
    def test_caching_behavior(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "resolvedAddress": "Test Farm Cache",
            "currentConditions": {"temp": 28.0, "humidity": 45.0, "precip": 0.0},
            "days": [{"temp": 28.0, "precip": 0.0}],
        }
        mock_get.return_value = mock_response

        lat, lon = 28.6139, 77.2090
        # Call 1: Fetches from API
        res1 = self.service.get_current_weather(lat, lon)
        self.assertFalse(res1["cached"])
        self.assertEqual(mock_get.call_count, 1)

        # Call 2: Must be served from in-memory cache
        res2 = self.service.get_current_weather(lat, lon)
        self.assertTrue(res2["cached"])
        # Network call count must still be 1
        self.assertEqual(mock_get.call_count, 1)

    @patch("httpx.Client.get")
    def test_timeout_handling(self, mock_get):
        mock_get.side_effect = httpx.TimeoutException("Connection timed out")

        with self.assertRaises(WeatherServiceTimeoutError):
            self.service.get_current_weather(12.9716, 77.5946)

    @patch("httpx.Client.get")
    def test_rate_limit_handling(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.text = "Too Many Requests"
        mock_get.return_value = mock_response

        with self.assertRaises(WeatherServiceRateLimitError):
            self.service.get_current_weather(19.0760, 72.8777)

    @patch("httpx.Client.get")
    def test_api_unauthorized_error(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.text = "Invalid API Key"
        mock_get.return_value = mock_response

        with self.assertRaises(WeatherServiceAPIError):
            self.service.get_current_weather(22.5726, 88.3639)

    @patch("httpx.Client.get")
    def test_malformed_json_response(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.side_effect = ValueError("Invalid JSON")
        mock_get.return_value = mock_response

        with self.assertRaises(WeatherServiceMalformedDataError):
            self.service.get_current_weather(13.0827, 80.2707)

    @patch("httpx.Client.get")
    def test_missing_fields_tolerance(self, mock_get):
        """Service should tolerate missing optional fields and provide sensible fallbacks."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "resolvedAddress": "Partial Data Coordinates",
            "currentConditions": {},  # completely empty currentConditions
            "days": [],
        }
        mock_get.return_value = mock_response

        res = self.service.get_current_weather(26.8467, 80.9462)
        self.assertIsNotNone(res["temperature_c"])
        self.assertIsNotNone(res["humidity_pct"])
        self.assertEqual(res["precipitation_mm"], 0.0)


if __name__ == "__main__":
    unittest.main()
