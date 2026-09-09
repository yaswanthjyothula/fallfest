-- ==============================================================================
-- AgriQuantum Development Sandbox Seed Data (TEST / DEV ONLY)
-- ==============================================================================
-- Notice: This file is for local offline development sandboxing only.
-- Production deployments MUST NOT execute this seed script.
-- ==============================================================================

-- Sample Development User
INSERT INTO public.users (id, email, hashed_password, full_name, role)
VALUES (999, 'dev_sample@agriquantum.com', '$2b$12$K8h7R1f0sC6X9vY0m8qJae4D5v6c7B8a9Z0x1y2w3v4u5t6s7r8q9', 'Development Sandbox Tester', 'Farmer')
ON CONFLICT (email) DO NOTHING;

-- Sample Development Farm
INSERT INTO public.farms (id, user_id, name, location, latitude, longitude, total_area_hectares)
VALUES (999, 999, 'AgriQuantum Research Sandbox Holding', 'Deccan Agricultural Experimental Station', 16.5062, 80.6480, 25.0)
ON CONFLICT (id) DO NOTHING;

-- Sample Development Field
INSERT INTO public.fields (id, farm_id, name, area_hectares, soil_type)
VALUES (999, 999, 'Test Plot Sandbox A', 12.5, 'Alluvial Loam')
ON CONFLICT (id) DO NOTHING;

-- Sample Development Crop
INSERT INTO public.crops (id, field_id, name, variety, season, growth_stage)
VALUES (999, 999, 'Paddy / Rice', 'BPT-5204 Samba Mahsuri', 'Kharif', 'Vegetative')
ON CONFLICT (id) DO NOTHING;
