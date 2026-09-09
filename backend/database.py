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
    """Seeds default active model version and verified test users if empty."""
    from backend import models
    from backend.auth import get_password_hash

    db = SessionLocal()
    try:
        # 1. Seed Active Model Version
        mv = db.query(models.ModelVersion).filter_by(version_tag="v2.5.0").first()
        if not mv:
            mv = models.ModelVersion(
                version_tag="v2.5.0",
                model_name="AgriQuantum QSVR",
                framework="Qiskit 2.x + Aer Simulator + Scikit-Learn SVR",
                parameters_json='{"qubits": 4, "reps": 2, "entanglement": "linear", "c_param": 10.0, "epsilon": 0.1, "feature_map": "ZZFeatureMap"}',
                is_active=True,
            )
            db.add(mv)
            db.commit()

        # 2. Seed Test Profile for Yaswanth
        test_user = db.query(models.User).filter_by(email="test@gmail.com").first()
        if not test_user:
            test_user = models.User(
                email="test@gmail.com",
                hashed_password=get_password_hash("test123"),
                full_name="Yaswanth",
                role="Farmer",
            )
            db.add(test_user)
            db.commit()
        else:
            if test_user.full_name != "Yaswanth":
                test_user.full_name = "Yaswanth"
                db.commit()

        # 3. Seed Admin User
        admin_user = db.query(models.User).filter_by(email="admin@agriquantum.com").first()
        if not admin_user:
            admin_user = models.User(
                email="admin@agriquantum.com",
                hashed_password=get_password_hash("AgriQuantum2026!"),
                full_name="System Administrator",
                role="Administrator",
            )
            db.add(admin_user)
            db.commit()

    except Exception as e:
        db.rollback()
        print(f"Initial seed notice: {e}")
    finally:
        db.close()

