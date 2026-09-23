-- ============================================================================
-- AUTOPRIME PDI MANAGEMENT PLATFORM - PRODUCTION CONCURRENCY & INTEGRITY
-- Migration: 20260825210000_production_security_and_concurrency.sql
-- ============================================================================

-- 1. PREVENT DOUBLE ALLOCATION RACE CONDITIONS
-- Ensures a vehicle chassis VIN can NEVER be allocated to multiple active customer bookings simultaneously
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_vin_allocation 
ON bookings (allocated_vin_no) 
WHERE status = 'ALLOCATED' AND allocated_vin_no IS NOT NULL AND allocated_vin_no != '';

-- Fast lookup indexes on high-traffic columns
CREATE INDEX IF NOT EXISTS idx_vehicles_vin_upper ON vehicles (UPPER(vin));
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles (status);
CREATE INDEX IF NOT EXISTS idx_vehicles_location ON vehicles (location);
CREATE INDEX IF NOT EXISTS idx_bookings_receipt ON bookings (receipt_no);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_challans_no ON challan_invoices (challan_no);
CREATE INDEX IF NOT EXISTS idx_challans_invoice ON challan_invoices (invoice_no);

-- 2. ATOMIC VIN ALLOCATION FUNCTION (Transactional Safety)
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
    v_vehicle_status TEXT;
BEGIN
    -- Check if VIN is already allocated in another active booking
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

    -- Update Booking
    UPDATE bookings
    SET 
        allocated_vin_no = p_vin,
        status = 'ALLOCATED',
        updated_at = NOW()
    WHERE receipt_no = p_receipt_no OR id = p_booking_id;

    -- Update Vehicle
    UPDATE vehicles
    SET 
        customer_name = p_customer_name,
        status = 'ALLOCATED',
        updated_at = NOW()
    WHERE vin = p_vin;

    RETURN jsonb_build_object(
        'success', true,
        'message', format('VIN %s successfully allocated to %s', p_vin, p_customer_name)
    );
END;
$$;
