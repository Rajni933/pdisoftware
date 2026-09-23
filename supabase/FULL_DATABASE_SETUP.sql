-- ====================================================
-- AUTOPRIME PDI PLATFORM — COMPLETE SUPABASE DATABASE SETUP
-- Generated: 2026-09-21T10:41:33.323Z
-- Includes all Phase 1 to Phase 9 schemas, RLS, indexes & triggers
-- ====================================================

-- >>>>> MIGRATION: 20260825130000_phase1_core_schema.sql <<<<<
﻿-- Autoprime Tata PDI Management Platform - Phase 1 Core Schema
-- Version: 1.0.0
-- Description: Organizations, Branches, Roles, Permissions, Users, Devices, Audit Logs, and RLS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM (
        'SUPER_ADMIN',
        'HO_ADMIN',
        'REGIONAL_MANAGER',
        'BRANCH_MANAGER',
        'PDI_ENGINEER',
        'WORKSHOP_MANAGER',
        'TECHNICIAN',
        'QA_MANAGER',
        'VIEWER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE device_platform_enum AS ENUM ('IOS', 'ANDROID', 'WEB');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE device_status_enum AS ENUM ('ACTIVE', 'REVOKED', 'PENDING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_severity_enum AS ENUM ('INFO', 'WARNING', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. ORGANIZATIONAL STRUCTURE
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

CREATE TABLE IF NOT EXISTS stockyards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 50 CHECK (capacity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(branch_id, code)
);

-- 2. IDENTITY, ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code user_role_enum UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- 3. DEVICE SECURITY
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_fingerprint VARCHAR(255) NOT NULL,
    platform device_platform_enum NOT NULL,
    os_version VARCHAR(50) NOT NULL,
    app_version VARCHAR(50) NOT NULL,
    push_token TEXT,
    status device_status_enum NOT NULL DEFAULT 'ACTIVE',
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(user_id, device_fingerprint)
);

-- 4. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role user_role_enum,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    severity audit_severity_enum NOT NULL DEFAULT 'INFO',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SYSTEM SETTINGS & FEATURE FLAGS
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, key)
);

CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_branches_organization ON branches(organization_id);
CREATE INDEX IF NOT EXISTS idx_branches_zone ON branches(zone_id);
CREATE INDEX IF NOT EXISTS idx_stockyards_branch ON stockyards(branch_id);
CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- 7. RLS HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION get_auth_user_role()
RETURNS user_role_enum AS $$
    SELECT r.code 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_auth_user_branch_id()
RETURNS UUID AS $$
    SELECT branch_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_auth_user_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 8. ENABLE RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stockyards ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- 9. POLICIES (DROP EXISTING IF RE-RUNNING)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Super admin and HO view organizations" ON organizations;
    DROP POLICY IF EXISTS "Users view branches within scope" ON branches;
    DROP POLICY IF EXISTS "Users can view users within branch or HO scope" ON users;
    DROP POLICY IF EXISTS "Users can manage own devices" ON devices;
    DROP POLICY IF EXISTS "Authorized roles can read audit logs" ON audit_logs;
    DROP POLICY IF EXISTS "No deletion on audit logs" ON audit_logs;
    DROP POLICY IF EXISTS "No updates on audit logs" ON audit_logs;
EXCEPTION WHEN OTHERS THEN null;
END $$;

CREATE POLICY "Super admin and HO view organizations"
    ON organizations FOR SELECT
    USING (get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN') OR id = get_auth_user_org_id());

CREATE POLICY "Users view branches within scope"
    ON branches FOR SELECT
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN') 
        OR id = get_auth_user_branch_id()
    );

CREATE POLICY "Users can view users within branch or HO scope"
    ON users FOR SELECT
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN') 
        OR branch_id = get_auth_user_branch_id()
        OR id = auth.uid()
    );

CREATE POLICY "Users can manage own devices"
    ON devices FOR ALL
    USING (user_id = auth.uid() OR get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN'));

CREATE POLICY "Authorized roles can read audit logs"
    ON audit_logs FOR SELECT
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN')
        OR (get_auth_user_role() = 'BRANCH_MANAGER' AND actor_id IN (SELECT id FROM users WHERE branch_id = get_auth_user_branch_id()))
    );

CREATE POLICY "No deletion on audit logs" ON audit_logs FOR DELETE USING (false);
CREATE POLICY "No updates on audit logs" ON audit_logs FOR UPDATE USING (false);


-- >>>>> MIGRATION: 20260825140000_phase2_vehicles_and_assignments.sql <<<<<
﻿-- Autoprime Tata PDI Management Platform - Phase 2: Vehicles & Assignments
-- Version: 1.0.0

DO $$ BEGIN
    CREATE TYPE vehicle_status_enum AS ENUM (
        'RECEIVED',
        'PDI_PENDING',
        'PDI_IN_PROGRESS',
        'PDI_FAILED',
        'REPAIR_PENDING',
        'REPAIR_IN_PROGRESS',
        'REPAIR_COMPLETED',
        'REINSPECTION',
        'QA_PENDING',
        'QA_REJECTED',
        'PDI_APPROVED',
        'DELIVERY_READY',
        'DELIVERED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assignment_status_enum AS ENUM (
        'ASSIGNED',
        'IN_PROGRESS',
        'COMPLETED',
        'REASSIGNED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    stockyard_id UUID REFERENCES stockyards(id) ON DELETE SET NULL,
    vin VARCHAR(17) UNIQUE NOT NULL,
    chassis_number VARCHAR(50) NOT NULL,
    engine_number VARCHAR(50),
    model VARCHAR(100) NOT NULL,
    variant VARCHAR(100) NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    manufacturing_year INT NOT NULL CHECK (manufacturing_year >= 2020),
    status vehicle_status_enum NOT NULL DEFAULT 'RECEIVED',
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. VEHICLE STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS vehicle_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    from_status vehicle_status_enum,
    to_status vehicle_status_enum NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PDI ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS pdi_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status assignment_status_enum NOT NULL DEFAULT 'ASSIGNED',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_branch_status ON vehicles(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_vehicles_model ON vehicles(model);
CREATE INDEX IF NOT EXISTS idx_status_history_vehicle ON vehicle_status_history(vehicle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_to ON pdi_assignments(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_assignments_vehicle ON pdi_assignments(vehicle_id);

-- 5. ENABLE RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_assignments ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view vehicles within branch/HO scope" ON vehicles;
    DROP POLICY IF EXISTS "Managers can insert/update vehicles" ON vehicles;
    DROP POLICY IF EXISTS "Users can view status history" ON vehicle_status_history;
    DROP POLICY IF EXISTS "Users can view assignments" ON pdi_assignments;
    DROP POLICY IF EXISTS "Managers can create assignments" ON pdi_assignments;
EXCEPTION WHEN OTHERS THEN null;
END $$;

CREATE POLICY "Users can view vehicles within branch/HO scope"
    ON vehicles FOR SELECT
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN') 
        OR branch_id = get_auth_user_branch_id()
    );

CREATE POLICY "Managers can insert/update vehicles"
    ON vehicles FOR ALL
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN', 'BRANCH_MANAGER')
    );

CREATE POLICY "Users can view status history"
    ON vehicle_status_history FOR SELECT
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN')
        OR vehicle_id IN (SELECT id FROM vehicles WHERE branch_id = get_auth_user_branch_id())
    );

CREATE POLICY "Users can view assignments"
    ON pdi_assignments FOR SELECT
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN', 'BRANCH_MANAGER', 'QA_MANAGER')
        OR assigned_to = auth.uid()
    );

CREATE POLICY "Managers can create assignments"
    ON pdi_assignments FOR ALL
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN', 'BRANCH_MANAGER')
    );


-- >>>>> MIGRATION: 20260825150000_phase3_checklist_engine.sql <<<<<
﻿-- Autoprime Tata PDI Management Platform - Phase 3: Configurable PDI Checklist Engine
-- Version: 1.0.0

DO $$ BEGIN
    CREATE TYPE response_type_enum AS ENUM (
        'PASS_FAIL',
        'NUMERIC',
        'TEXT',
        'PHOTO_REQUIRED',
        'BOOLEAN',
        'MULTI_SELECT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level_enum AS ENUM (
        'CRITICAL',
        'MAJOR',
        'MINOR',
        'OBSERVATION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pdi_session_status_enum AS ENUM (
        'DRAFT',
        'IN_PROGRESS',
        'SUBMITTED',
        'APPROVED',
        'REJECTED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. CHECKLIST TEMPLATES
CREATE TABLE IF NOT EXISTS checklist_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    model_pattern VARCHAR(100) NOT NULL, -- e.g. 'Tata Nexon', 'Tata Harrier', 'ALL'
    fuel_type VARCHAR(50) DEFAULT 'ALL', -- 'PETROL', 'DIESEL', 'EV', 'CNG', 'ALL'
    transmission VARCHAR(50) DEFAULT 'ALL',
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CHECKLIST CATEGORIES
CREATE TABLE IF NOT EXISTS checklist_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(template_id, code)
);

-- 3. CHECKLIST ITEMS
CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES checklist_categories(id) ON DELETE CASCADE,
    item_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    response_type response_type_enum NOT NULL DEFAULT 'PASS_FAIL',
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    evidence_required BOOLEAN NOT NULL DEFAULT false,
    failure_severity severity_level_enum NOT NULL DEFAULT 'MAJOR',
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(category_id, item_code)
);

-- 4. PDI SESSIONS (INSPECTION RUNS)
CREATE TABLE IF NOT EXISTS pdi_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE RESTRICT,
    inspector_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    status pdi_session_status_enum NOT NULL DEFAULT 'IN_PROGRESS',
    progress_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    total_items INT NOT NULL DEFAULT 0,
    passed_items INT NOT NULL DEFAULT 0,
    failed_items INT NOT NULL DEFAULT 0,
    na_items INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CHECKLIST RESPONSES
CREATE TABLE IF NOT EXISTS checklist_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES pdi_sessions(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL, -- 'PASS', 'FAIL', 'NA'
    numeric_value NUMERIC(10, 2),
    text_value TEXT,
    remarks TEXT,
    media_count INT NOT NULL DEFAULT 0,
    responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, item_id)
);

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_checklist_categories_template ON checklist_categories(template_id, display_order);
CREATE INDEX IF NOT EXISTS idx_checklist_items_category ON checklist_items(category_id, display_order);
CREATE INDEX IF NOT EXISTS idx_pdi_sessions_vehicle ON pdi_sessions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_pdi_sessions_inspector ON pdi_sessions(inspector_id, status);
CREATE INDEX IF NOT EXISTS idx_checklist_responses_session ON checklist_responses(session_id);

-- 7. ENABLE RLS
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_responses ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES
DO $$ BEGIN
    DROP POLICY IF EXISTS "All users view active checklist templates" ON checklist_templates;
    DROP POLICY IF EXISTS "All users view categories" ON checklist_categories;
    DROP POLICY IF EXISTS "All users view checklist items" ON checklist_items;
    DROP POLICY IF EXISTS "Users view PDI sessions in branch" ON pdi_sessions;
    DROP POLICY IF EXISTS "Engineers create and update own PDI sessions" ON pdi_sessions;
    DROP POLICY IF EXISTS "Users view and manage responses for permitted sessions" ON checklist_responses;
EXCEPTION WHEN OTHERS THEN null;
END $$;

CREATE POLICY "All users view active checklist templates"
    ON checklist_templates FOR SELECT
    USING (is_active = true);

CREATE POLICY "All users view categories"
    ON checklist_categories FOR SELECT
    USING (true);

CREATE POLICY "All users view checklist items"
    ON checklist_items FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users view PDI sessions in branch"
    ON pdi_sessions FOR SELECT
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN')
        OR branch_id = get_auth_user_branch_id()
    );

CREATE POLICY "Engineers create and update own PDI sessions"
    ON pdi_sessions FOR ALL
    USING (
        inspector_id = auth.uid()
        OR get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN', 'BRANCH_MANAGER', 'QA_MANAGER')
    );

CREATE POLICY "Users view and manage responses for permitted sessions"
    ON checklist_responses FOR ALL
    USING (
        session_id IN (
            SELECT id FROM pdi_sessions 
            WHERE inspector_id = auth.uid() 
               OR branch_id = get_auth_user_branch_id() 
               OR get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN')
        )
    );


-- >>>>> MIGRATION: 20260825160000_phase4_and_5_media_and_repairs.sql <<<<<
﻿-- Autoprime Tata PDI Management Platform - Phase 4 & 5: Media, Damage Findings & Repairs
-- Version: 1.0.0

DO $$ BEGIN
    CREATE TYPE attachment_status_enum AS ENUM ('PENDING', 'UPLOADED', 'FAILED', 'DELETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE finding_status_enum AS ENUM ('OPEN', 'REPAIR_ASSIGNED', 'RESOLVED', 'REINSPECTED', 'WAIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE repair_priority_enum AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE repair_status_enum AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. ATTACHMENTS (R2 MEDIA METADATA)
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES pdi_sessions(id) ON DELETE SET NULL,
    finding_id UUID,
    slot_code VARCHAR(100) NOT NULL, -- e.g. 'exterior-front', 'interior-dashboard', 'damage-01'
    object_key TEXT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT,
    status attachment_status_enum NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INSPECTION FINDINGS (DAMAGE & DEFECTS)
CREATE TABLE IF NOT EXISTS inspection_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES pdi_sessions(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    item_id UUID REFERENCES checklist_items(id) ON DELETE SET NULL,
    severity severity_level_enum NOT NULL DEFAULT 'MAJOR',
    body_area VARCHAR(100) NOT NULL, -- 'FRONT_BUMPER', 'HOOD', 'LEFT_DOOR', 'WINDSHIELD', etc.
    description TEXT NOT NULL,
    status finding_status_enum NOT NULL DEFAULT 'OPEN',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. REPAIR TICKETS (WORKSHOP ASSIGNMENTS)
CREATE TABLE IF NOT EXISTS repair_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_id UUID NOT NULL REFERENCES inspection_findings(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    priority repair_priority_enum NOT NULL DEFAULT 'HIGH',
    status repair_status_enum NOT NULL DEFAULT 'OPEN',
    assigned_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    parts_required TEXT,
    work_notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_attachments_vehicle ON attachments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_attachments_session ON attachments(session_id);
CREATE INDEX IF NOT EXISTS idx_findings_session ON inspection_findings(session_id);
CREATE INDEX IF NOT EXISTS idx_findings_vehicle ON inspection_findings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_branch ON repair_tickets(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_technician ON repair_tickets(assigned_technician_id);

-- 5. ENABLE RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_tickets ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users view attachments in branch" ON attachments;
    DROP POLICY IF EXISTS "Users manage attachments" ON attachments;
    DROP POLICY IF EXISTS "Users view findings" ON inspection_findings;
    DROP POLICY IF EXISTS "Engineers manage findings" ON inspection_findings;
    DROP POLICY IF EXISTS "Workshop and Managers view repair tickets" ON repair_tickets;
    DROP POLICY IF EXISTS "Workshop and Managers manage repair tickets" ON repair_tickets;
EXCEPTION WHEN OTHERS THEN null;
END $$;

CREATE POLICY "Users view attachments in branch" ON attachments FOR SELECT USING (true);
CREATE POLICY "Users manage attachments" ON attachments FOR ALL USING (true);
CREATE POLICY "Users view findings" ON inspection_findings FOR SELECT USING (true);
CREATE POLICY "Engineers manage findings" ON inspection_findings FOR ALL USING (true);
CREATE POLICY "Workshop and Managers view repair tickets" ON repair_tickets FOR SELECT USING (true);
CREATE POLICY "Workshop and Managers manage repair tickets" ON repair_tickets FOR ALL USING (true);


-- >>>>> MIGRATION: 20260825170000_phase6_qa_and_certificates.sql <<<<<
﻿-- Autoprime Tata PDI Management Platform - Phase 6: QA Approvals & Digital Certificates
-- Version: 1.0.0

DO $$ BEGIN
    CREATE TYPE qa_decision_enum AS ENUM ('APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. QA REVIEWS
CREATE TABLE IF NOT EXISTS qa_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES pdi_sessions(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    reviewed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    decision qa_decision_enum NOT NULL,
    comments TEXT,
    rejection_reason_code VARCHAR(100),
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PDI CERTIFICATES
CREATE TABLE IF NOT EXISTS pdi_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES pdi_sessions(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    issued_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verification_qr_token VARCHAR(100) UNIQUE NOT NULL,
    pdf_object_key TEXT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_qa_reviews_vehicle ON qa_reviews(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_qa_reviews_session ON qa_reviews(session_id);
CREATE INDEX IF NOT EXISTS idx_pdi_certificates_vehicle ON pdi_certificates(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_pdi_certificates_token ON pdi_certificates(verification_qr_token);

-- 4. ENABLE RLS
ALTER TABLE qa_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_certificates ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public select qa_reviews" ON qa_reviews;
    DROP POLICY IF EXISTS "Public select certificates" ON pdi_certificates;
EXCEPTION WHEN OTHERS THEN null;
END $$;

CREATE POLICY "Public select qa_reviews" ON qa_reviews FOR ALL USING (true);
CREATE POLICY "Public select certificates" ON pdi_certificates FOR ALL USING (true);


-- >>>>> MIGRATION: 20260825180000_phase7_commercial_bookings_and_challans.sql <<<<<
-- Autoprime Tata PDI Management Platform - Phase 7: Commercial Bookings & Delivery Challans
-- Version: 1.0.0
-- Description: Customer bookings from DMS/CRM and delivery challan invoices with RLS and indexing

-- 1. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    receipt_no VARCHAR(100) UNIQUE NOT NULL,
    booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(30) NOT NULL,
    city VARCHAR(100),
    brand VARCHAR(100) NOT NULL DEFAULT 'Tata Motors',
    model VARCHAR(100) NOT NULL,
    variant VARCHAR(100) NOT NULL,
    colour VARCHAR(100) NOT NULL,
    sales_consultant VARCHAR(255),
    team_leader VARCHAR(255),
    financier_name VARCHAR(255),
    corporate NUMERIC(12,2) DEFAULT 0,
    exchange NUMERIC(12,2) DEFAULT 0,
    ex_showroom NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    net NUMERIC(12,2) NOT NULL DEFAULT 0,
    insurance_per NUMERIC(5,2) DEFAULT 0,
    insurance_amount NUMERIC(12,2) DEFAULT 0,
    rto NUMERIC(12,2) DEFAULT 0,
    tcs NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    down_payment NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'BOOKED',
    allocated_vin_no VARCHAR(17),
    allotment_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 2. CHALLAN INVOICES TABLE
CREATE TABLE IF NOT EXISTS challan_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    challan_no VARCHAR(100) UNIQUE NOT NULL,
    invoice_no VARCHAR(100),
    challan_type VARCHAR(100) NOT NULL DEFAULT 'TAX_INVOICE_DELIVERY',
    booking_date DATE,
    challan_date DATE DEFAULT CURRENT_DATE,
    delivery_date DATE,
    vin_no VARCHAR(17) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    mobile_no VARCHAR(30),
    city VARCHAR(100),
    model VARCHAR(100) NOT NULL,
    variant VARCHAR(100) NOT NULL,
    colour VARCHAR(100) NOT NULL,
    sale_consultant VARCHAR(255),
    team_leader VARCHAR(255),
    financier_name VARCHAR(255),
    corporate NUMERIC(12,2) DEFAULT 0,
    exchange NUMERIC(12,2) DEFAULT 0,
    ex_showroom NUMERIC(12,2) DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    net NUMERIC(12,2) DEFAULT 0,
    insurance_per NUMERIC(5,2) DEFAULT 0,
    insurance_amount NUMERIC(12,2) DEFAULT 0,
    rto NUMERIC(12,2) DEFAULT 0,
    tcs NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ISSUED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_bookings_org_id ON bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_branch_id ON bookings(branch_id);
CREATE INDEX IF NOT EXISTS idx_bookings_receipt_no ON bookings(receipt_no);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_allocated_vin ON bookings(allocated_vin_no);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(mobile_number);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_challans_org_id ON challan_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_challans_branch_id ON challan_invoices(branch_id);
CREATE INDEX IF NOT EXISTS idx_challans_challan_no ON challan_invoices(challan_no);
CREATE INDEX IF NOT EXISTS idx_challans_invoice_no ON challan_invoices(invoice_no);
CREATE INDEX IF NOT EXISTS idx_challans_vin_no ON challan_invoices(vin_no);
CREATE INDEX IF NOT EXISTS idx_challans_created_at ON challan_invoices(created_at DESC);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE challan_invoices ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DROP POLICY IF EXISTS bookings_service_role ON bookings;
CREATE POLICY bookings_service_role ON bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS challans_service_role ON challan_invoices;
CREATE POLICY challans_service_role ON challan_invoices FOR ALL USING (true) WITH CHECK (true);

-- Allow authenticated users scoped access
DROP POLICY IF EXISTS bookings_auth_read ON bookings;
CREATE POLICY bookings_auth_read ON bookings FOR SELECT TO authenticated
USING (
    organization_id = ((current_setting('request.jwt.claims', true)::jsonb)->>'organization_id')::uuid
    OR ((current_setting('request.jwt.claims', true)::jsonb)->>'role') = 'SUPER_ADMIN'
);

DROP POLICY IF EXISTS bookings_auth_write ON bookings;
CREATE POLICY bookings_auth_write ON bookings FOR INSERT TO authenticated
WITH CHECK (
    organization_id = ((current_setting('request.jwt.claims', true)::jsonb)->>'organization_id')::uuid
    OR ((current_setting('request.jwt.claims', true)::jsonb)->>'role') = 'SUPER_ADMIN'
);

DROP POLICY IF EXISTS challans_auth_read ON challan_invoices;
CREATE POLICY challans_auth_read ON challan_invoices FOR SELECT TO authenticated
USING (
    organization_id = ((current_setting('request.jwt.claims', true)::jsonb)->>'organization_id')::uuid
    OR ((current_setting('request.jwt.claims', true)::jsonb)->>'role') = 'SUPER_ADMIN'
);


-- >>>>> MIGRATION: 20260825190000_phase8_automotive_master_tables.sql <<<<<
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


-- >>>>> MIGRATION: 20260825200000_phase9_yard_inwarding_and_automation.sql <<<<<
-- Autoprime Tata PDI Management Platform - Phase 9: Yard Inwarding & Workflow Automation
-- Version: 1.0.0
-- Description: Inbound carrier gate entries, automatic vehicle status audit history, and booking VIN allocation triggers

-- 1. YARD INWARD ENTRIES TABLE
CREATE TABLE IF NOT EXISTS yard_inward_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    stockyard_id UUID REFERENCES stockyards(id) ON DELETE SET NULL,
    gate_entry_no VARCHAR(100) UNIQUE NOT NULL,
    carrier_trailer_no VARCHAR(100) NOT NULL,
    transporter_name VARCHAR(255) NOT NULL,
    driver_name VARCHAR(255),
    driver_phone VARCHAR(50),
    lr_number VARCHAR(100),
    expected_count INT NOT NULL DEFAULT 1,
    received_count INT NOT NULL DEFAULT 1,
    transit_damage_count INT NOT NULL DEFAULT 0,
    received_by UUID REFERENCES users(id) ON DELETE SET NULL,
    unloading_bay VARCHAR(100),
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_yie_org_id ON yard_inward_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_yie_yard_id ON yard_inward_entries(stockyard_id);
CREATE INDEX IF NOT EXISTS idx_yie_trailer_no ON yard_inward_entries(carrier_trailer_no);
CREATE INDEX IF NOT EXISTS idx_yie_received_at ON yard_inward_entries(received_at DESC);

-- 3. ROW LEVEL SECURITY
ALTER TABLE yard_inward_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS yie_service_role ON yard_inward_entries;
CREATE POLICY yie_service_role ON yard_inward_entries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS yie_auth_read ON yard_inward_entries;
CREATE POLICY yie_auth_read ON yard_inward_entries FOR SELECT TO authenticated
USING (
    organization_id = ((current_setting('request.jwt.claims', true)::jsonb)->>'organization_id')::uuid
    OR ((current_setting('request.jwt.claims', true)::jsonb)->>'role') = 'SUPER_ADMIN'
);

-- 4. AUTOMATED TRIGGER: VEHICLE STATUS AUDIT HISTORY
CREATE OR REPLACE FUNCTION log_vehicle_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) OR (OLD.location IS DISTINCT FROM NEW.location) THEN
        INSERT INTO vehicle_status_history (
            vehicle_id,
            from_status,
            to_status,
            reason,
            created_at
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            COALESCE('Status updated to ' || NEW.status || ' (Location: ' || COALESCE(NEW.location, 'N/A') || ')', 'System update'),
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vehicle_status_audit ON vehicles;
CREATE TRIGGER trg_vehicle_status_audit
AFTER UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION log_vehicle_status_change();

-- 5. AUTOMATED TRIGGER: BOOKING VIN ALLOCATION LINK
CREATE OR REPLACE FUNCTION handle_booking_vin_allocation()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.allocated_vin_no IS NOT NULL AND (OLD.allocated_vin_no IS DISTINCT FROM NEW.allocated_vin_no)) THEN
        UPDATE vehicles
        SET customer_name = NEW.customer_name,
            sales_consultant = NEW.sales_consultant,
            status = 'ALLOCATED',
            updated_at = NOW()
        WHERE vin = NEW.allocated_vin_no;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_vin_allocation ON bookings;
CREATE TRIGGER trg_booking_vin_allocation
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION handle_booking_vin_allocation();


-- ====================================================
-- INITIAL SEED DATA (Organizations, Master Data & Fleet)
-- ====================================================

-- >>>>> SEED FILE: 001_phase1_seed.sql <<<<<
﻿-- Autoprime Tata PDI Management Platform - Seed Data

INSERT INTO roles (code, name, description) VALUES
('SUPER_ADMIN', 'Super Administrator', 'Full platform access and cross-organization management'),
('HO_ADMIN', 'Head Office Administrator', 'Head Office administrator with access to all branches'),
('REGIONAL_MANAGER', 'Regional Manager', 'Manages branches within an assigned region'),
('BRANCH_MANAGER', 'Branch Manager', 'Manages vehicle inspection, repairs, and personnel at branch'),
('PDI_ENGINEER', 'PDI Engineer', 'Performs vehicle inspections in stockyard/workshop'),
('WORKSHOP_MANAGER', 'Workshop Manager', 'Manages defect repair tickets and workshop technicians'),
('TECHNICIAN', 'Workshop Technician', 'Executes vehicle repairs and component replacements'),
('QA_MANAGER', 'Quality Assurance Manager', 'Reviews completed inspections and issues PDI certificates'),
('VIEWER', 'Read-Only Viewer', 'Audit and reporting viewer access')
ON CONFLICT (code) DO NOTHING;

INSERT INTO organizations (id, name, code) VALUES
('11111111-1111-1111-1111-111111111111', 'Autoprime Tata - Dhoot Group', 'DHOOT-TATA')
ON CONFLICT (code) DO NOTHING;

INSERT INTO zones (id, organization_id, name, code) VALUES
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'North Zone', 'ZONE-NORTH'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'West Zone', 'ZONE-WEST')
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO branches (id, organization_id, zone_id, name, code, address, city, state, pincode, phone, email) VALUES
('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Autoprime Pune Central', 'PUN-01', 'Plot 45, Nagar Road', 'Pune', 'Maharashtra', '411014', '+912027456789', 'pune.central@autoprimetata.com'),
('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Autoprime Mumbai South', 'MUM-01', 'Sector 12, Worli', 'Mumbai', 'Maharashtra', '400018', '+912224567890', 'mumbai.south@autoprimetata.com')
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO stockyards (id, branch_id, name, code, capacity) VALUES
('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', 'Pune Main Stockyard', 'SY-PUN-01', 200),
('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333332', 'Mumbai Central Yard', 'SY-MUM-01', 150)
ON CONFLICT (branch_id, code) DO NOTHING;

INSERT INTO feature_flags (key, name, description, is_enabled) VALUES
('biometric-unlock', 'Biometric App Unlock', 'Enable biometric FaceID/Fingerprint unlock on mobile', true),
('offline-mode', 'Offline PDI Inspection', 'Allow complete offline inspection caching and sync', true),
('vci-diagnostics', 'Bluetooth VCI Diagnostics', 'ECU and DTC diagnostic scanning interface', false),
('ai-damage-detection', 'AI Damage Detection', 'Computer vision damage severity assistance', false)
ON CONFLICT (key) DO NOTHING;


-- >>>>> SEED FILE: 002_phase2_vehicles_seed.sql <<<<<
﻿-- Sample Tata Motors Vehicles for Autoprime Pune Central (33333333-3333-3333-3333-333333333331)

INSERT INTO vehicles (id, organization_id, branch_id, stockyard_id, vin, chassis_number, engine_number, model, variant, fuel_type, transmission, color, manufacturing_year, status) VALUES
('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444441', 'MAT612345N1234567', 'CH-NXN-9021', 'ENG-NXN-4412', 'Tata Nexon', 'Fearless Plus S DT', 'PETROL', 'DCA', 'Daytona Grey', 2026, 'RECEIVED'),
('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444441', 'MAT612345H7654321', 'CH-HAR-1082', 'ENG-KRY-8819', 'Tata Harrier', 'Fearless Plus Dark', 'DIESEL', 'AUTOMATIC', 'Oberon Black', 2026, 'PDI_PENDING'),
('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444441', 'MAT612345S9988776', 'CH-SAF-5541', 'ENG-KRY-3321', 'Tata Safari', 'Accomplished Plus 6S', 'DIESEL', 'AUTOMATIC', 'Cosmic Gold', 2026, 'PDI_IN_PROGRESS'),
('55555555-5555-5555-5555-555555555554', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444441', 'MAT612345C1122334', 'CH-CRV-3319', 'ENG-EV-9901', 'Tata Curvv.ev', 'Empowered Plus 55', 'EV', 'AUTOMATIC', 'Virtual Sunrise', 2026, 'PDI_APPROVED'),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444441', 'MAT612345P4455667', 'CH-PNC-2204', 'ENG-REV-1092', 'Tata Punch', 'Creative Flagship iCNG', 'CNG', 'MANUAL', 'Atomic Orange', 2026, 'DELIVERY_READY')
ON CONFLICT (vin) DO NOTHING;


-- >>>>> SEED FILE: 003_phase3_checklist_seed.sql <<<<<
﻿-- Autoprime Tata Motors Standard PDI Master Template & Categories

INSERT INTO checklist_templates (id, organization_id, name, model_pattern, fuel_type, version, is_active) VALUES
('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', 'Tata Motors Standard Passenger Vehicle PDI Template', 'ALL', 'ALL', 1, true)
ON CONFLICT (id) DO NOTHING;

-- 1. Categories
INSERT INTO checklist_categories (id, template_id, code, name, description, display_order) VALUES
('77777777-7777-7777-7777-777777777771', '66666666-6666-6666-6666-666666666661', 'EXTERIOR_BODY', 'Exterior & Bodywork', 'Inspection of panels, paint, windshield, chrome badges, and mirrors', 1),
('77777777-7777-7777-7777-777777777772', '66666666-6666-6666-6666-666666666661', 'LIGHTING_ELECTRICAL', 'Lighting & Electricals', 'Headlamps, DRLs, taillights, blinkers, hazard, horn, and wiper motors', 2),
('77777777-7777-7777-7777-777777777773', '66666666-6666-6666-6666-666666666661', 'UNDERHOOD_ENGINE', 'Underhood & Fluid Levels', 'Engine oil, coolant, brake fluid, battery health, wire harnesses', 3),
('77777777-7777-7777-7777-777777777774', '66666666-6666-6666-6666-666666666661', 'UNDERBODY_TYRES', 'Underbody, Wheels & Tyres', 'Tyre pressure, tread, alloy condition, suspension, and underbody shield', 4),
('77777777-7777-7777-7777-777777777775', '66666666-6666-6666-6666-666666666661', 'INTERIOR_CABIN', 'Interior Cabin & Comfort', 'Seat upholstery, dashboard, touch infotainment, AC cooling, power windows', 5),
('77777777-7777-7777-7777-777777777776', '66666666-6666-6666-6666-666666666661', 'BOOT_SPARE_WHEEL', 'Boot & Toolkit', 'Spare wheel, jack, wheel spanner, warning triangle, parcel tray', 6),
('77777777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666661', 'BRAKES_ROAD_TEST', 'Brakes & Road Functionality', 'Brake pedal feel, handbrake / EPB hold, steering response, gear shifting', 7),
('77777777-7777-7777-7777-777777777778', '66666666-6666-6666-6666-666666666661', 'DOCUMENTATION_IDENTITY', 'Vehicle Identity & Documentation', 'VIN plate verification, smart keys (2 keys), manual, warranty booklet', 8)
ON CONFLICT (id) DO NOTHING;

-- 2. Items for EXTERIOR_BODY
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777771', 'EXT-01', 'Panel Gaps & Alignment', 'Check hood, doors, tailgate and bumper shutlines for uniform gap.', 'PASS_FAIL', true, 'MAJOR', 1),
('77777777-7777-7777-7777-777777777771', 'EXT-02', 'Paint Finish & Scratch Inspection', 'Inspect for scratches, paint chips, swirl marks, or transit damage.', 'PASS_FAIL', true, 'CRITICAL', 2),
('77777777-7777-7777-7777-777777777771', 'EXT-03', 'Windshield & Glass Integrity', 'Verify front windshield, rear glass, and window panes are crack-free.', 'PASS_FAIL', true, 'CRITICAL', 3),
('77777777-7777-7777-7777-777777777771', 'EXT-04', 'Wiper Blades & Washer Jet', 'Operate front and rear wipers with washer spray. Check blade wiping quality.', 'PASS_FAIL', true, 'MINOR', 4);

-- 3. Items for LIGHTING_ELECTRICAL
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777772', 'LGT-01', 'LED DRLs & Headlamp High/Low Beam', 'Turn on low beam, high beam, and projector lamps. Verify beam leveling.', 'PASS_FAIL', true, 'CRITICAL', 1),
('77777777-7777-7777-7777-777777777772', 'LGT-02', 'Turn Indicators & Hazard Lamps', 'Verify all front, ORVM, and rear indicator LED sequences and hazard switch.', 'PASS_FAIL', true, 'CRITICAL', 2),
('77777777-7777-7777-7777-777777777772', 'LGT-03', 'Tail Lamps & Reverse Parking Lights', 'Check rear signature light bar, brake lights, and reverse camera lamps.', 'PASS_FAIL', true, 'MAJOR', 3),
('77777777-7777-7777-7777-777777777772', 'LGT-04', 'Dual Horn Functionality', 'Test high and low horn pitch and clarity.', 'PASS_FAIL', true, 'MAJOR', 4);

-- 4. Items for UNDERHOOD_ENGINE
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777773', 'ENG-01', 'Engine Oil Level & Quality', 'Pull dipstick; verify oil level is between MIN and MAX marks.', 'PASS_FAIL', true, 'CRITICAL', 1),
('77777777-7777-7777-7777-777777777773', 'ENG-02', 'Coolant Reservoir Level', 'Check coolant tank level (ensure cold engine). Inspect for hose leaks.', 'PASS_FAIL', true, 'CRITICAL', 2),
('77777777-7777-7777-7777-777777777773', 'ENG-03', 'Brake & Clutch Fluid Level', 'Verify brake fluid tank level is at MAX.', 'PASS_FAIL', true, 'CRITICAL', 3),
('77777777-7777-7777-7777-777777777773', 'ENG-04', '12V Battery Voltage Check', 'Measure open circuit terminal voltage with multimeter (target: >= 12.4V).', 'NUMERIC', true, 'MAJOR', 4);

-- 5. Items for UNDERBODY_TYRES
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777774', 'TYR-01', 'Tyre Pressure Calibration (PSI)', 'Measure and calibrate tyre pressure to manufacturer spec (e.g. 33-36 PSI).', 'NUMERIC', true, 'MAJOR', 1),
('77777777-7777-7777-7777-777777777774', 'TYR-02', 'Alloy Wheels & Sidewall Condition', 'Inspect rims for kerb rash, rim dents, or tyre sidewall cuts/bulges.', 'PASS_FAIL', true, 'CRITICAL', 2),
('77777777-7777-7777-7777-777777777774', 'TYR-03', 'Wheel Lug Nuts Torque', 'Check all wheel lug nuts are tightened to spec.', 'PASS_FAIL', true, 'CRITICAL', 3);

-- 6. Items for INTERIOR_CABIN
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777775', 'INT-01', 'Touchscreen Infotainment & Audio', 'Verify Harman/JBL infotainment, Apple CarPlay/Android Auto, and speakers.', 'PASS_FAIL', true, 'MAJOR', 1),
('77777777-7777-7777-7777-777777777775', 'INT-02', 'AC Cooling & Climate Control', 'Run AC at lowest temperature for 3 minutes; verify blower and vents.', 'PASS_FAIL', true, 'CRITICAL', 2),
('77777777-7777-7777-7777-777777777775', 'INT-03', 'All Power Windows & ORVM Controls', 'Test auto up/down, window lock, and electric mirror fold/adjustment.', 'PASS_FAIL', true, 'MAJOR', 3),
('77777777-7777-7777-7777-777777777775', 'INT-04', 'Odometer Reading (KM)', 'Record current odometer reading from instrument cluster (target: < 50 km).', 'NUMERIC', true, 'MAJOR', 4);

-- 7. Items for BOOT_SPARE_WHEEL
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777776', 'BOT-01', 'Spare Wheel & Tool Kit Complete', 'Check presence of spare tyre, jack, tommy bar, spanner, and tow hook.', 'PASS_FAIL', true, 'CRITICAL', 1),
('77777777-7777-7777-7777-777777777776', 'BOT-02', 'Emergency Warning Triangle & First Aid', 'Verify reflective safety triangle and first aid kit in boot compartment.', 'PASS_FAIL', true, 'MAJOR', 2);

-- 8. Items for BRAKES_ROAD_TEST
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777777', 'BRK-01', 'Foot Brake & Electronic Parking Brake (EPB)', 'Test brake firmness, ABS bite, and EPB auto-hold engagement.', 'PASS_FAIL', true, 'CRITICAL', 1),
('77777777-7777-7777-7777-777777777777', 'BRK-02', 'Steering Centering & Alignment', 'Verify steering wheel is dead-center with zero pull during short yard drive.', 'PASS_FAIL', true, 'MAJOR', 2);

-- 9. Items for DOCUMENTATION_IDENTITY
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777778', 'DOC-01', 'Chassis / VIN Plate Match', 'Match physical VIN stamped on driver B-pillar / under-seat with invoice.', 'PASS_FAIL', true, 'CRITICAL', 1),
('77777777-7777-7777-7777-777777777778', 'DOC-02', '2 Smart Keys / Key Fobs Present', 'Test lock, unlock, and boot release buttons on both physical key fobs.', 'PASS_FAIL', true, 'CRITICAL', 2);


-- >>>>> SEED FILE: 004_phase4_commercial_masters_seed.sql <<<<<
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

-- ============================================================================
-- PRODUCTION CONCURRENCY & INTEGRITY (Phase 10)
-- ============================================================================

-- 1. Prevent double allocation race conditions
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_vin_allocation 
ON bookings (allocated_vin_no) 
WHERE status = 'ALLOCATED' AND allocated_vin_no IS NOT NULL AND allocated_vin_no != '';

CREATE INDEX IF NOT EXISTS idx_vehicles_vin_upper ON vehicles (UPPER(vin));
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles (status);
CREATE INDEX IF NOT EXISTS idx_vehicles_location ON vehicles (location);
CREATE INDEX IF NOT EXISTS idx_bookings_receipt ON bookings (receipt_no);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_challans_no ON challan_invoices (challan_no);
CREATE INDEX IF NOT EXISTS idx_challans_invoice ON challan_invoices (invoice_no);

-- 2. Atomic VIN allocation function
CREATE OR REPLACE FUNCTION allocate_vin_safely(
    p_booking_id TEXT,
    p_receipt_no TEXT,
    p_vin TEXT,
    p_customer_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing_booking RECORD;
BEGIN
    SELECT id, receipt_no, customer_name INTO v_existing_booking
    FROM bookings
    WHERE allocated_vin_no = p_vin 
      AND status = 'ALLOCATED'
      AND receipt_no != p_receipt_no
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Chassis VIN %s is already allocated to booking %s (%s). Duplicate allocation blocked.', p_vin, v_existing_booking.receipt_no, v_existing_booking.customer_name)
        );
    END IF;

    UPDATE bookings
    SET 
        allocated_vin_no = p_vin,
        status = 'ALLOCATED',
        updated_at = NOW()
    WHERE receipt_no = p_receipt_no OR id = p_booking_id;

    UPDATE vehicles
    SET 
        status = 'ALLOCATED',
        customer_name = p_customer_name,
        allocation_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE vin = p_vin;

    RETURN jsonb_build_object('success', true, 'message', 'Vehicle allocated safely.');
END;
$$;

-- ============================================================================
-- DATABASE AUTHENTICATION RPC & STAFF USER SEEDING (Phase 11)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE IF EXISTS users 
ADD COLUMN IF NOT EXISTS user_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'BRANCH_MANAGER',
ADD COLUMN IF NOT EXISTS designation VARCHAR(100),
ADD COLUMN IF NOT EXISTS brand VARCHAR(50) DEFAULT 'ALL',
ADD COLUMN IF NOT EXISTS nature VARCHAR(100) DEFAULT 'Management',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Secure authenticate_user function
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

    UPDATE users SET last_login_at = NOW() WHERE id = v_user.id;

    v_token := 'jwt_dhoot_' || COALESCE(v_user.employee_id, v_user.user_code, 'USR') || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT;

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

GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO service_role;

-- Seed Initial Enterprise Users
INSERT INTO users (
    id, organization_id, employee_id, user_code, first_name, last_name, email, phone, 
    role, designation, brand, nature, password_hash, is_active
) VALUES 
(
    '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 
    'ADMIN01', 'ADMIN01', 'System', 'Administrator', 'admin@dhootgroup.com', '+919829010001',
    'SUPER_ADMIN', 'General Manager', 'ALL', 'Management', crypt('Admin@2026', gen_salt('bf')), true
),
(
    '00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 
    'PDI01', 'PDI01', 'Ramesh', 'Choudhary', 'pdi@dhootgroup.com', '+919829010002',
    'PDI_ENGINEER', 'Senior PDI Inspector', 'Autoprime Tata', 'Quality Inspection', crypt('Pdi@2026', gen_salt('bf')), true
),
(
    '00000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 
    'QA01', 'QA01', 'Sunil', 'Sharma', 'qa@dhootgroup.com', '+919829010003',
    'QA_MANAGER', 'QA Certifying Head', 'ALL', 'Quality Assurance', crypt('Qa@2026', gen_salt('bf')), true
),
(
    '00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 
    'YARD01', 'YARD01', 'Vikram', 'Singh', 'yard@dhootgroup.com', '+919829010004',
    'YARD_MANAGER', 'Basni Yard In-charge', 'Autoprime Tata', 'Stockyard', crypt('Yard@2026', gen_salt('bf')), true
),
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



