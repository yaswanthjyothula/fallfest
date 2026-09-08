"""
Precision Agronomy Data Generator
=================================
Models realistic, heterogeneous agricultural plot records inspired by USDA-ARS,
FAO Crop Growth Models (AquaCrop), and Liebig's Law of the Minimum.

Calculates realistic crop yield (Quintals/Acre) as a function of:
- Soil Nitrogen (N, kg/ha)
- Soil Phosphorus (P, kg/ha)
- Soil Potassium (K, kg/ha)
- Soil Moisture Content (% volumetric)
- Cumulative Growing Season Rainfall (mm)
- Mean Ambient Temperature (°C)
- Satellite Normalized Difference Vegetation Index (NDVI)

Encodes cross-feature non-linearities (e.g. Nitrogen-Moisture co-limitation,
extreme heat/drought stress penalties, and luxury nutrient consumption)
ideal for evaluation in Quantum Hilbert space via 4-Qubit ZZFeatureMaps.
"""

from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler

# Complete list of agronomic variables
FEATURE_NAMES: List[str] = [
    "soil_nitrogen",     # N: 20 - 150 kg/ha
    "soil_phosphorus",   # P: 10 - 80 kg/ha
    "soil_potassium",    # K: 15 - 120 kg/ha
    "soil_moisture",     # Moisture: 15 - 45 %
    "rainfall",          # Rainfall: 50 - 300 mm
    "temperature",       # Temp: 18 - 38 °C
    "ndvi",              # NDVI: 0.20 - 0.85
]

# The 4 primary orthogonal drivers mapped into the 4-Qubit ZZFeatureMap
QUANTUM_FEATURES: List[str] = [
    "soil_nitrogen",
    "soil_moisture",
    "rainfall",
    "ndvi",
]

TARGET_COL: str = "yield_quintals"


def compute_biophysical_yield(
    n: np.ndarray,
    p: np.ndarray,
    k: np.ndarray,
    moisture: np.ndarray,
    rainfall: np.ndarray,
    temp: np.ndarray,
    ndvi: np.ndarray,
    noise_std: float = 0.65,
    random_state: Optional[int] = 42,
) -> np.ndarray:
    """
    Computes realistic crop yield in Quintals/Acre (1 Quintal = 100 kg)
    using non-linear agronomic response functions.

    Biophysical response modeling:
    1. Nitrogen response: Mitscherlich quadratic curve with optimum ~105-120 kg/ha.
    2. Moisture & Water availability: Non-linear interaction where nitrogen
       absorption efficiency is heavily constrained under dry conditions (<22%)
       and penalized by root hypoxia in waterlogged soil (>40% moisture + heavy rain).
    3. Liebig limitation from P & K nutrient balance.
    4. Temperature stress: Thermal optimum 24-28 °C; supra-optimal heat penalties > 32 °C.
    5. Photosynthetic canopy capacity scaling via NDVI.
    """
    if random_state is not None:
        rng = np.random.RandomState(random_state)
    else:
        rng = np.random.RandomState()

    # 1. Base Potential Yield (e.g. standard high-yield hybrid maize / wheat: 38 Quintals/Acre)
    base_yield = 38.0

    # 2. Nitrogen Response factor (normalized around 110 kg/ha optimal)
    # Quadratic plateau: Y_N = -0.0016 * (N - 110)^2 + 6.5
    n_opt = 110.0
    n_response = 6.5 - 0.0016 * ((n - n_opt) ** 2)

    # 3. P and K balanced fertility factor (Liebig ratio)
    # Optimum P ~ 45 kg/ha, K ~ 75 kg/ha
    pk_balance = 0.04 * np.minimum(p / 45.0, 1.3) + 0.03 * np.minimum(k / 75.0, 1.3)

    # 4. Moisture and Rainfall Interaction (Water-Nitrogen Synergy)
    # Effective water index (combined soil water and seasonal precipitation)
    effective_water = (moisture / 30.0) * 0.6 + (rainfall / 180.0) * 0.4
    # Cross-term: Nitrogen cannot be assimilated without adequate soil solution
    water_n_synergy = 4.2 * np.tanh(effective_water - 0.7) * (n / 100.0)

    # 5. Hypoxia / Waterlogging Penalty (Excessive moisture > 38% & Rainfall > 260 mm)
    excess_water = np.maximum(0.0, moisture - 38.0) * 0.25 + np.maximum(0.0, rainfall - 260.0) * 0.03
    waterlogging_penalty = np.square(excess_water) * 0.4

    # 6. Thermal Stress Penalty (Threshold > 30 °C during grain fill)
    temp_stress = np.maximum(0.0, temp - 29.0) * 1.1

    # 7. NDVI Scaling (Chlorophyll & Leaf Area Index)
    # Strong positive vegetative vigor proxy
    ndvi_effect = 7.8 * (ndvi - 0.45)

    # Stochastic soil micro-heterogeneity & microclimatic noise
    noise = rng.normal(0, noise_std, size=len(n))

    # Total predicted yield in Quintals/Acre
    total_yield = (
        base_yield
        + n_response
        + pk_balance
        + water_n_synergy
        - waterlogging_penalty
        - temp_stress
        + ndvi_effect
        + noise
    )

    # Realistic physical bounds for crop yield (e.g. 15 to 48 Quintals/Acre)
    total_yield = np.clip(total_yield, 15.0, 48.0)
    return np.round(total_yield, 2)


def generate_agronomic_dataset(
    n_samples: int = 140,
    random_state: int = 42,
    noise_std: float = 0.55,
) -> pd.DataFrame:
    """
    Generates a realistic agronomic dataset of diverse agricultural plots.

    Parameters:
    -----------
    n_samples : int
        Number of agricultural plot observation records (default 140).
    random_state : int
        Reproducibility seed.
    noise_std : float
        Stochastic noise standard deviation in yield calculation.

    Returns:
    --------
    pd.DataFrame containing all environmental features and target crop yield.
    """
    rng = np.random.RandomState(random_state)

    # Generate realistic correlated agronomic features
    # Nitrogen (kg/ha): 25 to 150
    soil_n = rng.uniform(25.0, 150.0, size=n_samples)
    
    # Phosphorus (kg/ha): 15 to 75
    soil_p = rng.uniform(15.0, 75.0, size=n_samples)
    
    # Potassium (kg/ha): 20 to 125
    soil_k = rng.uniform(20.0, 125.0, size=n_samples)
    
    # Soil Moisture (%): 16% to 42%
    soil_moisture = rng.uniform(16.0, 42.0, size=n_samples)
    
    # Rainfall (mm): 60 to 290 mm
    # Weak positive correlation with soil moisture
    rainfall = 60.0 + (soil_moisture - 16.0) * 4.5 + rng.uniform(-30.0, 80.0, size=n_samples)
    rainfall = np.clip(rainfall, 50.0, 310.0)
    
    # Temperature (°C): 19 to 37 °C
    temperature = rng.uniform(19.0, 37.0, size=n_samples)
    
    # NDVI (0.22 to 0.86)
    # Correlated with moisture, nitrogen, and non-linear health
    base_ndvi = 0.25 + 0.35 * (soil_n / 150.0) + 0.25 * (soil_moisture / 42.0)
    ndvi = np.clip(base_ndvi + rng.normal(0, 0.05, size=n_samples), 0.22, 0.86)

    # Calculate realistic biophysical yield
    crop_yield = compute_biophysical_yield(
        n=soil_n,
        p=soil_p,
        k=soil_k,
        moisture=soil_moisture,
        rainfall=rainfall,
        temp=temperature,
        ndvi=ndvi,
        noise_std=noise_std,
        random_state=random_state,
    )

    df = pd.DataFrame({
        "plot_id": [f"PLOT-{i+101:03d}" for i in range(n_samples)],
        "soil_nitrogen": np.round(soil_n, 1),
        "soil_phosphorus": np.round(soil_p, 1),
        "soil_potassium": np.round(soil_k, 1),
        "soil_moisture": np.round(soil_moisture, 1),
        "rainfall": np.round(rainfall, 1),
        "temperature": np.round(temperature, 1),
        "ndvi": np.round(ndvi, 3),
        TARGET_COL: crop_yield,
    })

    return df


def scale_for_quantum(
    X: np.ndarray,
    scaler: Optional[MinMaxScaler] = None,
) -> Tuple[np.ndarray, MinMaxScaler]:
    """
    Scales continuous agronomic feature values into [0, 2π] range for
    4-Qubit ZZFeatureMap phase and rotation gates.

    Parameters:
    -----------
    X : np.ndarray of shape (N, 4)
    scaler : Optional[MinMaxScaler]
        If provided, uses fitted scaler to transform. If None, fits a new scaler.

    Returns:
    --------
    Tuple of (X_scaled, fitted_scaler)
    """
    if scaler is None:
        scaler = MinMaxScaler(feature_range=(0.0, 2.0 * np.pi))
        X_scaled = scaler.fit_transform(X)
    else:
        X_scaled = scaler.transform(X)
    return X_scaled, scaler


def get_train_test_agronomic_data(
    n_samples: int = 140,
    test_size: float = 0.25,
    random_state: int = 42,
) -> Dict[str, any]:
    """
    Generates dataset, extracts 4-dimensional quantum feature subset,
    performs train/test split, and computes quantum phase scaling [0, 2π].

    Returns:
    --------
    dict with keys:
      'df': full DataFrame
      'X_train_raw': unscaled 4-feature training matrix
      'X_test_raw': unscaled 4-feature testing matrix
      'X_train_quantum': [0, 2π] scaled training matrix
      'X_test_quantum': [0, 2π] scaled testing matrix
      'y_train': training targets
      'y_test': testing targets
      'scaler': fitted MinMaxScaler
      'feature_names': list of 4 quantum feature names
    """
    df = generate_agronomic_dataset(n_samples=n_samples, random_state=random_state)
    
    # Extract the 4 primary drivers for the 4-qubit circuit
    X_raw = df[QUANTUM_FEATURES].values
    y = df[TARGET_COL].values

    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_raw, y, test_size=test_size, random_state=random_state
    )

    X_train_q, scaler = scale_for_quantum(X_train_raw)
    X_test_q, _ = scale_for_quantum(X_test_raw, scaler=scaler)

    return {
        "df": df,
        "X_train_raw": X_train_raw,
        "X_test_raw": X_test_raw,
        "X_train_quantum": X_train_q,
        "X_test_quantum": X_test_q,
        "y_train": y_train,
        "y_test": y_test,
        "scaler": scaler,
        "feature_names": QUANTUM_FEATURES,
    }


if __name__ == "__main__":
    data = get_train_test_agronomic_data(n_samples=100)
    print("Dataset successfully generated!")
    print(f"Total plots: {len(data['df'])}")
    print(f"Train samples: {len(data['y_train'])}, Test samples: {len(data['y_test'])}")
    print(f"Features: {data['feature_names']}")
    print(f"Quantum scaled feature range: [{data['X_train_quantum'].min():.2f}, {data['X_train_quantum'].max():.2f}]")
    print(data["df"].head(3))
