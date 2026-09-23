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
