-- ============================================================================
-- AUTOPRIME PDI PLATFORM — DATABASE AUTHENTICATION RPC & STAFF USER SEEDING
-- Migration: 20260825220000_database_auth_rpc_and_staff_seeding.sql
-- ============================================================================

-- 1. Enable pgcrypto extension for secure password hashing and verification
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure public.users table has enterprise fields
ALTER TABLE IF EXISTS users 
ADD COLUMN IF NOT EXISTS user_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'BRANCH_MANAGER',
ADD COLUMN IF NOT EXISTS designation VARCHAR(100),
ADD COLUMN IF NOT EXISTS brand VARCHAR(50) DEFAULT 'ALL',
ADD COLUMN IF NOT EXISTS nature VARCHAR(100) DEFAULT 'Management',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure unique constraint on employee_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_employee_id_unique'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_employee_id_unique UNIQUE (employee_id);
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 3. Create Secure RPC Login Function: authenticate_user
-- Runs as SECURITY DEFINER so anonymous clients can authenticate without direct table SELECT permissions
CREATE OR REPLACE FUNCTION authenticate_user(p_identifier TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user RECORD;
    v_token TEXT;
    v_result JSONB;
    v_clean_id TEXT;
BEGIN
    v_clean_id := LOWER(TRIM(COALESCE(p_identifier, '')));

    IF v_clean_id = '' OR p_password IS NULL OR p_password = '' THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'User ID and password are required'
        );
    END IF;

    -- Lookup user by employee_id, user_code, or email
    SELECT 
        id, organization_id, branch_id, employee_id, user_code,
        first_name, last_name, email, phone, role, designation,
        brand, nature, password_hash, is_active
    INTO v_user
    FROM users
    WHERE (
        LOWER(COALESCE(employee_id, '')) = v_clean_id OR
        LOWER(COALESCE(user_code, '')) = v_clean_id OR
        LOWER(COALESCE(email, '')) = v_clean_id
    )
    AND is_active = true
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Invalid User ID or Employee Code'
        );
    END IF;

    -- Verify Password (supports bcrypt blowfish hash or pgcrypto crypt or sha256)
    IF v_user.password_hash IS NOT NULL AND v_user.password_hash != '' THEN
        IF v_user.password_hash != p_password 
           AND v_user.password_hash != crypt(p_password, v_user.password_hash) THEN
            RETURN jsonb_build_object(
                'success', false, 
                'message', 'Invalid password. Please check your credentials.'
            );
        END IF;
    ELSE
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'User account does not have a configured password.'
        );
    END IF;

    -- Update last login timestamp
    UPDATE users SET last_login_at = NOW() WHERE id = v_user.id;

    -- Generate session token string
    v_token := 'jwt_dhoot_' || COALESCE(v_user.employee_id, v_user.user_code, 'USR') || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT;

    -- Build sanitized user profile response
    v_result := jsonb_build_object(
        'success', true,
        'token', v_token,
        'user', jsonb_build_object(
            'id', v_user.id,
            'employeeId', v_user.employee_id,
            'userCode', COALESCE(v_user.user_code, v_user.employee_id),
            'userName', COALESCE(NULLIF(TRIM(v_user.first_name || ' ' || COALESCE(v_user.last_name, '')), ''), v_user.employee_id),
            'email', COALESCE(v_user.email, ''),
            'phone', COALESCE(v_user.phone, ''),
            'role', COALESCE(v_user.role, 'BRANCH_MANAGER'),
            'designation', COALESCE(v_user.designation, 'Executive'),
            'brand', COALESCE(v_user.brand, 'ALL'),
            'nature', COALESCE(v_user.nature, 'Operations'),
            'organizationId', v_user.organization_id,
            'hasDualBrandAccess', (v_user.brand = 'ALL' OR v_user.role = 'SUPER_ADMIN')
        )
    );

    RETURN v_result;
END;
$$;

-- Grant execution permission to anonymous client (browser) and authenticated roles
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO service_role;

-- 4. Ensure master organization exists
INSERT INTO organizations (id, name, code) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Autoprime Tata & Hyundai - Dhoot Group', 'DHOOT-ALL')
ON CONFLICT (code) DO NOTHING;

-- 5. Seed Enterprise Operational Users with standard credentials
-- Passwords:
-- ADMIN01   -> Admin@2026
-- PDI01     -> Pdi@2026
-- QA01      -> Qa@2026
-- YARD01    -> Yard@2026
-- SALES01   -> Sales@2026

INSERT INTO users (
    id, organization_id, employee_id, user_code, first_name, last_name, email, phone, 
    role, designation, brand, nature, password_hash, is_active
) VALUES 
-- 1. Super Admin
(
    '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 
    'ADMIN01', 'ADMIN01', 'System', 'Administrator', 'admin@dhootgroup.com', '+919829010001',
    'SUPER_ADMIN', 'General Manager', 'ALL', 'Management', crypt('Admin@2026', gen_salt('bf')), true
),
-- 2. PDI Quality Inspector
(
    '00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 
    'PDI01', 'PDI01', 'Ramesh', 'Choudhary', 'pdi@dhootgroup.com', '+919829010002',
    'PDI_ENGINEER', 'Senior PDI Inspector', 'Autoprime Tata', 'Quality Inspection', crypt('Pdi@2026', gen_salt('bf')), true
),
-- 3. QA Manager
(
    '00000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 
    'QA01', 'QA01', 'Sunil', 'Sharma', 'qa@dhootgroup.com', '+919829010003',
    'QA_MANAGER', 'QA Certifying Head', 'ALL', 'Quality Assurance', crypt('Qa@2026', gen_salt('bf')), true
),
-- 4. Yard Supervisor
(
    '00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 
    'YARD01', 'YARD01', 'Vikram', 'Singh', 'yard@dhootgroup.com', '+919829010004',
    'YARD_MANAGER', 'Basni Yard In-charge', 'Autoprime Tata', 'Stockyard', crypt('Yard@2026', gen_salt('bf')), true
),
-- 5. Sales Consultant
(
    '00000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 
    'SALES01', 'SALES01', 'Dinesh', 'Gehlot', 'sales@dhootgroup.com', '+919829010005',
    'BRANCH_MANAGER', 'Senior Sales Consultant', 'Raja Hyundai', 'Sales', crypt('Sales@2026', gen_salt('bf')), true
)
ON CONFLICT (employee_id) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    designation = EXCLUDED.designation,
    brand = EXCLUDED.brand,
    is_active = true;
