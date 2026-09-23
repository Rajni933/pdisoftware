import { Env } from '../index';
import { Hono } from 'hono';
import { getSupabase } from '../lib/supabase';

export const challansRouter = new Hono<{ Bindings: Env; Variables: any }>();

// GET /api/v1/challans — List challans & invoices
challansRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = getSupabase(c.env);
  let query = supabase
    .from('challan_invoices')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (orgId && orgId !== 'ALL' && orgId !== 'DHOOT-ALL') {
    query = query.eq('organization_id', orgId);
  }

  if (search) {
    query = query.or(`challan_no.ilike.%${search}%,invoice_no.ilike.%${search}%,customer_name.ilike.%${search}%,vin_no.ilike.%${search}%,model.ilike.%${search}%`);
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

// POST /api/v1/challans — Create delivery challan
challansRouter.post('/', async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();

  if (!body.challan_no || !body.vin_no || !body.customer_name) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'challan_no, vin_no, and customer_name are required' } }, 400);
  }

  const { data, error } = await supabase
    .from('challan_invoices')
    .insert([body])
    .select()
    .single();

  if (error) {
    return c.json({ success: false, error: { code: 'INSERT_ERROR', message: error.message } }, 400);
  }

  return c.json({ success: true, data }, 201);
});

// POST /api/v1/challans/bulk-import — Bulk upsert challans
challansRouter.post('/bulk-import', async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const items = body.records || body.challans || [];

  if (!Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid or empty records list' } }, 400);
  }

  const sanitized = items.map((r: any) => ({
    organization_id: r.organization_id || '11111111-1111-1111-1111-111111111111',
    booking_date: r.booking_date && r.booking_date !== '—' ? r.booking_date : null,
    challan_no: r.challan_no || `CH-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    invoice_no: r.invoice_no || null,
    challan_date: r.challan_date && r.challan_date !== '—' ? r.challan_date : null,
    delivery_date: r.delivery_date && r.delivery_date !== '—' ? r.delivery_date : null,
    challan_type: r.challan_type || 'TAX_INVOICE_DELIVERY',
    vin_no: r.vin_no || r.vin || 'VIN-PENDING',
    customer_name: r.customer_name || 'Valued Customer',
    mobile_no: r.mobile_no || r.mobile || null,
    city: r.city || null,
    model: r.model || 'Standard Model',
    variant: r.variant || 'Standard Variant',
    colour: r.colour || r.color || 'Standard Colour',
    sale_consultant: r.sales_consultant || r.sale_consultant || null,
    team_leader: r.team_leader || null,
    financier_name: r.financier_name || null,
    corporate: Number(r.corporate) || 0,
    exchange: Number(r.exchange) || 0,
    ex_showroom: Number(r.ex_showroom) || 0,
    discount: Number(r.discount) || 0,
    net: Number(r.net) || 0,
    insurance_per: Number(r.insurance_per) || 0,
    insurance_amount: Number(r.insurance_amount) || 0,
    rto: Number(r.rto) || 0,
    tcs: Number(r.tcs) || 0,
    total: Number(r.total) || 0,
    status: r.status || 'ISSUED',
  }));

  const { data, error } = await supabase
    .from('challan_invoices')
    .upsert(sanitized, { onConflict: 'challan_no' })
    .select('id, challan_no, customer_name, vin_no');

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
