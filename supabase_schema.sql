-- ==============================================================================
-- AgriQuantum Production Database Schema for Supabase (PostgreSQL)
-- ==============================================================================
-- Project Reference: arbykwiinhpaymeuzhtl
-- Execution: Run this entire script in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Farmer' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 2. Farms
CREATE TABLE IF NOT EXISTS public.farms (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India' NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    total_area_hectares DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_farms_name ON public.farms(name);

-- 3. Fields (Plots)
CREATE TABLE IF NOT EXISTS public.fields (
    id BIGSERIAL PRIMARY KEY,
    farm_id BIGINT REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    area_hectares DOUBLE PRECISION NOT NULL,
    soil_type VARCHAR(100) DEFAULT 'Alluvial Loam' NOT NULL,
    boundary_geojson TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields(farm_id);

-- 4. Crops
CREATE TABLE IF NOT EXISTS public.crops (
    id BIGSERIAL PRIMARY KEY,
    field_id BIGINT REFERENCES public.fields(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    season VARCHAR(50) DEFAULT 'Rabi' NOT NULL,
    growth_stage VARCHAR(100) DEFAULT 'Stem Elongation (Feekes 6)' NOT NULL,
    planting_date TIMESTAMPTZ,
    expected_harvest_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_crops_field_id ON public.crops(field_id);

-- 5. Seasons
CREATE TABLE IF NOT EXISTS public.seasons (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 6. Soil Measurements
CREATE TABLE IF NOT EXISTS public.soil_measurements (
    id BIGSERIAL PRIMARY KEY,
    field_id BIGINT REFERENCES public.fields(id) ON DELETE CASCADE NOT NULL,
    measured_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    nitrogen DOUBLE PRECISION NOT NULL,
    phosphorus DOUBLE PRECISION NOT NULL,
    potassium DOUBLE PRECISION NOT NULL,
    moisture DOUBLE PRECISION NOT NULL,
    ph DOUBLE PRECISION NOT NULL,
    ec DOUBLE PRECISION DEFAULT 0.45 NOT NULL,
    organic_carbon DOUBLE PRECISION DEFAULT 0.72 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_soil_measurements_field_id ON public.soil_measurements(field_id);
CREATE INDEX IF NOT EXISTS idx_soil_measurements_measured_at ON public.soil_measurements(measured_at);

-- 7. Weather Observations
CREATE TABLE IF NOT EXISTS public.weather_observations (
    id BIGSERIAL PRIMARY KEY,
    farm_id BIGINT REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    rainfall DOUBLE PRECISION NOT NULL,
    humidity DOUBLE PRECISION,
    solar_radiation DOUBLE PRECISION,
    wind_speed DOUBLE PRECISION,
    source VARCHAR(50) DEFAULT 'Open-Meteo' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_weather_observations_farm_id ON public.weather_observations(farm_id);
CREATE INDEX IF NOT EXISTS idx_weather_observations_recorded_at ON public.weather_observations(recorded_at);

-- 8. Satellite Observations
CREATE TABLE IF NOT EXISTS public.satellite_observations (
    id BIGSERIAL PRIMARY KEY,
    field_id BIGINT REFERENCES public.fields(id) ON DELETE CASCADE NOT NULL,
    observed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    ndvi DOUBLE PRECISION NOT NULL,
    evi DOUBLE PRECISION,
    ndre DOUBLE PRECISION,
    cloud_coverage DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    satellite_source VARCHAR(100) DEFAULT 'Sentinel-2 Multispectral' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_satellite_obs_field_id ON public.satellite_observations(field_id);
CREATE INDEX IF NOT EXISTS idx_satellite_obs_observed_at ON public.satellite_observations(observed_at);

-- 9. Model Versions
CREATE TABLE IF NOT EXISTS public.model_versions (
    id BIGSERIAL PRIMARY KEY,
    version_tag VARCHAR(50) UNIQUE NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    framework VARCHAR(100) NOT NULL,
    parameters_json TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_model_versions_tag ON public.model_versions(version_tag);

-- 10. Model Evaluations
CREATE TABLE IF NOT EXISTS public.model_evaluations (
    id BIGSERIAL PRIMARY KEY,
    model_version_id BIGINT REFERENCES public.model_versions(id) NOT NULL,
    evaluated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    dataset_name VARCHAR(100) NOT NULL,
    r2_score DOUBLE PRECISION NOT NULL,
    rmse DOUBLE PRECISION NOT NULL,
    mae DOUBLE PRECISION NOT NULL,
    train_time_sec DOUBLE PRECISION NOT NULL,
    inference_time_ms DOUBLE PRECISION NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_model_evals_version ON public.model_evaluations(model_version_id);

-- 11. Predictions
CREATE TABLE IF NOT EXISTS public.predictions (
    id BIGSERIAL PRIMARY KEY,
    field_id BIGINT REFERENCES public.fields(id) ON DELETE CASCADE NOT NULL,
    user_id BIGINT REFERENCES public.users(id) NOT NULL,
    model_version_id BIGINT REFERENCES public.model_versions(id),
    predicted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    input_nitrogen DOUBLE PRECISION NOT NULL,
    input_phosphorus DOUBLE PRECISION DEFAULT 45.0 NOT NULL,
    input_potassium DOUBLE PRECISION DEFAULT 50.0 NOT NULL,
    input_moisture DOUBLE PRECISION NOT NULL,
    input_rainfall DOUBLE PRECISION NOT NULL,
    input_temperature DOUBLE PRECISION DEFAULT 24.5 NOT NULL,
    input_ndvi DOUBLE PRECISION NOT NULL,
    crop_type VARCHAR(100) DEFAULT 'Winter Wheat' NOT NULL,
    predicted_yield DOUBLE PRECISION NOT NULL,
    unit VARCHAR(50) DEFAULT 'Quintals per Acre' NOT NULL,
    confidence_score DOUBLE PRECISION DEFAULT 98.2 NOT NULL,
    status VARCHAR(50) DEFAULT 'Complete' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_predictions_field ON public.predictions(field_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_time ON public.predictions(predicted_at);

-- 12. Recommendations
CREATE TABLE IF NOT EXISTS public.recommendations (
    id BIGSERIAL PRIMARY KEY,
    prediction_id BIGINT UNIQUE REFERENCES public.predictions(id) ON DELETE CASCADE NOT NULL,
    recommended_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    current_nitrogen DOUBLE PRECISION NOT NULL,
    recommended_nitrogen DOUBLE PRECISION NOT NULL,
    delta_nitrogen DOUBLE PRECISION NOT NULL,
    current_moisture DOUBLE PRECISION NOT NULL,
    recommended_moisture DOUBLE PRECISION NOT NULL,
    delta_moisture DOUBLE PRECISION NOT NULL,
    supplemental_irrigation_mm DOUBLE PRECISION NOT NULL,
    baseline_yield DOUBLE PRECISION NOT NULL,
    optimized_yield DOUBLE PRECISION NOT NULL,
    yield_increase_pct DOUBLE PRECISION NOT NULL,
    cost_savings_inr_acre DOUBLE PRECISION NOT NULL,
    net_economic_benefit_inr_acre DOUBLE PRECISION NOT NULL,
    nitrogen_advisory TEXT NOT NULL,
    irrigation_advisory TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 13. Datasets
CREATE TABLE IF NOT EXISTS public.datasets (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    record_count INTEGER NOT NULL,
    feature_count INTEGER NOT NULL,
    quality_score DOUBLE PRECISION DEFAULT 100.0 NOT NULL,
    file_path VARCHAR(500),
    uploaded_by BIGINT REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_datasets_name ON public.datasets(name);

-- 14. Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id BIGSERIAL PRIMARY KEY,
    farm_id BIGINT REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
    generated_by BIGINT REFERENCES public.users(id),
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) DEFAULT 'Certified Agronomic Audit' NOT NULL,
    format VARCHAR(20) DEFAULT 'PDF' NOT NULL,
    file_path VARCHAR(500),
    summary_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_farm ON public.reports(farm_id);

-- 15. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    details_json TEXT,
    timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON public.audit_logs(timestamp);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active model versions and benchmarks
CREATE POLICY "Allow public read of model versions" ON public.model_versions FOR SELECT USING (true);
CREATE POLICY "Allow public read of evaluations" ON public.model_evaluations FOR SELECT USING (true);
CREATE POLICY "Allow public read of seasons" ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Allow public read of farms" ON public.farms FOR SELECT USING (true);
CREATE POLICY "Allow public read of fields" ON public.fields FOR SELECT USING (true);
CREATE POLICY "Allow public read of crops" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Allow public read of soil measurements" ON public.soil_measurements FOR SELECT USING (true);
CREATE POLICY "Allow public read of weather" ON public.weather_observations FOR SELECT USING (true);
CREATE POLICY "Allow public read of satellite observations" ON public.satellite_observations FOR SELECT USING (true);

-- Allow authenticated and anon inserts for predictions and audit logs
CREATE POLICY "Allow anon insert predictions" ON public.predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select predictions" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Allow anon insert recommendations" ON public.recommendations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select recommendations" ON public.recommendations FOR SELECT USING (true);
CREATE POLICY "Allow anon insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Allow anon insert reports" ON public.reports FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- Initial Enterprise Seeds
-- ==============================================================================

INSERT INTO public.users (email, hashed_password, full_name, role)
VALUES ('admin@agriquantum.com', '$2b$12$K8h7R1f0sC6X9vY0m8qJae4D5v6c7B8a9Z0x1y2w3v4u5t6s7r8q9', 'AgriQuantum Administrator', 'Administrator')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.farms (user_id, name, location, latitude, longitude, total_area_hectares)
VALUES (1, 'Green Valley Agricultural Station', 'Punjab Agricultural Belt, Sector 4', 30.9010, 75.8573, 120.0)
ON CONFLICT DO NOTHING;

INSERT INTO public.fields (farm_id, name, area_hectares, soil_type)
VALUES (1, 'Plot Alpha-1 (Wheat Monitored)', 35.0, 'Alluvial Loam')
ON CONFLICT DO NOTHING;

INSERT INTO public.crops (field_id, name, variety, season, growth_stage)
VALUES (1, 'Winter Wheat', 'Triticum aestivum PBW-343', 'Rabi', 'Stem Elongation (Feekes 6)')
ON CONFLICT DO NOTHING;

INSERT INTO public.model_versions (version_tag, model_name, framework, parameters_json)
VALUES ('v2.4.1', 'AgriQuantum QSVR', 'Qiskit Aer', '{"qubits": 4, "reps": 2, "entanglement": "linear"}')
ON CONFLICT (version_tag) DO NOTHING;
