"""
AgriQuantum Data Package
Provides realistic agronomic record generation, biophysical yield modeling,
and quantum feature preprocessing for the 4-qubit ZZFeatureMap.
"""

from .generator import (
    generate_agronomic_dataset,
    get_train_test_agronomic_data,
    scale_for_quantum,
    FEATURE_NAMES,
    QUANTUM_FEATURES,
)

__all__ = [
    "generate_agronomic_dataset",
    "get_train_test_agronomic_data",
    "scale_for_quantum",
    "FEATURE_NAMES",
    "QUANTUM_FEATURES",
]
