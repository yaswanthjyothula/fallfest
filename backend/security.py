"""
AgriQuantum Security, Rate Limiting & Audit Logging
===================================================
Production middleware for security headers, in-memory rate limiting,
and structured audit trail recording.
"""

import time
import json
from typing import Dict, List
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from sqlalchemy.orm import Session

from backend import models
from backend.database import SessionLocal


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Enforces essential production security headers on all HTTP responses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding-window in-memory rate limiter per client IP address.
    Default limit: 120 requests per minute per IP.
    """

    def __init__(self, app, max_requests: int = 120, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = {}

    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        # Clean old timestamps
        if client_ip in self.requests:
            self.requests[client_ip] = [t for t in self.requests[client_ip] if now - t < self.window_seconds]
        else:
            self.requests[client_ip] = []

        if len(self.requests[client_ip]) >= self.max_requests:
            return Response(
                content=json.dumps({"detail": "Rate limit exceeded. Please retry in a minute."}),
                status_code=429,
                media_type="application/json",
            )

        self.requests[client_ip].append(now)
        return await call_next(request)


def log_audit_event(
    action: str,
    resource: str,
    user_id: int = None,
    ip_address: str = None,
    details: dict = None,
):
    """Records an immutable audit trail entry in the database."""
    db: Session = SessionLocal()
    try:
        audit_entry = models.AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            ip_address=ip_address,
            details_json=json.dumps(details) if details else None,
        )
        db.add(audit_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Audit log failure: {e}")
    finally:
        db.close()
