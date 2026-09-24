-- ============================================================================
-- BRAND, USER & ROLE WINDOW SCHEMA MIGRATION
-- Migration: 20260825240000_brand_user_and_role_window_schema.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. BRAND TABLE (Tata and Hyundai)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brand (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Synonym / View for convenience
CREATE OR REPLACE VIEW public.brands AS SELECT * FROM public.brand;

-- Pre-populate the 2 brands: Tata and Hyundai
INSERT INTO public.brand (id, name, display_name, code, description, logo_url, is_active)
VALUES 
    ('TATA', 'Tata', 'Autoprime Tata', 'TATA', 'Official Tata Motors Passenger & EV Dealership', '/logo-tata.jpg', true),
    ('HYUNDAI', 'Hyundai', 'Raja Hyundai', 'HYUNDAI', 'Authorized Hyundai Motor Dealership & 3S Facility', '/logo-hyundai.jpg', true)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    display_name = EXCLUDED.display_name,
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    logo_url = EXCLUDED.logo_url,
    is_active = true,
    updated_at = NOW();

-- ----------------------------------------------------------------------------
-- 2. ROLES TABLE & ROLE WINDOW (Menus & Permissions)
-- ----------------------------------------------------------------------------
-- Enhance existing roles table with allowed_menus, permissions, and brand_scope
ALTER TABLE public.roles 
ADD COLUMN IF NOT EXISTS allowed_menus JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS brand_scope VARCHAR(50) DEFAULT 'ASSIGNED',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update system roles with specific menus and permissions
UPDATE public.roles 
SET 
    allowed_menus = '["dashboard", "vehicles", "yard", "pdi", "repairs", "qa", "challans", "reports", "users", "roles"]'::jsonb,
    permissions = '["view", "create", "edit", "delete", "approve", "export", "admin"]'::jsonb,
    brand_scope = 'ALL',
    updated_at = NOW()
WHERE code = 'SUPER_ADMIN';

UPDATE public.roles 
SET 
    allowed_menus = '["dashboard", "vehicles", "yard", "pdi", "repairs", "qa", "challans", "reports"]'::jsonb,
    permissions = '["view", "create", "edit", "approve", "export"]'::jsonb,
    brand_scope = 'ALL',
    updated_at = NOW()
WHERE code = 'HO_ADMIN';

UPDATE public.roles 
SET 
    allowed_menus = '["dashboard", "vehicles", "yard", "pdi", "repairs", "qa", "challans", "reports"]'::jsonb,
    permissions = '["view", "create", "edit", "approve", "export"]'::jsonb,
    brand_scope = 'ASSIGNED',
    updated_at = NOW()
WHERE code = 'BRANCH_MANAGER';

UPDATE public.roles 
SET 
    allowed_menus = '["dashboard", "pdi", "repairs"]'::jsonb,
    permissions = '["view", "create", "edit"]'::jsonb,
    brand_scope = 'ASSIGNED',
    updated_at = NOW()
WHERE code = 'PDI_ENGINEER';

UPDATE public.roles 
SET 
    allowed_menus = '["dashboard", "qa", "repairs", "reports"]'::jsonb,
    permissions = '["view", "approve", "export"]'::jsonb,
    brand_scope = 'ASSIGNED',
    updated_at = NOW()
WHERE code = 'QA_MANAGER';

UPDATE public.roles 
SET 
    allowed_menus = '["dashboard", "repairs", "vehicles"]'::jsonb,
    permissions = '["view", "create", "edit"]'::jsonb,
    brand_scope = 'ASSIGNED',
    updated_at = NOW()
WHERE code = 'WORKSHOP_MANAGER';

-- ----------------------------------------------------------------------------
-- 3. USERS TABLE ENHANCEMENT
-- ----------------------------------------------------------------------------
-- Add requested columns to public.users:
-- nam (name)
-- user id (user_id)
-- email (email)
-- password (password / password_hash)
-- last login date and time (last_login_at)
-- last password change date and time (last_password_change_at)
-- last password (last_password)
-- current password (current_password)
-- last login ip adress (last_login_ip)
-- brand_id (FK to brand table)

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS user_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS password TEXT,
ADD COLUMN IF NOT EXISTS current_password TEXT,
ADD COLUMN IF NOT EXISTS last_password TEXT,
ADD COLUMN IF NOT EXISTS last_password_change_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(100),
ADD COLUMN IF NOT EXISTS brand_id VARCHAR(50) REFERENCES public.brand(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role_id VARCHAR(100) DEFAULT 'SUPER_ADMIN';

-- Populate user_id and name for existing rows if null
UPDATE public.users 
SET 
    user_id = COALESCE(user_id, employee_id, user_code),
    name = COALESCE(name, TRIM(first_name || ' ' || COALESCE(last_name, ''))),
    current_password = COALESCE(current_password, 'Rajni@123'),
    password = COALESCE(password, password_hash)
WHERE user_id IS NULL OR name IS NULL;

-- Ensure unique constraint on user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_user_id_unique'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_user_id_unique UNIQUE (user_id);
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 4. CREATE SYNONYM / VIEW: public."user"
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public."user" AS 
SELECT 
    id,
    user_id,
    name,
    email,
    password,
    current_password,
    last_password,
    last_login_at,
    last_password_change_at,
    last_login_ip,
    brand_id,
    brand,
    role,
    role_id,
    phone,
    designation,
    nature,
    is_active,
    organization_id,
    branch_id,
    created_at,
    updated_at
FROM public.users;

-- ----------------------------------------------------------------------------
-- 5. SEED INITIAL USER: Admin / Rajni@123 / bishnoi.sny@gmail.com
-- ----------------------------------------------------------------------------
INSERT INTO public.users (
    id,
    organization_id,
    employee_id,
    user_id,
    user_code,
    first_name,
    last_name,
    name,
    email,
    phone,
    role,
    role_id,
    designation,
    brand,
    brand_id,
    nature,
    password_hash,
    password,
    current_password,
    last_password,
    last_password_change_at,
    is_active,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'Admin',
    'Admin',
    'Admin',
    'System',
    'Administrator',
    'Admin',
    'bishnoi.sny@gmail.com',
    '+919829010000',
    'SUPER_ADMIN',
    'SUPER_ADMIN',
    'System Administrator',
    'ALL',
    NULL, -- NULL brand_id allows full access to all brands (Tata & Hyundai)
    'Management',
    crypt('Rajni@123', gen_salt('bf')),
    crypt('Rajni@123', gen_salt('bf')),
    'Rajni@123',
    NULL,
    NOW(),
    true,
    NOW(),
    NOW()
)
ON CONFLICT (employee_id) DO UPDATE SET 
    user_id = 'Admin',
    name = 'Admin',
    email = 'bishnoi.sny@gmail.com',
    password_hash = crypt('Rajni@123', gen_salt('bf')),
    password = crypt('Rajni@123', gen_salt('bf')),
    current_password = 'Rajni@123',
    last_password_change_at = NOW(),
    role = 'SUPER_ADMIN',
    role_id = 'SUPER_ADMIN',
    brand = 'ALL',
    brand_id = NULL,
    is_active = true,
    updated_at = NOW();

-- ----------------------------------------------------------------------------
-- 6. SETUP SUPABASE AUTH MAIL SYSTEM FOR bishnoi.sny@gmail.com
-- ----------------------------------------------------------------------------
-- Ensure auth.users has the admin user configured so native Supabase auth & email services can send emails
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'bishnoi.sny@gmail.com',
    crypt('Rajni@123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Admin", "username": "Admin", "brand": "ALL", "role": "SUPER_ADMIN"}'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET 
    email = 'bishnoi.sny@gmail.com',
    encrypted_password = crypt('Rajni@123', gen_salt('bf')),
    email_confirmed_at = NOW(),
    raw_user_meta_data = '{"name": "Admin", "username": "Admin", "brand": "ALL", "role": "SUPER_ADMIN"}'::jsonb,
    updated_at = NOW();

-- ----------------------------------------------------------------------------
-- 7. UPDATE AUTHENTICATION RPC (Tracking last_login_ip & returning brand + role menus)
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION authenticate_user(
    p_identifier TEXT, 
    p_password TEXT,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user RECORD;
    v_role RECORD;
    v_token TEXT;
    v_result JSONB;
    v_clean_id TEXT;
    v_brand_name TEXT;
BEGIN
    v_clean_id := LOWER(TRIM(COALESCE(p_identifier, '')));

    IF v_clean_id = '' OR p_password IS NULL OR p_password = '' THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'User ID and password are required'
        );
    END IF;

    -- Lookup user by user_id, employee_id, user_code, or email
    SELECT 
        u.id, u.organization_id, u.branch_id, 
        COALESCE(u.user_id, u.employee_id, u.user_code) AS user_id,
        COALESCE(u.name, TRIM(u.first_name || ' ' || COALESCE(u.last_name, ''))) AS full_name,
        u.email, u.phone, u.role, u.designation,
        u.brand, u.brand_id, u.nature, u.password_hash, u.password, u.current_password,
        u.last_login_at, u.last_password_change_at, u.is_active
    INTO v_user
    FROM public.users u
    WHERE (
        LOWER(COALESCE(u.user_id, '')) = v_clean_id OR
        LOWER(COALESCE(u.employee_id, '')) = v_clean_id OR
        LOWER(COALESCE(u.user_code, '')) = v_clean_id OR
        LOWER(COALESCE(u.email, '')) = v_clean_id
    )
    AND u.is_active = true
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Invalid User ID. User does not exist.'
        );
    END IF;

    -- Verify Password
    IF (v_user.password IS NOT NULL AND v_user.password != '') OR 
       (v_user.password_hash IS NOT NULL AND v_user.password_hash != '') OR
       (v_user.current_password IS NOT NULL AND v_user.current_password != '') THEN
       
        IF v_user.current_password != p_password
           AND v_user.password_hash != p_password
           AND v_user.password_hash != crypt(p_password, v_user.password_hash)
           AND (v_user.password IS NULL OR (v_user.password != p_password AND v_user.password != crypt(p_password, v_user.password))) THEN
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

    -- Update last login timestamp and IP address
    UPDATE public.users 
    SET 
        last_login_at = NOW(),
        last_login_ip = COALESCE(p_ip_address, last_login_ip)
    WHERE id = v_user.id;

    -- Fetch Role details (allowed_menus, permissions, brand_scope)
    SELECT * INTO v_role 
    FROM public.roles 
    WHERE code::text = v_user.role::text OR code::text = 'SUPER_ADMIN'
    LIMIT 1;

    -- Determine brand name
    IF v_user.brand_id IS NOT NULL THEN
        SELECT name INTO v_brand_name FROM public.brand WHERE id = v_user.brand_id;
    END IF;
    v_brand_name := COALESCE(v_brand_name, v_user.brand, 'ALL');

    -- Generate session token string
    v_token := 'jwt_dhoot_' || v_user.user_id || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT;

    -- Build user response with Role Window and Brand permissions
    v_result := jsonb_build_object(
        'success', true,
        'token', v_token,
        'user', jsonb_build_object(
            'id', v_user.id,
            'userId', v_user.user_id,
            'userName', v_user.full_name,
            'email', COALESCE(v_user.email, ''),
            'phone', COALESCE(v_user.phone, ''),
            'role', COALESCE(v_user.role, 'SUPER_ADMIN'),
            'designation', COALESCE(v_user.designation, 'System Administrator'),
            'brand', v_brand_name,
            'brandId', v_user.brand_id,
            'hasDualBrandAccess', (v_user.brand = 'ALL' OR v_user.role IN ('SUPER_ADMIN', 'ADMIN') OR v_user.brand_id IS NULL),
            'allowedMenus', COALESCE(v_role.allowed_menus, '["dashboard", "vehicles", "yard", "pdi", "repairs", "qa", "challans", "reports"]'::jsonb),
            'permissions', COALESCE(v_role.permissions, '["view", "create", "edit"]'::jsonb),
            'lastLoginAt', NOW(),
            'lastPasswordChangeAt', v_user.last_password_change_at
        )
    );

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT, TEXT) TO service_role;

-- ----------------------------------------------------------------------------
-- 8. UPDATE PASSWORD RESET RPC (tracking last_password & last_password_change_at)
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS verify_reset_otp_and_change_password(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION verify_reset_otp_and_change_password(
    p_identifier TEXT,
    p_otp TEXT,
    p_new_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user RECORD;
    v_otp_rec RECORD;
    v_clean_id TEXT;
    v_clean_otp TEXT;
    v_old_pwd TEXT;
BEGIN
    v_clean_id := LOWER(TRIM(COALESCE(p_identifier, '')));
    v_clean_otp := TRIM(COALESCE(p_otp, ''));

    IF v_clean_id = '' OR v_clean_otp = '' OR p_new_password IS NULL OR p_new_password = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'All fields are required');
    END IF;

    -- Lookup user
    SELECT id, email, user_id, current_password, password_hash
    INTO v_user
    FROM public.users
    WHERE (
        LOWER(COALESCE(user_id, '')) = v_clean_id OR
        LOWER(COALESCE(employee_id, '')) = v_clean_id OR
        LOWER(COALESCE(email, '')) = v_clean_id
    )
    AND is_active = true
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'User not found');
    END IF;

    -- Verify valid OTP
    SELECT * INTO v_otp_rec
    FROM public.password_reset_otps
    WHERE user_id = v_user.id
      AND otp_code = v_clean_otp
      AND is_used = false
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired OTP. Please request a new OTP.');
    END IF;

    -- Mark OTP as used
    UPDATE public.password_reset_otps 
    SET is_used = true 
    WHERE id = v_otp_rec.id;

    -- Preserve last password for audit history
    v_old_pwd := COALESCE(v_user.current_password, v_user.password_hash);

    -- Update user password in public.users
    UPDATE public.users
    SET 
        password_hash = crypt(p_new_password, gen_salt('bf')),
        password = crypt(p_new_password, gen_salt('bf')),
        current_password = p_new_password,
        last_password = v_old_pwd,
        last_password_change_at = NOW(),
        updated_at = NOW()
    WHERE id = v_user.id;

    -- Also synchronize with auth.users if exists
    UPDATE auth.users
    SET 
        encrypted_password = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE email = v_user.email;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Password updated successfully! Please sign in with your new password.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION verify_reset_otp_and_change_password(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_reset_otp_and_change_password(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_reset_otp_and_change_password(TEXT, TEXT, TEXT) TO service_role;

-- ----------------------------------------------------------------------------
-- 9. UPDATE REQUEST PASSWORD RESET RPC
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS request_password_reset(TEXT);

CREATE OR REPLACE FUNCTION request_password_reset(p_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user RECORD;
    v_otp TEXT;
    v_masked_email TEXT;
    v_email_parts TEXT[];
    v_username_part TEXT;
    v_domain_part TEXT;
BEGIN
    SELECT id, user_id, employee_id, user_code, email, name, first_name, last_name
    INTO v_user
    FROM public.users
    WHERE LOWER(COALESCE(user_id, '')) = LOWER(TRIM(p_username))
       OR LOWER(COALESCE(employee_id, '')) = LOWER(TRIM(p_username))
       OR LOWER(COALESCE(user_code, '')) = LOWER(TRIM(p_username))
       OR LOWER(COALESCE(email, '')) = LOWER(TRIM(p_username))
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Username not found in system.');
    END IF;

    IF v_user.email IS NULL OR v_user.email = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'No registered email found for this user. Please contact administration.');
    END IF;

    -- Generate 6 digit numeric OTP
    v_otp := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');

    -- Delete any old OTPs for this user
    DELETE FROM public.password_reset_otps WHERE user_id = v_user.id;

    -- Insert new OTP valid for 15 minutes
    INSERT INTO public.password_reset_otps (user_id, username, email, otp, expires_at)
    VALUES (v_user.id, COALESCE(v_user.user_id, v_user.employee_id, v_user.user_code), v_user.email, v_otp, NOW() + INTERVAL '15 minutes');

    -- Mask email e.g. bi***i@gmail.com
    v_email_parts := string_to_array(v_user.email, '@');
    v_username_part := v_email_parts[1];
    v_domain_part := v_email_parts[2];

    IF LENGTH(v_username_part) <= 2 THEN
        v_masked_email := v_username_part || '***@' || v_domain_part;
    ELSE
        v_masked_email := SUBSTRING(v_username_part FROM 1 FOR 2) || '***' || 
                          SUBSTRING(v_username_part FROM LENGTH(v_username_part) FOR 1) || 
                          '@' || v_domain_part;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', '6-digit OTP sent to registered email address.',
        'email', v_masked_email,
        'raw_email', v_user.email,
        'otp', v_otp
    );
END;
$$;

GRANT EXECUTE ON FUNCTION request_password_reset(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION request_password_reset(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION request_password_reset(TEXT) TO service_role;

