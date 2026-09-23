-- Autoprime Tata & Hyundai PDI Platform - Phase 4 Commercial & Masters Seed Data
-- Version: 1.0.0

-- 1. ORGANIZATIONS (TATA & HYUNDAI)
INSERT INTO organizations (id, name, code) VALUES
('11111111-1111-1111-1111-111111111111', 'Autoprime Tata - Dhoot Group', 'DHOOT-TATA'),
('11111111-1111-1111-1111-111111111112', 'Raja Hyundai - Dhoot Group', 'DHOOT-HYUNDAI')
ON CONFLICT (code) DO NOTHING;

-- 2. MASTER VEHICLE MODELS
INSERT INTO master_vehicle_models (brand, model_name, body_type, fuel_types, base_ex_showroom, variants, colors) VALUES
('Tata Motors', 'Tata Safari', 'SUV', ARRAY['DIESEL'], 1619000, '["Smart", "Pure", "Adventure", "Accomplished", "Accomplished Plus 6S AT"]'::jsonb, '["Oberon Black", "Cosmic Gold", "Stardust Ash", "Supernova Copper"]'::jsonb),
('Tata Motors', 'Tata Harrier', 'SUV', ARRAY['DIESEL'], 1549000, '["Smart", "Pure", "Adventure", "Fearless", "Fearless Plus Dark 6MT"]'::jsonb, '["Oberon Black", "Daytona Grey", "Sunlit Yellow", "Pebble Grey"]'::jsonb),
('Tata Motors', 'Tata Nexon', 'SUV', ARRAY['PETROL', 'DIESEL', 'CNG'], 799000, '["Smart", "Pure", "Creative", "Fearless", "Fearless Plus S DT"]'::jsonb, '["Fearless Purple", "Creative Ocean", "Daytona Grey", "Flame Red", "Calypso Red"]'::jsonb),
('Tata Motors', 'Tata Curvv.ev', 'EV', ARRAY['EV'], 1749000, '["Creative 45", "Accomplished 55", "Accomplished Plus 55"]'::jsonb, '["Empowered Oxide", "Flame Red", "Pristine White", "Pure Grey"]'::jsonb),
('Tata Motors', 'Tata Punch', 'SUV', ARRAY['PETROL', 'CNG', 'EV'], 612000, '["Pure", "Adventure", "Accomplished", "Creative DT AMT"]'::jsonb, '["Tornado Blue", "Calypso Red", "Tropical Mist", "Daytona Grey"]'::jsonb),
('Tata Motors', 'Tata Altroz', 'HATCHBACK', ARRAY['PETROL', 'DIESEL', 'CNG'], 664000, '["XE", "XM", "XT", "XZ", "Racer R3 Turbo"]'::jsonb, '["Atomic Orange", "Downtown Red", "Avenue White", "Harbour Blue"]'::jsonb),
('Tata Motors', 'Tata Tiago', 'HATCHBACK', ARRAY['PETROL', 'CNG', 'EV'], 565000, '["XE", "XM", "XT", "XZ+", "XZ+ Dual Tone"]'::jsonb, '["Tornado Blue", "Daytona Grey", "Flame Red", "Opal White"]'::jsonb),

('Hyundai', 'Hyundai Creta', 'SUV', ARRAY['PETROL', 'DIESEL', 'TURBO'], 1099000, '["E", "EX", "S", "SX", "SX (O)", "SX (O) Turbo DCT"]'::jsonb, '["Ranger Khaki", "Abyss Black", "Atlas White", "Titan Grey"]'::jsonb),
('Hyundai', 'Hyundai Venue', 'SUV', ARRAY['PETROL', 'DIESEL', 'TURBO'], 794000, '["E", "S", "S+", "SX", "SX (O)"]'::jsonb, '["Fiery Red", "Typhoon Silver", "Denim Blue", "Phantom Black"]'::jsonb),
('Hyundai', 'Hyundai Verna', 'SEDAN', ARRAY['PETROL', 'TURBO'], 1100000, '["EX", "S", "SX", "SX (O) Turbo"]'::jsonb, '["Starry Night", "Titan Grey", "Abyss Black", "Atlas White"]'::jsonb),
('Hyundai', 'Hyundai Exter', 'SUV', ARRAY['PETROL', 'CNG'], 612000, '["EX", "S", "SX", "SX (O) Connect"]'::jsonb, '["Ranger Khaki", "Cosmic Blue", "Starry Night", "Atlas White"]'::jsonb),
('Hyundai', 'Hyundai i20', 'HATCHBACK', ARRAY['PETROL'], 704000, '["Era", "Magna", "Sportz", "Asta (O)"]'::jsonb, '["Fiery Red", "Starry Night", "Atlas White", "Titan Grey"]'::jsonb),
('Hyundai', 'Hyundai Alcazar', 'SUV', ARRAY['PETROL', 'DIESEL', 'TURBO'], 1677000, '["Executive", "Prestige", "Platinum", "Signature"]'::jsonb, '["Robust Emerald Matte", "Starry Night", "Atlas White"]'::jsonb)
ON CONFLICT (brand, model_name) DO NOTHING;

-- 3. MASTER FINANCIERS
INSERT INTO master_financiers (name, category, contact_person, contact_phone, interest_rate) VALUES
('HDFC Bank', 'PRIVATE_BANK', 'Rajesh Sharma', '+91 98290 11221', 8.65),
('State Bank of India', 'NATIONALIZED_BANK', 'Vikram Rathore', '+91 98290 22332', 8.50),
('ICICI Bank', 'PRIVATE_BANK', 'Amit Joshi', '+91 98290 33443', 8.70),
('Tata Capital Financial Services', 'CAPTIVE_FINANCE', 'Kailash Meena', '+91 98290 44554', 8.40),
('Kotak Mahindra Prime', 'PRIVATE_BANK', 'Suresh Patel', '+91 98290 55665', 8.75),
('Axis Bank', 'PRIVATE_BANK', 'Dinesh Gehlot', '+91 98290 66776', 8.80),
('Bank of Baroda', 'NATIONALIZED_BANK', 'Manish Purohit', '+91 98290 77887', 8.55)
ON CONFLICT (name) DO NOTHING;

-- 4. MASTER INSURANCE PROVIDERS
INSERT INTO master_insurance_providers (name, code, tie_up_discount, claims_lead, contact_phone, coverage_packages, cashless_tieup) VALUES
('Tata AIG General Insurance', 'TATA-AIG', 65.00, 'Kavita Sen (Zonal Claims Lead)', '+91 1800 2667780', ARRAY['Zero Dep', 'Engine Protect', 'RTI', 'Key Replacement'], true),
('ICICI Lombard General Insurance', 'ICICI-LOMB', 60.00, 'Manoj Sharma (Surveyor Head)', '+91 1800 2666', ARRAY['Zero Dep', 'RTI', 'Consumables Cover'], true),
('Bajaj Allianz General Insurance', 'BAJAJ-ALLZ', 62.00, 'Alok Gupta (Regional Claims Mgr)', '+91 1800 209 5858', ARRAY['Zero Dep', 'Engine Protect', 'Tyre Protect'], true),
('HDFC ERGO General Insurance', 'HDFC-ERGO', 58.00, 'Sneha Patel (Claims Desk)', '+91 1800 266 6444', ARRAY['Zero Dep', '24x7 Roadside Assistance'], true),
('National Insurance Company Ltd', 'NICL', 50.00, 'R. K. Verma (Divisional Officer)', '+91 1800 345 0330', ARRAY['Comprehensive Standard Package'], true)
ON CONFLICT (name) DO NOTHING;
