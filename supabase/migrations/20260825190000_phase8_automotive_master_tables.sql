-- Autoprime Tata PDI Management Platform - Phase 8: Automotive Masters & Vehicle Extension
-- Version: 1.0.0
-- Description: Master vehicle models, financiers, insurance providers, designations, and vehicle attributes

-- 1. MASTER VEHICLE MODELS TABLE
CREATE TABLE IF NOT EXISTS master_vehicle_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    body_type VARCHAR(50) NOT NULL DEFAULT 'SUV',
    fuel_types TEXT[] NOT NULL DEFAULT ARRAY['PETROL'],
    variants JSONB DEFAULT '[]'::jsonb,
    colors JSONB DEFAULT '[]'::jsonb,
    base_ex_showroom NUMERIC(12,2) NOT NULL DEFAULT 1000000,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(brand, model_name)
);

-- 2. MASTER FINANCIERS (BANKS & NBFCs)
CREATE TABLE IF NOT EXISTS master_financiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'PRIVATE_BANK',
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    interest_rate NUMERIC(4,2) DEFAULT 8.75,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MASTER INSURANCE PROVIDERS
CREATE TABLE IF NOT EXISTS master_insurance_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(50),
    tie_up_discount NUMERIC(5,2) DEFAULT 50.00,
    claims_lead VARCHAR(255),
    contact_phone VARCHAR(50),
    coverage_packages TEXT[] DEFAULT ARRAY['Zero Dep', 'Engine Protect'],
    cashless_tieup BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. MASTER DESIGNATIONS & NATURE TYPES
CREATE TABLE IF NOT EXISTS master_designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100) DEFAULT 'OPERATIONS',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_nature_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. EXTEND VEHICLES TABLE WITH OPERATIONAL COLUMNS
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS brand VARCHAR(100) DEFAULT 'Tata Motors';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS sales_consultant TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS battery_voltage NUMERIC(4,2);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS key_count INT DEFAULT 2;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS unloading_notes TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS transit_damage_flag BOOLEAN DEFAULT FALSE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS carrier_trailer_no VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS transporter_name VARCHAR(255);

-- 6. EXTEND STOCKYARDS & BRANCHES WITH DISPLAY ATTRIBUTES
ALTER TABLE stockyards ADD COLUMN IF NOT EXISTS brand VARCHAR(50) DEFAULT 'Tata Motors';
ALTER TABLE stockyards ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE stockyards ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Rajasthan';
ALTER TABLE stockyards ADD COLUMN IF NOT EXISTS manager VARCHAR(255);
ALTER TABLE stockyards ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE stockyards ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';

ALTER TABLE branches ADD COLUMN IF NOT EXISTS brand VARCHAR(50) DEFAULT 'Tata Motors';
ALTER TABLE branches ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Main Showroom';
ALTER TABLE branches ADD COLUMN IF NOT EXISTS capacity VARCHAR(50);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS manager VARCHAR(255);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';

-- 7. INDEXES
CREATE INDEX IF NOT EXISTS idx_mvm_brand ON master_vehicle_models(brand);
CREATE INDEX IF NOT EXISTS idx_mvm_model_name ON master_vehicle_models(model_name);
CREATE INDEX IF NOT EXISTS idx_mf_category ON master_financiers(category);
CREATE INDEX IF NOT EXISTS idx_mip_code ON master_insurance_providers(code);

-- 8. ROW LEVEL SECURITY
ALTER TABLE master_vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_financiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_nature_types ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read master data
DROP POLICY IF EXISTS mvm_read_all ON master_vehicle_models;
CREATE POLICY mvm_read_all ON master_vehicle_models FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS mf_read_all ON master_financiers;
CREATE POLICY mf_read_all ON master_financiers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS mip_read_all ON master_insurance_providers;
CREATE POLICY mip_read_all ON master_insurance_providers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS md_read_all ON master_designations;
CREATE POLICY md_read_all ON master_designations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS mnt_read_all ON master_nature_types;
CREATE POLICY mnt_read_all ON master_nature_types FOR SELECT TO authenticated USING (true);

-- Allow service role full write access
DROP POLICY IF EXISTS mvm_service_role ON master_vehicle_models;
CREATE POLICY mvm_service_role ON master_vehicle_models FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS mf_service_role ON master_financiers;
CREATE POLICY mf_service_role ON master_financiers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS mip_service_role ON master_insurance_providers;
CREATE POLICY mip_service_role ON master_insurance_providers FOR ALL USING (true) WITH CHECK (true);
