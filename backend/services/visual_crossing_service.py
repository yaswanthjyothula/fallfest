"""
AgriQuantum - Visual Crossing Weather Service
============================================
Dedicated, production-grade agro-meteorological service integrating
the Visual Crossing Weather Timeline API.

Features:
- Global current, forecast (up to 15 days), and historical weather retrieval
- Rigorous coordinate validation (-90 <= lat <= 90, -180 <= lon <= 180)
- In-memory 1-hour TTL caching to conserve 1,000 req/day quota
- Comprehensive error handling (timeout, rate limit, malformed data, API error)
- Agricultural metrics: Temp, Precipitation, Humidity, Solar Radiation, Wind, Pressure, Clouds
- Database persistence to `weather_observations` table
"""

import os
import time
import logging
from datetime import datetime, date, timedelta
from typing import Any, Dict, List, Optional, Tuple
from pathlib import Path
import httpx
from sqlalchemy.orm import Session

logger = logging.getLogger("agriquantum.weather.visual_crossing")

# Load environment variables if not loaded
def _load_env():
    env_path = Path(".env")
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip().strip('"').strip("'")
                    if k not in os.environ:
                        os.environ[k] = v

_load_env()

DEFAULT_API_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline"
CACHE_TTL_SECONDS = 3600  # 1 hour cache TTL
_WEATHER_CACHE: Dict[str, Tuple[float, Dict[str, Any]]] = {}


# Custom Exception Hierarchy
class WeatherServiceError(Exception):
    """Base exception for weather service errors."""
    pass


class WeatherValidationError(WeatherServiceError):
    """Raised when coordinates or parameters fail validation."""
    pass


class WeatherServiceTimeoutError(WeatherServiceError):
    """Raised when the third-party weather API times out."""
    pass


class WeatherServiceRateLimitError(WeatherServiceError):
    """Raised when the weather API returns HTTP 429 Too Many Requests."""
    pass


class WeatherServiceAPIError(WeatherServiceError):
    """Raised when the weather API returns an unhandled HTTP error."""
    pass


class WeatherServiceMalformedDataError(WeatherServiceError):
    """Raised when the API returns an unexpected payload or JSON decode error."""
    pass


def _safe_float(val: Any, default: float = 0.0) -> float:
    """Safely converts numeric or None values to float without throwing TypeError."""
    if val is None:
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def validate_coordinates(latitude: float, longitude: float) -> Tuple[float, float]:
    """
    Validates that latitude and longitude fall within standard geographical bounds.
    """
    try:
        lat = float(latitude)
        lon = float(longitude)
    except (ValueError, TypeError):
        raise WeatherValidationError(f"Coordinates must be numeric. Received: lat={latitude}, lon={longitude}")

    if not (-90.0 <= lat <= 90.0):
        raise WeatherValidationError(f"Latitude must be between -90.0 and 90.0 degrees. Received: {lat}")
    if not (-180.0 <= lon <= 180.0):
        raise WeatherValidationError(f"Longitude must be between -180.0 and 180.0 degrees. Received: {lon}")

    return lat, lon


class VisualCrossingWeatherService:
    """
    Service client for Visual Crossing Weather Timeline API.
    """

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key or os.getenv("VISUAL_CROSSING_API_KEY", "")
        self.base_url = (base_url or os.getenv("VISUAL_CROSSING_API_URL", DEFAULT_API_URL)).rstrip("/")
        self.timeout = 10.0

    def is_configured(self) -> bool:
        """Returns True if a valid API key is present."""
        return bool(self.api_key and len(self.api_key.strip()) >= 10)

    def _get_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        if cache_key in _WEATHER_CACHE:
            ts, val = _WEATHER_CACHE[cache_key]
            if time.time() - ts < CACHE_TTL_SECONDS:
                logger.debug(f"Cache hit for weather key: {cache_key}")
                cached_copy = val.copy()
                cached_copy["cached"] = True
                return cached_copy
            else:
                del _WEATHER_CACHE[cache_key]
        return None

    def _set_cache(self, cache_key: str, data: Dict[str, Any]):
        _WEATHER_CACHE[cache_key] = (time.time(), data)

    def _execute_api_query(self, endpoint_suffix: str, params: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Executes a GET request against Visual Crossing Weather API with robust error handling.
        """
        if not self.is_configured():
            raise WeatherServiceError(
                "VISUAL_CROSSING_API_KEY is not configured in environment. "
                "Please configure a valid API key in .env."
            )

        query_params = {
            "unitGroup": "metric",
            "key": self.api_key,
            "contentType": "json",
            "include": "current,days,hours",
        }
        if params:
            query_params.update(params)

        url = f"{self.base_url}/{endpoint_suffix}"

        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(url, params=query_params)
        except httpx.TimeoutException as e:
            logger.error(f"Visual Crossing API request timed out for {endpoint_suffix}: {e}")
            raise WeatherServiceTimeoutError("Visual Crossing Weather API connection timed out. Please try again.") from e
        except httpx.RequestError as e:
            logger.error(f"Visual Crossing network request failed: {e}")
            raise WeatherServiceError(f"Network error communicating with weather provider: {str(e)}") from e

        if resp.status_code == 429:
            logger.error("Visual Crossing quota or rate limit exceeded.")
            raise WeatherServiceRateLimitError("Visual Crossing rate limit or daily quota exceeded (1,000 records/day).")
        elif resp.status_code == 401 or resp.status_code == 403:
            logger.error("Visual Crossing unauthorized API key.")
            raise WeatherServiceAPIError("Invalid Visual Crossing API credentials. Check VISUAL_CROSSING_API_KEY.")
        elif resp.status_code == 400:
            logger.error(f"Visual Crossing Bad Request: {resp.text}")
            raise WeatherValidationError(f"Invalid weather query parameters: {resp.text}")
        elif resp.status_code != 200:
            logger.error(f"Visual Crossing API unexpected status {resp.status_code}: {resp.text}")
            raise WeatherServiceAPIError(f"Weather provider returned error status {resp.status_code}.")

        try:
            data = resp.json()
        except Exception as e:
            logger.error(f"Failed to parse JSON response from Visual Crossing: {e}")
            raise WeatherServiceMalformedDataError("Weather provider returned invalid or malformed data.") from e

        return data

    def get_current_weather(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Retrieves current agro-meteorological observations for coordinates.
        """
        lat, lon = validate_coordinates(latitude, longitude)
        cache_key = f"current_{round(lat, 3)}_{round(lon, 3)}"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        data = self._execute_api_query(f"{lat},{lon}")
        current = data.get("currentConditions", {})
        today_day = (data.get("days") or [{}])[0]

        result = {
            "latitude": lat,
            "longitude": lon,
            "resolved_address": data.get("resolvedAddress", f"{lat}, {lon}"),
            "timezone": data.get("timezone", "UTC"),
            "observed_at": str(current.get("datetime") or datetime.utcnow().strftime("%H:%M:%S")),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "temperature_c": _safe_float(current.get("temp"), _safe_float(today_day.get("temp"), 25.0)),
            "feels_like_c": _safe_float(current.get("feelslike"), _safe_float(current.get("temp"), 25.0)),
            "humidity_pct": _safe_float(current.get("humidity"), 50.0),
            "dew_point_c": _safe_float(current.get("dew"), 15.0),
            "precipitation_mm": _safe_float(current.get("precip"), _safe_float(today_day.get("precip"), 0.0)),
            "precip_prob_pct": _safe_float(current.get("precipprob"), _safe_float(today_day.get("precipprob"), 0.0)),
            "wind_speed_kmh": _safe_float(current.get("windspeed"), 10.0),
            "wind_gust_kmh": _safe_float(current.get("windgust")) if current.get("windgust") is not None else None,
            "wind_direction_deg": _safe_float(current.get("winddir"), 0.0),
            "pressure_hpa": _safe_float(current.get("pressure"), 1013.25),
            "cloud_coverage_pct": _safe_float(current.get("cloudcover"), 0.0),
            "solar_radiation_wm2": _safe_float(current.get("solarradiation"), 200.0),
            "uv_index": _safe_float(current.get("uvindex"), 5.0),
            "visibility_km": _safe_float(current.get("visibility"), 10.0),
            "conditions": str(current.get("conditions") or "Clear"),
            "weather_provider": "Visual Crossing Weather API",
            "cached": False,
        }

        self._set_cache(cache_key, result)
        return result

    def get_forecast_weather(self, latitude: float, longitude: float, days: int = 7) -> Dict[str, Any]:
        """
        Retrieves daily agricultural weather forecast for coordinates.
        """
        lat, lon = validate_coordinates(latitude, longitude)
        days = max(1, min(days, 15))
        cache_key = f"forecast_{round(lat, 3)}_{round(lon, 3)}_{days}"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        data = self._execute_api_query(f"{lat},{lon}")
        raw_days = data.get("days", [])[:days]

        forecast_list = []
        for d in raw_days:
            forecast_list.append({
                "date": str(d.get("datetime")),
                "temp_max_c": _safe_float(d.get("tempmax"), _safe_float(d.get("temp"), 30.0)),
                "temp_min_c": _safe_float(d.get("tempmin"), _safe_float(d.get("temp"), 20.0)),
                "temp_mean_c": _safe_float(d.get("temp"), 25.0),
                "precipitation_mm": _safe_float(d.get("precip"), 0.0),
                "precip_prob_pct": _safe_float(d.get("precipprob"), 0.0),
                "humidity_pct": _safe_float(d.get("humidity"), 50.0),
                "solar_radiation_wm2": _safe_float(d.get("solarradiation"), 200.0),
                "wind_speed_kmh": _safe_float(d.get("windspeed"), 10.0),
                "cloud_cover_pct": _safe_float(d.get("cloudcover"), 0.0),
                "conditions": str(d.get("conditions") or "Partly Cloudy"),
                "description": str(d.get("description") or ""),
            })

        result = {
            "latitude": lat,
            "longitude": lon,
            "resolved_address": data.get("resolvedAddress", f"{lat}, {lon}"),
            "forecast_days_count": len(forecast_list),
            "forecast": forecast_list,
            "weather_provider": "Visual Crossing Weather API",
            "cached": False,
        }

        self._set_cache(cache_key, result)
        return result

    def get_historical_weather(
        self,
        latitude: float,
        longitude: float,
        start_date: str,
        end_date: str,
    ) -> Dict[str, Any]:
        """
        Retrieves historical weather records between start_date and end_date (YYYY-MM-DD).
        """
        lat, lon = validate_coordinates(latitude, longitude)
        try:
            d_start = datetime.strptime(start_date, "%Y-%m-%d").date()
            d_end = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            raise WeatherValidationError("Dates must follow the YYYY-MM-DD format.")

        if d_start > d_end:
            raise WeatherValidationError("start_date cannot be later than end_date.")

        cache_key = f"hist_{round(lat, 3)}_{round(lon, 3)}_{start_date}_{end_date}"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        endpoint = f"{lat},{lon}/{start_date}/{end_date}"
        data = self._execute_api_query(endpoint)
        raw_days = data.get("days", [])

        history_list = []
        for d in raw_days:
            history_list.append({
                "date": str(d.get("datetime")),
                "temp_max_c": _safe_float(d.get("tempmax"), _safe_float(d.get("temp"), 28.0)),
                "temp_min_c": _safe_float(d.get("tempmin"), _safe_float(d.get("temp"), 18.0)),
                "temp_mean_c": _safe_float(d.get("temp"), 23.0),
                "precipitation_mm": _safe_float(d.get("precip"), 0.0),
                "humidity_pct": _safe_float(d.get("humidity"), 55.0),
                "solar_radiation_wm2": _safe_float(d.get("solarradiation"), 180.0),
                "wind_speed_kmh": _safe_float(d.get("windspeed"), 12.0),
                "conditions": str(d.get("conditions") or "Clear"),
            })

        result = {
            "latitude": lat,
            "longitude": lon,
            "start_date": start_date,
            "end_date": end_date,
            "records_count": len(history_list),
            "history": history_list,
            "weather_provider": "Visual Crossing Weather API",
            "cached": False,
        }

        self._set_cache(cache_key, result)
        return result

    def get_farm_weather(
        self,
        farm_id: int,
        db: Optional[Session] = None,
        persist: bool = True,
    ) -> Dict[str, Any]:
        """
        Consolidated weather retrieval for a farm:
        - Current conditions
        - 7-Day agricultural forecast
        - 7-Day historical rainfall and temperature trend
        - Optional persistence to PostgreSQL/SQLite weather_observations table
        """
        from backend import models

        # Default fallback coordinates if farm not found in DB
        lat = 30.9010
        lon = 75.8573
        farm_name = f"Farm #{farm_id}"

        if db is not None:
            farm = db.query(models.Farm).filter(models.Farm.id == farm_id).first()
            if farm:
                lat = farm.latitude
                lon = farm.longitude
                farm_name = farm.name

        # 1. Fetch current weather
        current = self.get_current_weather(lat, lon)

        # 2. Fetch 7-day forecast
        forecast_res = self.get_forecast_weather(lat, lon, days=7)

        # 3. Fetch past 7 days history
        today = date.today()
        start_past = (today - timedelta(days=7)).strftime("%Y-%m-%d")
        end_past = (today - timedelta(days=1)).strftime("%Y-%m-%d")
        try:
            history_res = self.get_historical_weather(lat, lon, start_past, end_past)
        except Exception as e:
            logger.warning(f"Could not retrieve historical weather: {e}")
            history_res = {"history": []}

        # 4. Compute agricultural impacts
        tot_hist_rain = sum(d["precipitation_mm"] for d in history_res.get("history", []))
        tot_fore_rain = sum(d["precipitation_mm"] for d in forecast_res.get("forecast", []))
        avg_temp = current["temperature_c"]

        if tot_fore_rain > 40.0:
            rain_impact = "High precipitation expected. Delay scheduled irrigation and monitor plot drainage."
        elif tot_fore_rain < 5.0:
            rain_impact = "Dry spell ahead. Supplemental micro-irrigation recommended within 48 hours."
        else:
            rain_impact = "Adequate seasonal moisture. Normal vegetative transpiration supported."

        if avg_temp > 35.0:
            temp_impact = "Elevated thermal conditions. High evapotranspiration rate; maintain canopy hydration."
        else:
            temp_impact = "Optimal thermal accumulation supporting stem elongation and tillering."

        # 5. Persist observation to database if requested
        if persist and db is not None:
            try:
                obs = models.WeatherObservation(
                    farm_id=farm_id,
                    recorded_at=datetime.utcnow(),
                    temperature=current["temperature_c"],
                    rainfall=current["precipitation_mm"],
                    humidity=current["humidity_pct"],
                    solar_radiation=current["solar_radiation_wm2"],
                    wind_speed=current["wind_speed_kmh"],
                    source="Visual Crossing",
                )
                db.add(obs)
                db.commit()
            except Exception as _db_err:
                logger.warning(f"Could not persist weather observation to DB: {_db_err}")
                db.rollback()

        return {
            "farm_id": farm_id,
            "farm_name": farm_name,
            "latitude": lat,
            "longitude": lon,
            "current": current,
            "forecast": forecast_res.get("forecast", []),
            "history_7d": history_res.get("history", []),
            "summary": {
                "historical_rainfall_7d_mm": round(tot_hist_rain, 1),
                "forecast_rainfall_7d_mm": round(tot_fore_rain, 1),
                "precipitation_impact_advisory": rain_impact,
                "temperature_impact_advisory": temp_impact,
            },
            "weather_provider": "Visual Crossing Weather API",
        }


# Singleton service instance
_weather_service_instance: Optional[VisualCrossingWeatherService] = None


def get_visual_crossing_service() -> VisualCrossingWeatherService:
    """Returns the singleton instance of VisualCrossingWeatherService."""
    global _weather_service_instance
    if _weather_service_instance is None:
        _weather_service_instance = VisualCrossingWeatherService()
    return _weather_service_instance
