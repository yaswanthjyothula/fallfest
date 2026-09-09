# Evidence Item 05: 4-Qubit Quantum Circuit Architecture

## Circuit Parameters
- **Circuit Class**: `ZZFeatureMap` (Qiskit Circuit Library)
- **Qubit Register**: 4 Qubits ($q_0$: Nitrogen, $q_1$: Moisture, $q_2$: Rainfall, $q_3$: NDVI)
- **Repetitions ($d$)**: 2 Repetitions
- **Entanglement Topology**: `linear` (Coupling pairs: $(q_0, q_1), (q_1, q_2), (q_2, q_3)$)
- **Phase Scaling Factor**: $\alpha = 0.1$ to prevent Hilbert space phase wrapping

## Mathematical Gate Operations
1. **Hadamard Layer**:
   $$H^{\otimes 4} |0000\rangle = \frac14 \sum_{x} |x\rangle$$
2. **Single-Qubit Phase Rotations**:
   $$U_{\Phi}(x_i) = \exp(i x_i Z_i)$$
3. **Two-Qubit Entangling ZZ Interactions**:
   $$R_{ZZ}(\theta_{ij}) = \exp\left(i (\pi - x_i)(\pi - x_j) Z_i \otimes Z_j\right)$$

## Simulator Execution
- **Backend**: Qiskit Aer (`qiskit_aer.AerSimulator` / `StatevectorSampler`)
- **Simulation Hardware**: Verified host CPU (Intel64 Family 6 Model 183 Stepping 1, GenuineIntel) with exact statevector fidelity inner products.
