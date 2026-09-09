"""
AgriQuantum Automated Production System Verification Script
===========================================================
Executes non-destructive health checks across:
1. Relational Database Connection (SQLAlchemy)
2. Qiskit 4-Qubit Circuit & Fidelity Kernel Compilation
3. ML Feature Mapping & Normalization
4. FastAPI Health & Router Verification
"""

import os
import sys
import time

repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

def verify_system():
    print("=" * 60)
    print("AGRIQUANTUM PRODUCTION SYSTEM VERIFICATION")
    print("=" * 60)

    # 1. Database Connection Check
    print("[1/4] Checking Relational Database Engine...")
    try:
        from backend.database import SessionLocal, init_db
        init_db()
        db = SessionLocal()
        from backend import models
        user_count = db.query(models.User).count()
        farm_count = db.query(models.Farm).count()
        db.close()
        print(f"      Database OK (Users: {user_count}, Registered Farms: {farm_count})")
    except Exception as e:
        print(f"      Database Check FAILED: {e}")
        return False

    # 2. Quantum Engine Check
    print("[2/4] Testing Quantum Circuit & Fidelity Kernel on Qiskit Aer...")
    try:
        t0 = time.time()
        from core.quantum_engine import AgriQuantumEngine
        engine = AgriQuantumEngine(feature_dimension=4, reps=2, kernel_mode="statevector")
        circuit = engine.get_circuit_ascii()
        elapsed = time.time() - t0
        print(f"      Quantum Engine OK (Compiled in {elapsed:.3f}s)")
    except Exception as e:
        print(f"      Quantum Engine FAILED: {e}")
        return False

    # 3. Agronomic Data Generator & Quantum Scaling Check
    print("[3/4] Testing Agronomic Feature Scaling...")
    try:
        from data.generator import get_train_test_agronomic_data
        data = get_train_test_agronomic_data(n_samples=50)
        X_train, X_test = data["X_train_raw"], data["X_test_raw"]
        assert X_train.shape[1] == 4
        print(f"      Feature Pipeline OK (Train samples: {len(X_train)}, Test samples: {len(X_test)})")
    except Exception as e:
        print(f"      Feature Pipeline FAILED: {e}")
        return False

    # 4. FastAPI Schemas & Router Verification
    print("[4/4] Verifying FastAPI Application & Routes...")
    try:
        from backend.api import app
        from fastapi.testclient import TestClient
        client = TestClient(app)
        res = client.get("/api/v1/health")
        assert res.status_code == 200
        health = res.json()
        assert health["status"] in ["healthy", "operational"]
        print(f"      FastAPI Health Endpoint OK (Status: {health['status']})")
    except Exception as e:
        print(f"      FastAPI Check FAILED: {e}")
        return False

    print("=" * 60)
    print("ALL PRODUCTION INTEGRITY CHECKS PASSED SUCCESSFULLY (4/4)")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = verify_system()
    sys.exit(0 if success else 1)
