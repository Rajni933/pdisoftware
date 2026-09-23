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
