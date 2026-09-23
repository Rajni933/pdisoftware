import { Env } from '../index';
import { Hono } from 'hono';
import { getSupabase } from '../lib/supabase';

export const bookingsRouter = new Hono<{ Bindings: Env; Variables: any }>();

// GET /api/v1/bookings — List bookings with filtering, search & pagination
bookingsRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');
  const status = c.req.query('status');
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = getSupabase(c.env);
  let query = supabase
    .from('bookings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (orgId && orgId !== 'ALL' && orgId !== 'DHOOT-ALL') {
    query = query.eq('organization_id', orgId);
  }

  if (status && status !== 'ALL') {
    if (status === 'ALLOCATED') {
      query = query.not('allocated_vin_no', 'is', null);
    } else if (status === 'PENDING_ALLOCATION' || status === 'BOOKED') {
      query = query.is('allocated_vin_no', null);
    } else {
      query = query.eq('status', status);
    }
  }

  if (search) {
    query = query.or(`customer_name.ilike.%${search}%,receipt_no.ilike.%${search}%,allocated_vin_no.ilike.%${search}%,mobile_number.ilike.%${search}%,model.ilike.%${search}%`);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return c.json({ success: false, error: { code: 'QUERY_ERROR', message: error.message } }, 400);
  }

  return c.json({
    success: true,
    data: data || [],
    meta: {
      page,
      limit,
      total: count || (data ? data.length : 0),
    },
  });
});

// POST /api/v1/bookings — Create new booking
bookingsRouter.post('/', async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();

  if (!body.receipt_no || !body.customer_name || !body.model) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'receipt_no, customer_name, and model are required' } }, 400);
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([body])
    .select()
    .single();

  if (error) {
    return c.json({ success: false, error: { code: 'INSERT_ERROR', message: error.message } }, 400);
  }

  return c.json({ success: true, data }, 201);
});

// POST /api/v1/bookings/allocate — Atomically allocate VIN to Booking
bookingsRouter.post('/allocate', async (c) => {
  const supabase = getSupabase(c.env);
  const { booking_id, receipt_no, vin } = await c.req.json();

  if (!vin || (!booking_id && !receipt_no)) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'vin and booking_id/receipt_no are required' } }, 400);
  }

  // 1. Verify vehicle exists and is available
  const { data: vehicle, error: vErr } = await supabase
    .from('vehicles')
    .select('*')
    .eq('vin', vin)
    .single();

  if (vErr || !vehicle) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: `Vehicle with VIN ${vin} not found` } }, 404);
  }

  // 2. Update booking with allocated VIN
  let bQuery = supabase.from('bookings').update({
    allocated_vin_no: vin,
    status: 'ALLOCATED',
    allotment_date: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (booking_id) {
    bQuery = bQuery.eq('id', booking_id);
  } else {
    bQuery = bQuery.eq('receipt_no', receipt_no);
  }

  const { data: updatedBooking, error: bErr } = await bQuery.select().single();

  if (bErr) {
    return c.json({ success: false, error: { code: 'UPDATE_ERROR', message: bErr.message } }, 400);
  }

  // 3. Update vehicle status and customer link
  await supabase.from('vehicles').update({
    status: 'ALLOCATED',
    customer_name: updatedBooking.customer_name,
    sales_consultant: updatedBooking.sales_consultant,
    updated_at: new Date().toISOString(),
  }).eq('vin', vin);

  return c.json({ success: true, data: updatedBooking });
});

// POST /api/v1/bookings/bulk-import — Bulk upsert bookings
bookingsRouter.post('/bulk-import', async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const items = body.bookings || body.records || [];

  if (!Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid or empty bookings list' } }, 400);
  }

  const { data, error } = await supabase
    .from('bookings')
    .upsert(items, { onConflict: 'receipt_no' })
    .select('id, receipt_no, customer_name, status');

  if (error) {
    return c.json({ success: false, error: { code: 'UPSERT_ERROR', message: error.message } }, 400);
  }

  return c.json({
    success: true,
    data: {
      imported_count: items.length,
      records: data || [],
    },
  }, 201);
});

// DELETE /api/v1/bookings/:id
bookingsRouter.delete('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const id = c.req.param('id');

  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) {
    return c.json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } }, 400);
  }

  return c.json({ success: true, message: 'Booking deleted successfully' });
});
