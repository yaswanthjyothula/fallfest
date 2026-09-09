# Quantum Machine Learning Methodology: 4-Qubit QSVR

## 1. Mathematical Formulation

AgriQuantum leverages **Quantum Support Vector Regression (`QSVR`)** using quantum state fidelity kernels. Continuous biophysical field measurements $\vec{x} \in \mathbb{R}^4$ are transformed into non-linear quantum states in Hilbert space:

$$|\Phi(\vec{x})\rangle = U_{\Phi(\vec{x})} |0\rangle^{\otimes 4}$$

### Quantum Feature Map: Second-Order Pauli-Z Entanglement (`ZZFeatureMap`)
The parameterized unitary evolution operator $U_{\Phi(\vec{x})}$ applies Hadamard superposition followed by entangling phase rotations:

$$U_{\Phi(\vec{x})} = \left( \exp\left(i \sum_{j=1}^4 \phi_j(x_j) Z_j + \sum_{j=1}^4 \sum_{k > j} \phi_{jk}(x_j, x_k) Z_j Z_k\right) H^{\otimes 4} \right)^2$$

Where the single-qubit and two-qubit rotation angles are defined as:
- **Single-Qubit Rotations**: $\phi_j(x_j) = \alpha \cdot x_j$
- **Entangling Two-Qubit Rotations**: $\phi_{jk}(x_j, x_k) = \alpha \cdot (\pi - x_j)(\pi - x_k)$

$$\alpha = 0.1 \quad \text{(Harmonic phase scaling parameter)}$$

---

## 2. Quantum State Fidelity Kernel

The kernel matrix element between two farm observation vectors $\vec{x}_i$ and $\vec{x}_j$ represents transition fidelity:

$$K(\vec{x}_i, \vec{x}_j) = |\langle \Phi(\vec{x}_i) | \Phi(\vec{x}_j) \rangle|^2$$

This kernel satisfies the Mercer condition:
1. **Symmetric**: $K(\vec{x}_i, \vec{x}_j) = K(\vec{x}_j, \vec{x}_i)$
2. **Normalized**: $K(\vec{x}_i, \vec{x}_i) = 1.0$
3. **Positive Semi-Definite**: $\forall \vec{c} \in \mathbb{R}^N, \sum_{i,j} c_i c_j K(\vec{x}_i, \vec{x}_j) \ge 0$

---

## 3. Circuit Characteristics

| Metric | Quantum Circuit Specification |
| :--- | :--- |
| **Qubits** | 4 ($q_0$: Soil Nitrogen, $q_1$: Soil Moisture, $q_2$: Cumulative Rainfall, $q_3$: Sentinel NDVI) |
| **Circuit Depth** | 18 operations |
| **Single-Qubit Gates** | 10 (Hadamard + $R_z$ phase rotations) |
| **Two-Qubit Entangling Gates** | 12 CNOT gates |
| **Simulation Backend** | Qiskit Aer Statevector (`FidelityStatevectorKernel`) |
| **Hilbert Dimension** | $2^4 = 16$ orthogonal dimensions |

---

## 4. Why Harmonic Phase Scaling ($\alpha = 0.1$)?
Unscaled quantum feature maps evaluate modulo $2\pi$. In biological and agricultural systems, non-linear saturation curves (e.g. Mitscherlich-Baule law of diminishing returns for fertilizer) require smooth monotonicity. A full $2\pi$ wrap-around would cause artificial cyclic oscillations where extreme excess fertilizer appears identical to zero fertilizer. By dampening the phase evolution with $\alpha = 0.1$, the quantum kernel preserves monotonic biophysical response properties.
