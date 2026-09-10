"""
AgriQuantum Production FastAPI Backend
======================================
Commercial Agritech REST API service with versioned /api/v1/ endpoints,
relational database persistence, rate limiting, security headers,
and Qiskit Aer Quantum Support Vector Regression inference.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from backend.database import init_db
from backend.security import SecurityHeadersMiddleware, RateLimitMiddleware
from backend.api_v1 import router as api_v1_router

# Initialize FastAPI App
app = FastAPI(
    title="AgriQuantum API",
    description="Precision Agronomy & Quantum Machine Learning Commercial SaaS Platform",
    version="2.5.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Attach Security & Performance Middlewares
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=150, window_seconds=60)

# 2. Configure CORS
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
env_origins = os.getenv("CORS_ORIGINS")
if env_origins:
    for o in env_origins.split(","):
        if o.strip() and o.strip() not in allowed_origins:
            allowed_origins.append(o.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Mount Versioned REST API v1
app.include_router(api_v1_router)


# 4. Lifecycle Event: Initialize Database & Seed
@app.on_event("startup")
def on_startup():
    init_db()


# 5. Root Status & Documentation Redirect
@app.get("/", tags=["System"])
def root():
    return {
        "platform": "AgriQuantum Precision Agriculture Platform",
        "status": "online",
        "api_version": "v1",
        "documentation": "/docs",
        "quantum_engine": "Ready (Qiskit Aer 4-Qubit ZZFeatureMap)",
    }


@app.get("/health", tags=["System"])
def health_redirect():
    return RedirectResponse(url="/api/v1/health")
