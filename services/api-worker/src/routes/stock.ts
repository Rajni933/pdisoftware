import { Env } from '../index';
import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

export const stockRouter = new Hono<{ Bindings: Env; Variables: any }>();

let localVehiclesStore: any[] = [];

// GET /api/v1/stock
stockRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');

  let results: any[] = [...localVehiclesStore];

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);
    let query = supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (orgId && orgId !== 'ALL') {
      query = query.eq('organization_id', orgId);
    }
    const { data: dbData, error } = await query;
    if (!error && dbData && Array.isArray(dbData) && dbData.length > 0) {
      // Merge dbData with localVehiclesStore, preferring dbData
      const map = new Map<string, any>();
      localVehiclesStore.forEach(v => { if (v.vin) map.set(v.vin.toUpperCase().trim(), v); });
      dbData.forEach(v => { if (v.vin) map.set(v.vin.toUpperCase().trim(), v); });
      results = Array.from(map.values());
    }
  } catch (e) {
    console.warn('Supabase stock read note:', e);
  }

  if (orgId && orgId !== 'ALL') {
    results = results.filter(v => v.organization_id === orgId);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(v => 
      (v.vin || '').toLowerCase().includes(q) ||
      (v.model || '').toLowerCase().includes(q) ||
      (v.customer_name || '').toLowerCase().includes(q) ||
      (v.location || '').toLowerCase().includes(q)
    );
  }

  return c.json({ success: true, data: results, meta: { total: results.length } });
});

// POST /api/v1/stock/bulk-import
stockRouter.post('/bulk-import', async (c) => {
  const body = await c.req.json();
  const items = body.vehicles || body.rows || [];
  if (!Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, error: { message: 'Invalid or empty vehicles list' } }, 400);
  }

  // Deduplicate by VIN in worker store
  const map = new Map<string, any>();
  localVehiclesStore.forEach(v => {
    if (v.vin) map.set(v.vin.toUpperCase().trim(), v);
  });

  items.forEach(item => {
    if (item.vin) {
      const key = item.vin.toUpperCase().trim();
      const prev = map.get(key) || {};
      map.set(key, {
        ...prev,
        ...item,
        id: prev.id || item.id || `v-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        created_at: prev.created_at || new Date().toISOString()
      });
    }
  });

  localVehiclesStore = Array.from(map.values());

  // Upsert to Supabase Database
  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);
    const sanitized = items.map((r: any) => ({
      vin: r.vin?.toUpperCase().trim(),
      model: r.model || 'Unknown Model',
      variant: r.variant || 'Standard',
      color: r.color || 'Standard',
      fuel_type: r.fuel_type || 'PETROL',
      manufacturing_year: parseInt(r.manufacturing_year) || 2026,
      status: r.status || 'RECEIVED',
      location: r.location || 'Central Stockyard',
      customer_name: r.customer_name || null,
      sales_consultant: r.sales_consultant || null,
      brand: r.brand || (r.model?.toLowerCase().includes('hyundai') ? 'Hyundai Motor' : 'Tata Motors'),
      organization_id: r.organization_id || '11111111-1111-1111-1111-111111111111',
      created_at: r.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    })).filter((v: any) => !!v.vin);

    if (sanitized.length > 0) {
      await supabase.from('vehicles').upsert(sanitized, { onConflict: 'vin' });
    }
  } catch (err) {
    console.warn('Supabase stock bulk upsert notice:', err);
  }

  return c.json({ 
    success: true, 
    data: { 
      imported_count: items.length, 
      total_count: localVehiclesStore.length 
    } 
  }, 201);
});
