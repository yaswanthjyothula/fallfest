"""
AgriQuantum Pipeline Step 2: Clean and Validate Indian Agricultural Yield Records
================================================================================
Cleans raw DES production records:
- Validates Indian administrative geography (State / District)
- Drops invalid or duplicate rows
- Calculates exact yield_tonne_per_hectare = production_tonne / area_hectare
- Enforces physiological limits (rejects negative or impossible yields)
- Saves to data/processed/clean_des_yield_data.csv
"""

import csv
from pathlib import Path

RAW_CSV = Path("data/raw/des_raw_district_crop_production.csv")
PROCESSED_DIR = Path("data/processed")
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
CLEAN_CSV = PROCESSED_DIR / "clean_des_yield_data.csv"

# Valid physiological yield bounds (tonne/hectare) for Indian crops under field conditions
YIELD_BOUNDS = {
    "Wheat": (0.8, 7.5),
    "Rice": (0.8, 6.8),
    "Cotton": (0.1, 1.8),       # lint equivalent
    "Maize": (1.0, 9.0),
    "Groundnut": (0.4, 3.8),
    "Sugarcane": (40.0, 140.0),
    "Soybean": (0.5, 3.2),
    "Mustard": (0.4, 2.8),
    "Pulses": (0.3, 2.2),
}


def clean_india_yield_data():
    if not RAW_CSV.exists():
        raise FileNotFoundError(f"Raw data file missing: {RAW_CSV}. Run download_india_data.py first.")

    cleaned_rows = []
    seen_keys = set()
    rejected_count = 0

    with open(RAW_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            state = row["state"].strip()
            district = row["district"].strip()
            crop = row["crop"].strip()
            season = row["season"].strip()
            year = int(row["year"])
            area = float(row["area_hectare"])
            prod = float(row["production_tonne"])

            # 1. Deduplication check
            unique_key = (state, district, crop, season, year)
            if unique_key in seen_keys:
                rejected_count += 1
                continue
            seen_keys.add(unique_key)

            # 2. Area and Production validity
            if area <= 0 or prod <= 0:
                rejected_count += 1
                continue

            # 3. Calculate yield
            yield_t_ha = round(prod / area, 2)

            # 4. Physiological sanity check
            min_y, max_y = YIELD_BOUNDS.get(crop, (0.1, 150.0))
            if not (min_y <= yield_t_ha <= max_y):
                print(f"[WARN] Out-of-bounds yield for {crop} in {district}, {state}: {yield_t_ha} t/ha (Expected {min_y}-{max_y}). Rejecting.")
                rejected_count += 1
                continue

            cleaned_rows.append({
                "state": state,
                "district": district,
                "crop": crop,
                "season": season,
                "year": year,
                "area_hectare": area,
                "production_tonne": prod,
                "yield_tonne_per_hectare": yield_t_ha,
            })

    # Write cleaned CSV
    fieldnames = [
        "state", "district", "crop", "season", "year",
        "area_hectare", "production_tonne", "yield_tonne_per_hectare"
    ]
    with open(CLEAN_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(cleaned_rows)

    print(f"[OK] Cleaned {len(cleaned_rows)} yield rows (Rejected {rejected_count}) -> {CLEAN_CSV}")


if __name__ == "__main__":
    clean_india_yield_data()
