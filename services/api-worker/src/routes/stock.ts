import { Env } from '../index';
import { Hono } from 'hono';
import { getSupabase } from '../lib/supabase';

export const stockRouter = new Hono<{ Bindings: Env; Variables: any }>();

// GET /api/v1/stock — List stock inventory vehicles
stockRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');
  const status = c.req.query('status');
  const yard = c.req.query('yard');
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = Math.min(parseInt(c.req.query('limit') || '100', 10), 200);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = getSupabase(c.env);
  let query = supabase
    .from('vehicles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (orgId && orgId !== 'ALL' && orgId !== 'DHOOT-ALL') {
    query = query.eq('organization_id', orgId);
  }

  if (status && status !== 'ALL') {
    query = query.eq('status', status);
  }

  if (yard && yard !== 'ALL') {
    query = query.ilike('location', `%${yard}%`);
  }

  if (search) {
    query = query.or(`vin.ilike.%${search}%,chassis_number.ilike.%${search}%,model.ilike.%${search}%,customer_name.ilike.%${search}%,location.ilike.%${search}%`);
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

// POST /api/v1/stock/bulk-import — Bulk upsert vehicle stock
stockRouter.post('/bulk-import', async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const items = body.vehicles || body.rows || [];

  if (!Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid or empty vehicles list' } }, 400);
  }

  const sanitized = items.map((item: any) => {
    const vin = (item.vin || '').toUpperCase().trim();
    const isTata = vin.startsWith('MAT') || (item.brand && item.brand.toLowerCase().includes('tata'));
    const defaultOrgId = isTata ? '11111111-1111-1111-1111-111111111111' : '11111111-1111-1111-1111-111111111112';

    return {
      organization_id: item.organization_id || defaultOrgId,
      branch_id: item.branch_id || '33333333-3333-3333-3333-333333333331',
      vin,
      chassis_number: item.chassis_number || vin,
      engine_number: item.engine_number || null,
      model: item.model || 'Standard Model',
      variant: item.variant || 'Standard Variant',
      brand: item.brand || (isTata ? 'Tata Motors' : 'Hyundai'),
      color: item.color || item.colour || 'Standard Color',
      fuel_type: item.fuel_type || 'PETROL',
      transmission: item.transmission || 'MANUAL',
      manufacturing_year: Number(item.manufacturing_year || item.mfg_year) || 2026,
      status: item.status || 'RECEIVED',
      location: item.location || 'Pune Yard • Bay 1',
      customer_name: item.customer_name || null,
      sales_consultant: item.sales_consultant || null,
      battery_voltage: Number(item.battery_voltage) || 12.6,
      key_count: Number(item.key_count) || 2,
      updated_at: new Date().toISOString(),
    };
  }).filter((v: any) => !!v.vin);

  const { data, error } = await supabase
    .from('vehicles')
    .upsert(sanitized, { onConflict: 'vin' })
    .select('id, vin, model, status, location');

  if (error) {
    return c.json({ success: false, error: { code: 'UPSERT_ERROR', message: error.message } }, 400);
  }

  return c.json({
    success: true,
    data: {
      imported_count: sanitized.length,
      records: data || [],
    },
  }, 201);
});

// PATCH /api/v1/stock/update-status — Update vehicle status & bay location
stockRouter.patch('/update-status', async (c) => {
  const supabase = getSupabase(c.env);
  const { vin, status, location, notes } = await c.req.json();

  if (!vin) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'VIN is required' } }, 400);
  }

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (location) updates.location = location;
  if (notes) updates.unloading_notes = notes;

  const { data, error } = await supabase
    .from('vehicles')
    .update(updates)
    .eq('vin', vin)
    .select()
    .single();

  if (error) {
    return c.json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }, 400);
  }

  return c.json({ success: true, data });
});
