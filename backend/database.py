"""
AgriQuantum Database Connection & Session Management
=====================================================
Supports PostgreSQL (Supabase compatible) and SQLite with WAL mode.
Configurable via DATABASE_URL environment variable.
"""

import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agriquantum.db")

# Configure connection arguments based on database dialect
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    future=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a managed database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initializes all database tables and populates default baseline seed data."""
    from backend import models
    Base.metadata.create_all(bind=engine)
    seed_initial_data()


def seed_initial_data():
    """Seeds default verified farms, fields, model versions, and admin accounts if empty."""
    from backend import models
    from backend.auth import get_password_hash

    db = SessionLocal()
    try:
        # 1. Seed Admin & Agronomist Users
        admin_user = db.query(models.User).filter_by(email="admin@agriquantum.com").first()
        if not admin_user:
            admin_user = models.User(
                email="admin@agriquantum.com",
                hashed_password=get_password_hash("AgriQuantum2026!"),
                full_name="Dr. Aris Thorne",
                role="Administrator",
            )
            farmer_user = models.User(
                email="farmer@greenvalley.com",
                hashed_password=get_password_hash("FarmSecure2026!"),
                full_name="Rajesh Patel",
                role="Farmer",
            )
            db.add(admin_user)
            db.add(farmer_user)
            db.commit()
            db.refresh(admin_user)
            db.refresh(farmer_user)

            # 2. Seed Default Verified Farms
            farm_1 = models.Farm(
                user_id=farmer_user.id,
                name="Green Valley Agricultural Station",
                location="Coastal Alluvial Basin (Zone 4B)",
                state="Andhra Pradesh",
                country="India",
                latitude=16.5062,
                longitude=80.6480,
                total_area_hectares=120.0,
            )
            farm_2 = models.Farm(
                user_id=farmer_user.id,
                name="Deccan Precision Agro Center",
                location="Semi-Arid Plateau (Zone 7A)",
                state="Telangana",
                country="India",
                latitude=17.3850,
                longitude=78.4867,
                total_area_hectares=85.0,
            )
            db.add_all([farm_1, farm_2])
            db.commit()
            db.refresh(farm_1)
            db.refresh(farm_2)

            # 3. Seed Fields
            field_1 = models.Field(
                farm_id=farm_1.id,
                name="Plot 101 - Alluvial Basin",
                area_hectares=45.0,
                soil_type="Alluvial Loam",
                boundary_geojson='{"type":"Polygon","coordinates":[[[80.64,16.50],[80.66,16.50],[80.66,16.52],[80.64,16.52],[80.64,16.50]]]}',
            )
            field_2 = models.Field(
                farm_id=farm_1.id,
                name="Plot 102 - Riverine Terrace",
                area_hectares=35.0,
                soil_type="Sandy Clay Loam",
                boundary_geojson='{"type":"Polygon","coordinates":[[[80.67,16.51],[80.69,16.51],[80.69,16.53],[80.67,16.53],[80.67,16.51]]]}',
            )
            db.add_all([field_1, field_2])
            db.commit()

            # 4. Seed Active Model Version
            mv = models.ModelVersion(
                version_tag="v2.5.0",
                model_name="AgriQuantum QSVR",
                framework="Qiskit 2.x + Aer Simulator + Scikit-Learn SVR",
                parameters_json='{"qubits": 4, "reps": 2, "entanglement": "linear", "c_param": 10.0, "epsilon": 0.1, "feature_map": "ZZFeatureMap"}',
                is_active=True,
            )
            db.add(mv)
            db.commit()

    except Exception as e:
        db.rollback()
        print(f"Initial seed notice: {e}")
    finally:
        db.close()
