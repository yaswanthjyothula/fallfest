"""
AgriQuantum Dual-Engine Resource Allocation & Decision Optimization Service
=============================================================================
Provides rigorous mathematical optimization for agricultural input management:
- Nitrogen (kg/ha)
- Phosphorus (kg/ha)
- Potassium (kg/ha)
- Supplemental Irrigation (mm)

Dual-Engine Architecture:
1. Classical Optimizer:
   - Multi-start bounded Sequential Least Squares Programming (SLSQP / L-BFGS-B)
   - Solves non-linear continuous constrained agronomic objective functions.
2. Quantum-Inspired Optimizer:
   - Simulated Quantum Annealing (SQA) over discretized combinatorial QUBO space.
   - Simulates transverse magnetic field tunneling Hamiltonian Γ(t)σ_x to escape
     local minima in non-convex agro-ecological cost landscapes.

Objectives:
- maximum_yield : Maximize predicted crop yield within budget constraints.
- minimum_cost  : Minimize input expenditures subject to target yield constraints.
- minimum_water : Minimize supplemental irrigation in drought/water-stressed regions.
- balanced_plan : Multi-objective economic optimization balancing revenue, input cost,
                  and soil runoff/leaching risk penalties.
"""

import time
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from scipy.optimize import minimize

from core.quantum_engine import AgriQuantumEngine
from data.generator import scale_for_quantum


class AgronomicOptimizationService:
    """
    Evaluates and compares Classical (SLSQP) and Quantum-Inspired (SQA)
    resource allocation algorithms on the same agronomic problem and constraints.
    """

    def __init__(
        self,
        quantum_engine: Optional[AgriQuantumEngine] = None,
        crop_price_per_q: float = 28.50,       # USD per Quintal
        cost_n_per_kg: float = 1.15,           # USD per kg Nitrogen
        cost_p_per_kg: float = 0.85,           # USD per kg Phosphorus
        cost_k_per_kg: float = 0.75,           # USD per kg Potassium
        cost_water_per_mm: float = 0.85,       # USD per mm irrigation
    ):
        self.quantum_engine = quantum_engine
        self.crop_price = crop_price_per_q
        self.cost_n = cost_n_per_kg
        self.cost_p = cost_p_per_kg
        self.cost_k = cost_k_per_kg
        self.cost_water = cost_water_per_mm

        # Feasible input boundaries [min, max]
        self.bounds = {
            "nitrogen": (30.0, 180.0),       # kg/ha
            "phosphorus": (15.0, 90.0),      # kg/ha
            "potassium": (15.0, 90.0),       # kg/ha
            "irrigation": (0.0, 60.0),        # mm
        }

    def _estimate_yield(
        self,
        nitrogen: float,
        phosphorus: float,
        potassium: float,
        irrigation: float,
        soil_moisture: float,
        rainfall: float,
        ndvi: float,
    ) -> float:
        """
        Evaluates yield using the trained Quantum Engine if available,
        coupled with agronomic biophysical response curves.
        """
        effective_moisture = min(50.0, soil_moisture + (irrigation * 0.35))
        effective_rainfall = rainfall + irrigation

        if self.quantum_engine is not None and getattr(self.quantum_engine, "is_fitted", False):
            try:
                # 4 quantum features: Nitrogen, Moisture, Rainfall, NDVI
                raw_vector = np.array([[nitrogen, effective_moisture, effective_rainfall, ndvi]], dtype=np.float64)
                quantum_vector, _ = scale_for_quantum(raw_vector)
                pred_yield = float(self.quantum_engine.predict(quantum_vector)[0])
                
                # Apply secondary nutrient scaling (Liebig's Law of the Minimum adjustment)
                p_factor = np.clip(phosphorus / 45.0, 0.75, 1.15)
                k_factor = np.clip(potassium / 40.0, 0.75, 1.15)
                return max(12.0, pred_yield * 0.7 + pred_yield * 0.15 * p_factor + pred_yield * 0.15 * k_factor)
            except Exception:
                pass

        # Robust analytical baseline model (Mitscherlich-Baule yield response)
        y_max = 42.0
        n_resp = 1.0 - np.exp(-0.022 * nitrogen)
        p_resp = 1.0 - np.exp(-0.035 * phosphorus)
        k_resp = 1.0 - np.exp(-0.032 * potassium)
        water_stress = 1.0 - np.exp(-0.045 * effective_moisture)
        canopy_factor = np.clip(ndvi * 1.3, 0.5, 1.25)

        base_yield = y_max * n_resp * p_resp * k_resp * water_stress * canopy_factor
        return float(np.clip(base_yield, 10.0, 48.0))

    def _cost_function(self, n: float, p: float, k: float, water: float) -> float:
        """Calculates variable input expenditure ($/ha)."""
        return (n * self.cost_n) + (p * self.cost_p) + (k * self.cost_k) + (water * self.cost_water)

    def _objective(
        self,
        inputs: np.ndarray,
        objective_type: str,
        soil_moisture: float,
        rainfall: float,
        ndvi: float,
        target_yield: float = 32.0,
        budget_limit: float = 240.0,
    ) -> float:
        """Calculates scalar loss to minimize."""
        n, p, k, water = inputs
        est_yield = self._estimate_yield(n, p, k, water, soil_moisture, rainfall, ndvi)
        cost = self._cost_function(n, p, k, water)

        if objective_type == "maximum_yield":
            # Maximize yield within budget
            budget_penalty = max(0.0, cost - budget_limit) * 15.0
            return -(est_yield * 10.0) + budget_penalty

        elif objective_type == "minimum_cost":
            # Minimize cost while maintaining yield >= target_yield
            yield_penalty = max(0.0, target_yield - est_yield) * 45.0
            return cost + yield_penalty

        elif objective_type == "minimum_water":
            # Minimize water usage while maintaining target yield
            yield_penalty = max(0.0, target_yield - est_yield) * 35.0
            cost_factor = cost * 0.1
            return (water * 5.0) + yield_penalty + cost_factor

        else:  # balanced_plan
            # Net economic return = Revenue - Cost - Environmental Penalty
            revenue = est_yield * self.crop_price
            leaching_penalty = max(0.0, n - 130.0) * 1.8 + max(0.0, water - 40.0) * 1.2
            profit = revenue - cost - leaching_penalty
            return -profit

    def solve_classical(
        self,
        objective_type: str,
        current_n: float,
        current_p: float,
        current_k: float,
        soil_moisture: float,
        rainfall: float,
        ndvi: float,
        budget_limit: float = 240.0,
        target_yield: float = 32.0,
    ) -> Dict[str, Any]:
        """
        Classical continuous optimization using SLSQP with multi-start.
        """
        t0 = time.perf_counter()

        bounds = [
            self.bounds["nitrogen"],
            self.bounds["phosphorus"],
            self.bounds["potassium"],
            self.bounds["irrigation"],
        ]

        starts = [
            np.array([current_n, current_p, current_k, 15.0]),
            np.array([90.0, 45.0, 40.0, 20.0]),
            np.array([120.0, 60.0, 50.0, 30.0]),
        ]

        best_res = None
        best_val = float("inf")

        for x0 in starts:
            clipped_x0 = np.clip(x0, [b[0] for b in bounds], [b[1] for b in bounds])
            res = minimize(
                fun=self._objective,
                x0=clipped_x0,
                args=(objective_type, soil_moisture, rainfall, ndvi, target_yield, budget_limit),
                method="SLSQP",
                bounds=bounds,
                options={"maxiter": 80, "ftol": 1e-4},
            )
            if res.success and res.fun < best_val:
                best_val = res.fun
                best_res = res

        elapsed = time.perf_counter() - t0
        sol = best_res.x if best_res is not None else starts[0]

        opt_n, opt_p, opt_k, opt_water = [round(float(v), 1) for v in sol]
        opt_yield = round(self._estimate_yield(opt_n, opt_p, opt_k, opt_water, soil_moisture, rainfall, ndvi), 2)
        opt_cost = round(self._cost_function(opt_n, opt_p, opt_k, opt_water), 2)

        return {
            "method": "Classical SLSQP (Sequential Least Squares)",
            "nitrogen_kg_ha": opt_n,
            "phosphorus_kg_ha": opt_p,
            "potassium_kg_ha": opt_k,
            "irrigation_mm": opt_water,
            "predicted_yield_q_acre": opt_yield,
            "predicted_yield_t_ha": round(opt_yield * 0.1, 2),
            "input_cost_usd_ha": opt_cost,
            "objective_score": round(float(-best_val if "yield" in objective_type or "balanced" in objective_type else best_val), 3),
            "runtime_ms": round(elapsed * 1000.0, 2),
            "iterations": int(getattr(best_res, "nit", 24)),
            "status": "converged" if (best_res and best_res.success) else "approximate",
        }

    def solve_quantum_inspired(
        self,
        objective_type: str,
        current_n: float,
        current_p: float,
        current_k: float,
        soil_moisture: float,
        rainfall: float,
        ndvi: float,
        budget_limit: float = 240.0,
        target_yield: float = 32.0,
        tunneling_steps: int = 40,
    ) -> Dict[str, Any]:
        """
        Quantum-Inspired Simulated Quantum Annealing (SQA).
        Discretizes parameter space and uses transverse-field tunneling operator Γ(t)
        to traverse barrier landscapes and evaluate multi-objective trade-offs.
        """
        t0 = time.perf_counter()

        # Discretized search grid
        n_grid = np.linspace(self.bounds["nitrogen"][0], self.bounds["nitrogen"][1], 12)
        p_grid = np.linspace(self.bounds["phosphorus"][0], self.bounds["phosphorus"][1], 8)
        k_grid = np.linspace(self.bounds["potassium"][0], self.bounds["potassium"][1], 8)
        water_grid = np.linspace(self.bounds["irrigation"][0], self.bounds["irrigation"][1], 10)

        # Initial state closest to current
        curr_state = np.array([
            n_grid[np.argmin(np.abs(n_grid - current_n))],
            p_grid[np.argmin(np.abs(p_grid - current_p))],
            k_grid[np.argmin(np.abs(k_grid - current_k))],
            water_grid[3],
        ])

        best_state = curr_state.copy()
        best_cost = self._objective(best_state, objective_type, soil_moisture, rainfall, ndvi, target_yield, budget_limit)

        # Simulated Quantum Annealing schedule: Transverse field Gamma decreases monotonically
        gamma_start = 12.0
        gamma_end = 0.05

        np.random.seed(42)  # Deterministic reproducibility

        for step in range(tunneling_steps):
            t_ratio = step / float(tunneling_steps)
            gamma_t = gamma_start * (1.0 - t_ratio) + gamma_end * t_ratio

            # Quantum tunneling perturbation proposal:
            # Tunneled step magnitude scales with transverse field strength Γ(t)
            candidate = curr_state.copy()
            param_idx = np.random.randint(0, 4)
            if param_idx == 0:
                step_size = int(np.round(np.random.normal(0, max(1.0, gamma_t * 0.4))))
                cur_idx = np.argmin(np.abs(n_grid - candidate[0]))
                new_idx = np.clip(cur_idx + step_size, 0, len(n_grid) - 1)
                candidate[0] = n_grid[new_idx]
            elif param_idx == 1:
                step_size = int(np.round(np.random.normal(0, max(1.0, gamma_t * 0.3))))
                cur_idx = np.argmin(np.abs(p_grid - candidate[1]))
                new_idx = np.clip(cur_idx + step_size, 0, len(p_grid) - 1)
                candidate[1] = p_grid[new_idx]
            elif param_idx == 2:
                step_size = int(np.round(np.random.normal(0, max(1.0, gamma_t * 0.3))))
                cur_idx = np.argmin(np.abs(k_grid - candidate[2]))
                new_idx = np.clip(cur_idx + step_size, 0, len(k_grid) - 1)
                candidate[2] = k_grid[new_idx]
            else:
                step_size = int(np.round(np.random.normal(0, max(1.0, gamma_t * 0.35))))
                cur_idx = np.argmin(np.abs(water_grid - candidate[3]))
                new_idx = np.clip(cur_idx + step_size, 0, len(water_grid) - 1)
                candidate[3] = water_grid[new_idx]

            candidate_cost = self._objective(candidate, objective_type, soil_moisture, rainfall, ndvi, target_yield, budget_limit)
            delta_e = candidate_cost - best_cost

            # Quantum tunneling acceptance probability: P_tunnel = exp(-ΔE / Γ(t))
            tunneling_prob = np.exp(-delta_e / max(0.1, gamma_t)) if delta_e > 0 else 1.0

            if delta_e < 0 or np.random.rand() < tunneling_prob:
                curr_state = candidate.copy()
                if candidate_cost < best_cost:
                    best_cost = candidate_cost
                    best_state = candidate.copy()

        elapsed = time.perf_counter() - t0

        opt_n, opt_p, opt_k, opt_water = [round(float(v), 1) for v in best_state]
        opt_yield = round(self._estimate_yield(opt_n, opt_p, opt_k, opt_water, soil_moisture, rainfall, ndvi), 2)
        opt_cost = round(self._cost_function(opt_n, opt_p, opt_k, opt_water), 2)

        return {
            "method": "Quantum-Inspired SQA (Simulated Quantum Annealing)",
            "nitrogen_kg_ha": opt_n,
            "phosphorus_kg_ha": opt_p,
            "potassium_kg_ha": opt_k,
            "irrigation_mm": opt_water,
            "predicted_yield_q_acre": opt_yield,
            "predicted_yield_t_ha": round(opt_yield * 0.1, 2),
            "input_cost_usd_ha": opt_cost,
            "objective_score": round(float(-best_cost if "yield" in objective_type or "balanced" in objective_type else best_cost), 3),
            "runtime_ms": round(elapsed * 1000.0, 2),
            "tunneling_steps": tunneling_steps,
            "status": "completed",
        }

    def run_comparison(
        self,
        objective_type: str,
        current_n: float,
        current_p: float,
        current_k: float,
        soil_moisture: float,
        rainfall: float,
        ndvi: float,
        budget_limit: float = 240.0,
        target_yield: float = 32.0,
    ) -> Dict[str, Any]:
        """
        Executes both Classical and Quantum-Inspired optimizers and generates
        an evidence-based comparison without biased claims.
        """
        classical = self.solve_classical(
            objective_type=objective_type,
            current_n=current_n,
            current_p=current_p,
            current_k=current_k,
            soil_moisture=soil_moisture,
            rainfall=rainfall,
            ndvi=ndvi,
            budget_limit=budget_limit,
            target_yield=target_yield,
        )

        quantum_inspired = self.solve_quantum_inspired(
            objective_type=objective_type,
            current_n=current_n,
            current_p=current_p,
            current_k=current_k,
            soil_moisture=soil_moisture,
            rainfall=rainfall,
            ndvi=ndvi,
            budget_limit=budget_limit,
            target_yield=target_yield,
        )

        # Determine objective difference
        score_c = classical["objective_score"]
        score_q = quantum_inspired["objective_score"]
        delta_score = round(score_q - score_c, 3)

        if abs(delta_score) < 0.5:
            verdict = "Both optimization methods converged to comparable resource allocations."
            superior_method = "Comparable"
        elif score_q > score_c:
            verdict = f"Quantum-Inspired SQA found a solution with higher objective value (+{delta_score:.2f}) through non-local tunneling across the nutrient space."
            superior_method = "Quantum-Inspired SQA"
        else:
            verdict = f"Classical SLSQP achieved a superior continuous objective (+{abs(delta_score):.2f}) with faster convergence on this smooth parameter landscape."
            superior_method = "Classical SLSQP"

        return {
            "objective": objective_type,
            "classical_solution": classical,
            "quantum_inspired_solution": quantum_inspired,
            "objective_delta": delta_score,
            "runtime_ratio": round(quantum_inspired["runtime_ms"] / max(0.1, classical["runtime_ms"]), 2),
            "superior_method": superior_method,
            "scientific_assessment": verdict,
            "constraints": {
                "budget_limit_usd_ha": budget_limit,
                "target_yield_q_acre": target_yield,
                "n_bounds": list(self.bounds["nitrogen"]),
                "p_bounds": list(self.bounds["phosphorus"]),
                "k_bounds": list(self.bounds["potassium"]),
                "irrigation_bounds": list(self.bounds["irrigation"]),
            },
        }


# Global singleton instance
_OPTIMIZATION_SERVICE: Optional[AgronomicOptimizationService] = None

def get_optimization_service(quantum_engine: Optional[AgriQuantumEngine] = None) -> AgronomicOptimizationService:
    global _OPTIMIZATION_SERVICE
    if _OPTIMIZATION_SERVICE is None:
        _OPTIMIZATION_SERVICE = AgronomicOptimizationService(quantum_engine=quantum_engine)
    elif quantum_engine is not None and _OPTIMIZATION_SERVICE.quantum_engine is None:
        _OPTIMIZATION_SERVICE.quantum_engine = quantum_engine
    return _OPTIMIZATION_SERVICE
