"""
AgriQuantum Backend Package
Provides FastAPI REST endpoints for quantum inference, agronomic optimization,
and model benchmarking.
"""

from .api import app

__all__ = ["app"]
