import { supabase } from '../lib/supabase';
import { TATA_ORG_ID, HYUNDAI_ORG_ID, getAllVehicles, getVehiclesForBrand, saveStockInventory } from '../data/seedData';
import initialStockVehicles from '../data/initialVehicles.json';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface YardItem {
  id: string;
  organization_id?: string;
  code: string;
  name: string;
  brand: 'Tata Motors' | 'Hyundai' | 'Shared';
  city: string;
  state: string;
  capacity: string;
  manager: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface BranchItem {
  id: string;
  organization_id?: string;
  code: string;
  name: string;
  brand: 'Tata Motors' | 'Hyundai' | 'Shared';
  type: 'Main Showroom' | 'RSO';
  city: string;
  state: string;
  capacity: string;
  manager: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface VehicleModelItem {
  id: string;
  brand: string;
  model_name: string;
  body_type: string;
  base_ex_showroom: number;
  fuel_types: string[];
  transmission?: string;
  seating_capacity?: string;
  variants: string[];
  colors: string[];
  gst_rate: number;
  is_active?: boolean;
}

export interface FinancierItem {
  id: string;
  name: string;
  category: 'PRIVATE_BANK' | 'NATIONALISED_BANK' | 'OEM_CAPTIVE_NBFC' | 'NBFC';
  code?: string;
  contactPerson: string;
  designation?: string;
  phone: string;
  email: string;
  maxLtv?: number;
  processingFee?: number;
  activeStatus: string;
}

export interface InsuranceItem {
  id: string;
  name: string;
  code?: string;
  claimsHead: string;
  surveyorName?: string;
  surveyorContact: string;
  cashlessTieUp: boolean;
  discountPercentage: number;
  policyTypes?: string;
}

export interface PdiRuleItem {
  id: string;
  stage: 'Exterior' | 'Electricals' | 'Interior' | 'Engine Bay' | 'Underbody' | 'Road Test' | 'Wheels';
  category?: string;
  code?: string;
  title: string;
  description: string;
  standardRemark?: string;
  mandatory: boolean;
  photosRequired: number;
  videoRequired: boolean;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'OBSERVATION';
  toolRequired?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface StockVehicle {
  id: string;
  organization_id?: string;
  vin: string;
  model: string;
  variant: string;
  color: string;
  brand?: string;
  fuel_type?: string;
  fsc_code?: string;
  dealer_code?: string;
  plant_code?: string;
  manufacturing_year?: number | string;
  status: string;
  quantity?: number;
  location?: string;
  customer_name?: string;
  sales_consultant?: string;
  accessories_amount?: number;
  vehicle_status?: string;
  delivery_date?: string;
  allocation_date?: string;
  allocated_days?: number;
  received_amount?: number;
  purchase_date?: string;
  created_at?: string;
  certificate_no?: string;
  chassis_no?: string;
  engine_no?: string;
  odometer_reading?: number;
  odometer?: number;
  inspector_name?: string;
  pdi_date?: string;
}

export interface BookingRecord {
  id: string;
  organization_id?: string;
  receipt_date: string;
  receipt_no: string;
  customer_name: string;
  mobile_number: string;
  sales_consultant: string;
  team_leader: string;
  model: string;
  variant: string;
  colour: string;
  allocated_vin_no?: string;
  delivery_date?: string;
  hypothecation?: string;
  receipt_amt: number;
  status: 'ALLOCATED' | 'PENDING_ALLOCATION';
  created_at?: string;
}

export interface ChallanRecord {
  id: string;
  organization_id?: string;
  booking_date: string;
  challan_no: string;
  challan_date: string;
  delivery_date: string;
  challan_type: string;
  vin_no: string;
  customer_name: string;
  mobile: string;
  city: string;
  model: string;
  variant: string;
  colour: string;
  sale_consultant: string;
  team_leader: string;
  financier_name: string;
  corporate: string;
  exchange: string;
  ex_showroom: number;
  discount: number;
  net: number;
  insurance_per: number;
  insurance_amount: number;
  ep: number;
  rti: number;
  cm: number;
  rto_city: string;
  rto_amount: number;
  hml_acc: number;
  own_acc: number;
  acc_discount_amount: number;
  acc_amount: number;
  trc: number;
  warranty: number;
  handling_charges: number;
  other: number;
  fast_tag: number;
  tcs: number;
  net_amount: number;
  invoice_date: string;
  invoice_no: string;
  status: string;
  created_at?: string;
}

export interface RepairTicketItem {
  id: string;
  vin: string;
  brand: string;
  model: string;
  defectArea: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  description: string;
  technician: string;
  bay: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt?: string;
}

export interface PdiInspectionItem {
  id: string;
  vin: string;
  brand: string;
  model: string;
  variant: string;
  color: string;
  yardLocation: string;
  inspector: string;
  progress: number;
  passed: number;
  failed: number;
  total: number;
  status: string;
  startedAt: string;
  elapsedTime: string;
}

// ============================================================================
// OUTBOX SYNC QUEUE (Offline Resilience & Conflict-Safe Synchronization)
// ============================================================================

export interface SyncQueueItem {
  id: string;
  action: 'SAVE_VEHICLE' | 'SAVE_BOOKING' | 'SAVE_CHALLAN' | 'ALLOCATE_VIN';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

export const SYNC_QUEUE_KEY = 'autoprime_sync_queue';

export const getSyncQueue = (): SyncQueueItem[] => {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addToSyncQueue = (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): void => {
  try {
    const queue = getSyncQueue();
    const newItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      retryCount: 0
    };
    queue.push(newItem);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('sync-queue-updated', { detail: { queueLength: queue.length } }));
  } catch (e) {
    console.warn('Could not add to sync queue:', e);
  }
};

export const clearSyncQueue = (): void => {
  localStorage.removeItem(SYNC_QUEUE_KEY);
  window.dispatchEvent(new CustomEvent('sync-queue-updated', { detail: { queueLength: 0 } }));
};

export const flushSyncQueue = async (): Promise<{ succeeded: number; failed: number }> => {
  const queue = getSyncQueue();
  if (queue.length === 0) return { succeeded: 0, failed: 0 };

  let succeeded = 0;
  let failed = 0;
  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.action === 'SAVE_VEHICLE') {
        const { error } = await supabase.from('vehicles').upsert(item.data, { onConflict: 'vin' });
        if (error) throw error;
      } else if (item.action === 'SAVE_BOOKING') {
        const { error } = await supabase.from('bookings').upsert(item.data, { onConflict: 'receipt_no' });
        if (error) throw error;
      } else if (item.action === 'SAVE_CHALLAN') {
        const { error } = await supabase.from('challan_invoices').upsert(item.data, { onConflict: 'challan_no' });
        if (error) throw error;
      } else if (item.action === 'ALLOCATE_VIN') {
        const { bookingId, receiptNo, vin, customerName } = item.data;
        await supabase.from('bookings').update({
          allocated_vin_no: vin,
          status: 'ALLOCATED',
          allotment_date: new Date().toISOString()
        }).or(`id.eq.${bookingId},receipt_no.eq.${receiptNo}`);

        await supabase.from('vehicles').update({
          status: 'ALLOCATED',
          customer_name: customerName,
          allocation_date: new Date().toISOString().split('T')[0]
        }).eq('vin', vin);
      }
      succeeded++;
    } catch (err: any) {
      console.warn(`Failed to sync item ${item.id}:`, err);
      failed++;
      remaining.push({
        ...item,
        retryCount: item.retryCount + 1,
        lastError: err?.message || 'Sync failed'
      });
    }
  }

  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
  window.dispatchEvent(new CustomEvent('sync-queue-updated', { detail: { queueLength: remaining.length, succeeded, failed } }));
  return { succeeded, failed };
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushSyncQueue().catch(console.warn);
  });
}

// ============================================================================
// BRAND HELPERS
// ============================================================================

export const isTata = (item: any): boolean => {
  if (!item) return false;
  if (item.organization_id === TATA_ORG_ID) return true;
  if (item.brand && String(item.brand).toLowerCase().includes('tata')) return true;
  const vin = String(item.vin || item.allocated_vin_no || item.vin_no || '').toUpperCase().trim();
  if (vin.startsWith('MAT')) return true;
  const m = String(item.model || item.model_name || '').toLowerCase();
  const kw = ['tata', 'nexon', 'harrier', 'safari', 'curvv', 'punch', 'tiago', 'tigor', 'altroz', 'sierra', 'aeris', 'xpres'];
  return kw.some(k => m.includes(k));
};

export const isHyundai = (item: any): boolean => {
  if (!item) return false;
  if (item.organization_id === HYUNDAI_ORG_ID) return true;
  if (item.brand && String(item.brand).toLowerCase().includes('hyundai')) return true;
  const vin = String(item.vin || item.allocated_vin_no || item.vin_no || '').toUpperCase().trim();
  if (vin.startsWith('MAL')) return true;
  const m = String(item.model || item.model_name || '').toLowerCase();
  const kw = ['hyundai', 'creta', 'venue', 'verna', 'ioniq', 'exter', 'i20', 'i10', 'tucson', 'alcazar', 'aura', 'grand'];
  return kw.some(k => m.includes(k));
};

export const filterByBrand = <T extends any>(list: T[], brandCode?: string): T[] => {
  if (!brandCode || brandCode === 'DHOOT-ALL' || brandCode === 'ALL') return list;
  if (brandCode === 'DHOOT-TATA' || brandCode.toLowerCase().includes('tata')) {
    return list.filter(isTata);
  }
  if (brandCode === 'DHOOT-HYUNDAI' || brandCode.toLowerCase().includes('hyundai')) {
    return list.filter(isHyundai);
  }
  return list;
};

// ============================================================================
// 1. MASTER STOCKYARDS
// ============================================================================

export const fetchStockyards = async (brandCode?: string): Promise<YardItem[]> => {
  try {
    const { data, error } = await supabase.from('stockyards').select('*').order('name');
    if (!error && Array.isArray(data) && data.length > 0) {
      localStorage.setItem('autoprime_stockyards', JSON.stringify(data));
      return filterByBrand(data, brandCode);
    }
  } catch (e) {
    console.warn('DB stockyards fetch notice:', e);
  }

  // Fallback to local cache if offline, otherwise return empty
  const cached = localStorage.getItem('autoprime_stockyards');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return filterByBrand(parsed, brandCode);
    } catch (e) {}
  }
  return [];
};

export const saveStockyard = async (yard: YardItem): Promise<boolean> => {
  try {
    const orgId = yard.brand === 'Hyundai' ? HYUNDAI_ORG_ID : TATA_ORG_ID;
    const payload = {
      ...yard,
      organization_id: yard.organization_id || orgId
    };

    const { error } = await supabase.from('stockyards').upsert(payload, { onConflict: 'code' });
    if (error) throw error;

    // Update local cache
    const current = await fetchStockyards();
    const existingIndex = current.findIndex(y => y.id === yard.id || y.code === yard.code);
    let updated: YardItem[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = payload;
    } else {
      updated = [payload, ...current];
    }
    localStorage.setItem('autoprime_stockyards', JSON.stringify(updated));
    window.dispatchEvent(new Event('stockyards-updated'));
    return true;
  } catch (e) {
    console.error('Save stockyard error:', e);
    // Optimistic offline update
    const cached = localStorage.getItem('autoprime_stockyards');
    const current: YardItem[] = cached ? JSON.parse(cached) : [];
    const updated = [yard, ...current.filter(y => y.id !== yard.id)];
    localStorage.setItem('autoprime_stockyards', JSON.stringify(updated));
    window.dispatchEvent(new Event('stockyards-updated'));
    return false;
  }
};

export const deleteStockyard = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('stockyards').delete().eq('id', id);
    if (error) throw error;
  } catch (e) {
    console.warn('DB delete stockyard notice:', e);
  }

  const cached = localStorage.getItem('autoprime_stockyards');
  if (cached) {
    const current: YardItem[] = JSON.parse(cached);
    const updated = current.filter(y => y.id !== id);
    localStorage.setItem('autoprime_stockyards', JSON.stringify(updated));
    window.dispatchEvent(new Event('stockyards-updated'));
  }
  return true;
};

export const toggleStockyardStatus = async (id: string, newStatus: 'ACTIVE' | 'INACTIVE'): Promise<boolean> => {
  try {
    await supabase.from('stockyards').update({ status: newStatus }).eq('id', id);
  } catch (e) {}

  const cached = localStorage.getItem('autoprime_stockyards');
  if (cached) {
    const current: YardItem[] = JSON.parse(cached);
    const updated = current.map(y => y.id === id ? { ...y, status: newStatus } : y);
    localStorage.setItem('autoprime_stockyards', JSON.stringify(updated));
    window.dispatchEvent(new Event('stockyards-updated'));
  }
  return true;
};

// ============================================================================
// 2. MASTER BRANCHES
// ============================================================================

export const fetchBranches = async (brandCode?: string): Promise<BranchItem[]> => {
  try {
    const { data, error } = await supabase.from('branches').select('*').order('name');
    if (!error && Array.isArray(data) && data.length > 0) {
      localStorage.setItem('autoprime_branches', JSON.stringify(data));
      return filterByBrand(data, brandCode);
    }
  } catch (e) {
    console.warn('DB branches fetch notice:', e);
  }

  const cached = localStorage.getItem('autoprime_branches');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return filterByBrand(parsed, brandCode);
    } catch (e) {}
  }
  return [];
};

export const saveBranch = async (branch: BranchItem): Promise<boolean> => {
  try {
    const orgId = branch.brand === 'Hyundai' ? HYUNDAI_ORG_ID : TATA_ORG_ID;
    const payload = {
      ...branch,
      organization_id: branch.organization_id || orgId
    };

    const { error } = await supabase.from('branches').upsert(payload, { onConflict: 'code' });
    if (error) throw error;

    const current = await fetchBranches();
    const existingIndex = current.findIndex(b => b.id === branch.id || b.code === branch.code);
    let updated: BranchItem[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = payload;
    } else {
      updated = [payload, ...current];
    }
    localStorage.setItem('autoprime_branches', JSON.stringify(updated));
    window.dispatchEvent(new Event('branches-updated'));
    return true;
  } catch (e) {
    console.error('Save branch error:', e);
    const cached = localStorage.getItem('autoprime_branches');
    const current: BranchItem[] = cached ? JSON.parse(cached) : [];
    const updated = [branch, ...current.filter(b => b.id !== branch.id)];
    localStorage.setItem('autoprime_branches', JSON.stringify(updated));
    window.dispatchEvent(new Event('branches-updated'));
    return false;
  }
};

export const deleteBranch = async (id: string): Promise<boolean> => {
  try {
    await supabase.from('branches').delete().eq('id', id);
  } catch (e) {}

  const cached = localStorage.getItem('autoprime_branches');
  if (cached) {
    const current: BranchItem[] = JSON.parse(cached);
    const updated = current.filter(b => b.id !== id);
    localStorage.setItem('autoprime_branches', JSON.stringify(updated));
    window.dispatchEvent(new Event('branches-updated'));
  }
  return true;
};

// ============================================================================
// 3. MASTER VEHICLE MODELS
// ============================================================================

export const fetchMasterModels = async (brandCode?: string): Promise<VehicleModelItem[]> => {
  try {
    const { data, error } = await supabase.from('master_vehicle_models').select('*').order('model_name');
    if (!error && Array.isArray(data) && data.length > 0) {
      localStorage.setItem('autoprime_models', JSON.stringify(data));
      return filterByBrand(data, brandCode);
    }
  } catch (e) {
    console.warn('DB models fetch notice:', e);
  }

  const cached = localStorage.getItem('autoprime_models');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return filterByBrand(parsed, brandCode);
    } catch (e) {}
  }
  return [];
};

export const saveMasterModel = async (model: VehicleModelItem): Promise<boolean> => {
  try {
    const { error } = await supabase.from('master_vehicle_models').upsert(model, { onConflict: 'model_name' });
    if (error) throw error;

    const current = await fetchMasterModels();
    const updated = [model, ...current.filter(m => m.id !== model.id && m.model_name !== model.model_name)];
    localStorage.setItem('autoprime_models', JSON.stringify(updated));
    window.dispatchEvent(new Event('models-updated'));
    return true;
  } catch (e) {
    console.error('Save model error:', e);
    const cached = localStorage.getItem('autoprime_models');
    const current: VehicleModelItem[] = cached ? JSON.parse(cached) : [];
    const updated = [model, ...current.filter(m => m.id !== model.id)];
    localStorage.setItem('autoprime_models', JSON.stringify(updated));
    window.dispatchEvent(new Event('models-updated'));
    return false;
  }
};

export const deleteMasterModel = async (id: string): Promise<boolean> => {
  try {
    await supabase.from('master_vehicle_models').delete().eq('id', id);
  } catch (e) {}

  const cached = localStorage.getItem('autoprime_models');
  if (cached) {
    const current: VehicleModelItem[] = JSON.parse(cached);
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem('autoprime_models', JSON.stringify(updated));
    window.dispatchEvent(new Event('models-updated'));
  }
  return true;
};

// ============================================================================
// 4. MASTER FINANCIERS
// ============================================================================

export const fetchMasterFinanciers = async (): Promise<FinancierItem[]> => {
  try {
    const { data, error } = await supabase.from('master_financiers').select('*').order('name');
    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data.map((f: any) => ({
        id: f.id,
        name: f.name,
        category: f.category || 'PRIVATE_BANK',
        code: f.code,
        contactPerson: f.contact_person || f.contactPerson || '',
        phone: f.contact_phone || f.phone || '',
        email: f.contact_email || f.email || '',
        activeStatus: f.is_active === false ? 'INACTIVE' : 'ACTIVE',
        maxLtv: f.max_ltv || f.maxLtv || 90,
        processingFee: f.processing_fee || f.processingFee || 0
      }));
      localStorage.setItem('autoprime_financiers', JSON.stringify(mapped));
      return mapped;
    }
  } catch (e) {
    console.warn('DB financiers fetch notice:', e);
  }

  const cached = localStorage.getItem('autoprime_financiers');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return [];
};

export const saveMasterFinancier = async (fin: FinancierItem): Promise<boolean> => {
  try {
    const payload = {
      id: fin.id,
      name: fin.name,
      category: fin.category,
      code: fin.code || fin.name.slice(0, 4).toUpperCase(),
      contact_person: fin.contactPerson,
      contact_phone: fin.phone,
      contact_email: fin.email,
      is_active: fin.activeStatus === 'ACTIVE',
      max_ltv: fin.maxLtv,
      processing_fee: fin.processingFee
    };

    const { error } = await supabase.from('master_financiers').upsert(payload, { onConflict: 'name' });
    if (error) throw error;

    const current = await fetchMasterFinanciers();
    const updated = [fin, ...current.filter(f => f.id !== fin.id && f.name !== fin.name)];
    localStorage.setItem('autoprime_financiers', JSON.stringify(updated));
    window.dispatchEvent(new Event('financiers-updated'));
    return true;
  } catch (e) {
    console.error('Save financier error:', e);
    const cached = localStorage.getItem('autoprime_financiers');
    const current: FinancierItem[] = cached ? JSON.parse(cached) : [];
    const updated = [fin, ...current.filter(f => f.id !== fin.id)];
    localStorage.setItem('autoprime_financiers', JSON.stringify(updated));
    window.dispatchEvent(new Event('financiers-updated'));
    return false;
  }
};

export const deleteMasterFinancier = async (id: string): Promise<boolean> => {
  try {
    await supabase.from('master_financiers').delete().eq('id', id);
  } catch (e) {}

  const cached = localStorage.getItem('autoprime_financiers');
  if (cached) {
    const current: FinancierItem[] = JSON.parse(cached);
    const updated = current.filter(f => f.id !== id);
    localStorage.setItem('autoprime_financiers', JSON.stringify(updated));
    window.dispatchEvent(new Event('financiers-updated'));
  }
  return true;
};

// ============================================================================
// 5. MASTER INSURANCE PROVIDERS
// ============================================================================

export const fetchMasterInsurance = async (): Promise<InsuranceItem[]> => {
  try {
    const { data, error } = await supabase.from('master_insurance_providers').select('*').order('name');
    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data.map((i: any) => ({
        id: i.id,
        name: i.name,
        code: i.code,
        claimsHead: i.claims_lead_name || i.claimsHead || '',
        surveyorName: i.surveyor_name || i.surveyorName || '',
        surveyorContact: i.contact_phone || i.surveyorContact || '',
        cashlessTieUp: i.cashless_tieup ?? i.cashlessTieUp ?? true,
        discountPercentage: i.tie_up_discount_percent ?? i.discountPercentage ?? 10,
        policyTypes: (i.coverage_packages || []).join(', ') || i.policyTypes || '1+3 Year Comprehensive'
      }));
      localStorage.setItem('autoprime_insurance', JSON.stringify(mapped));
      return mapped;
    }
  } catch (e) {
    console.warn('DB insurance fetch notice:', e);
  }

  const cached = localStorage.getItem('autoprime_insurance');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return [];
};

export const saveMasterInsurance = async (ins: InsuranceItem): Promise<boolean> => {
  try {
    const payload = {
      id: ins.id,
      name: ins.name,
      code: ins.code || ins.name.slice(0, 4).toUpperCase(),
      claims_lead_name: ins.claimsHead,
      contact_phone: ins.surveyorContact,
      cashless_tieup: ins.cashlessTieUp,
      tie_up_discount_percent: ins.discountPercentage,
      is_active: true
    };

    const { error } = await supabase.from('master_insurance_providers').upsert(payload, { onConflict: 'name' });
    if (error) throw error;

    const current = await fetchMasterInsurance();
    const updated = [ins, ...current.filter(i => i.id !== ins.id && i.name !== ins.name)];
    localStorage.setItem('autoprime_insurance', JSON.stringify(updated));
    window.dispatchEvent(new Event('insurance-updated'));
    return true;
  } catch (e) {
    console.error('Save insurance error:', e);
    const cached = localStorage.getItem('autoprime_insurance');
    const current: InsuranceItem[] = cached ? JSON.parse(cached) : [];
    const updated = [ins, ...current.filter(i => i.id !== ins.id)];
    localStorage.setItem('autoprime_insurance', JSON.stringify(updated));
    window.dispatchEvent(new Event('insurance-updated'));
    return false;
  }
};

export const deleteMasterInsurance = async (id: string): Promise<boolean> => {
  try {
    await supabase.from('master_insurance_providers').delete().eq('id', id);
  } catch (e) {}

  const cached = localStorage.getItem('autoprime_insurance');
  if (cached) {
    const current: InsuranceItem[] = JSON.parse(cached);
    const updated = current.filter(i => i.id !== id);
    localStorage.setItem('autoprime_insurance', JSON.stringify(updated));
    window.dispatchEvent(new Event('insurance-updated'));
  }
  return true;
};

// ============================================================================
// 6. MASTER PDI CHECKPOINTS
// ============================================================================

export const fetchCheckpoints = async (stage?: string): Promise<PdiRuleItem[]> => {
  try {
    let query = supabase.from('checkpoints').select('*').order('code');
    if (stage) query = query.eq('stage', stage);
    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped: PdiRuleItem[] = data.map((c: any) => ({
        id: c.id,
        stage: c.stage || 'Exterior',
        category: c.category || 'General',
        code: c.code,
        title: c.title || c.description || '',
        description: c.description || c.title || '',
        standardRemark: c.standard_remark || c.standardRemark || 'Inspected OK',
        mandatory: c.is_mandatory ?? c.mandatory ?? true,
        photosRequired: c.photos_required ?? c.photosRequired ?? 1,
        videoRequired: c.video_required ?? c.videoRequired ?? false,
        severity: c.severity || 'MAJOR',
        toolRequired: c.tool_required || c.toolRequired || 'Visual',
        status: c.is_active === false ? 'INACTIVE' : 'ACTIVE'
      }));
      localStorage.setItem('autoprime_pdi_rules', JSON.stringify(mapped));
      return mapped;
    }
  } catch (e) {
    console.warn('DB checkpoints fetch notice:', e);
  }

  const cached = localStorage.getItem('autoprime_pdi_rules');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return [];
};

export const saveCheckpoint = async (rule: PdiRuleItem): Promise<boolean> => {
  try {
    const payload = {
      id: rule.id,
      stage: rule.stage,
      category: rule.category,
      code: rule.code,
      title: rule.title,
      description: rule.description,
      standard_remark: rule.standardRemark,
      is_mandatory: rule.mandatory,
      photos_required: rule.photosRequired,
      video_required: rule.videoRequired,
      severity: rule.severity,
      tool_required: rule.toolRequired,
      is_active: rule.status === 'ACTIVE'
    };

    const { error } = await supabase.from('checkpoints').upsert(payload, { onConflict: 'code' });
    if (error) throw error;

    const current = await fetchCheckpoints();
    const updated = [rule, ...current.filter(r => r.id !== rule.id && r.code !== rule.code)];
    localStorage.setItem('autoprime_pdi_rules', JSON.stringify(updated));
    window.dispatchEvent(new Event('pdi-rules-updated'));
    return true;
  } catch (e) {
    console.error('Save checkpoint error:', e);
    const cached = localStorage.getItem('autoprime_pdi_rules');
    const current: PdiRuleItem[] = cached ? JSON.parse(cached) : [];
    const updated = [rule, ...current.filter(r => r.id !== rule.id)];
    localStorage.setItem('autoprime_pdi_rules', JSON.stringify(updated));
    window.dispatchEvent(new Event('pdi-rules-updated'));
    return false;
  }
};

export const deleteCheckpoint = async (id: string): Promise<boolean> => {
  try {
    await supabase.from('checkpoints').delete().eq('id', id);
  } catch (e) {}

  const cached = localStorage.getItem('autoprime_pdi_rules');
  if (cached) {
    const current: PdiRuleItem[] = JSON.parse(cached);
    const updated = current.filter(r => r.id !== id);
    localStorage.setItem('autoprime_pdi_rules', JSON.stringify(updated));
    window.dispatchEvent(new Event('pdi-rules-updated'));
  }
  return true;
};

// ============================================================================
// 7. VEHICLES INVENTORY
// ============================================================================

export const fetchVehicles = async (brandCode?: string): Promise<StockVehicle[]> => {
  try {
    const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      saveStockInventory(data);
      return getVehiclesForBrand(brandCode) as StockVehicle[];
    }
  } catch (e) {
    console.warn('DB vehicles fetch notice:', e);
  }

  return getVehiclesForBrand(brandCode) as StockVehicle[];
};

export const saveVehicle = async (vehicle: Partial<StockVehicle>): Promise<boolean> => {
  const isHyn = isHyundai(vehicle);
  const orgId = isHyn ? HYUNDAI_ORG_ID : TATA_ORG_ID;
  const payload = {
    ...vehicle,
    brand: vehicle.brand || (isHyn ? 'Hyundai' : 'Tata Motors'),
    organization_id: vehicle.organization_id || orgId,
    status: vehicle.status || 'RECEIVED',
    location: vehicle.location || (isHyn ? 'Shantinath Yard' : 'Basni Yard')
  };

  let synced = false;
  try {
    const { error } = await supabase.from('vehicles').upsert(payload, { onConflict: 'vin' });
    if (error) throw error;
    synced = true;
  } catch (e) {
    console.warn('Save vehicle remote sync notice, queued to outbox:', e);
    addToSyncQueue({
      action: 'SAVE_VEHICLE',
      entity: 'vehicles',
      data: payload
    });
  }

  saveStockInventory([payload]);
  return synced;
};

export const bulkImportVehicles = async (vehicles: Partial<StockVehicle>[]): Promise<{ count: number; error?: string }> => {
  if (vehicles.length === 0) return { count: 0 };

  const sanitized = vehicles.map(v => {
    const copy: any = { ...v };
    // Strip temporary UI tracking flags
    delete copy._rowNum;
    delete copy._isValid;
    delete copy._isDuplicateInFile;
    delete copy._isAlreadyInDb;

    const isHyn = isHyundai(copy);
    const loc = copy.location;
    const yardLoc = (!loc || loc.toUpperCase() === 'JODHPUR') ? (isHyn ? 'Shantinath Yard' : 'Jodhpur (Basni)') : loc;

    return {
      ...copy,
      brand: copy.brand || (isHyn ? 'Hyundai' : 'Tata Motors'),
      organization_id: copy.organization_id || (isHyn ? HYUNDAI_ORG_ID : TATA_ORG_ID),
      status: copy.status || 'NEW CAR',
      location: yardLoc
    };
  });

  try {
    const { error } = await supabase.from('vehicles').upsert(sanitized, { onConflict: 'vin' });
    if (error) {
      console.warn('Batch DB upsert notice:', error);
    }
  } catch (e: any) {
    console.warn('Batch DB upsert exception:', e);
  }

  // Safe merge with existing stock - never erases other brands
  saveStockInventory(sanitized);

  return { count: sanitized.length };
};

export const updateVehicleLocation = async (vin: string, newLocation: string): Promise<boolean> => {
  try {
    await supabase.from('vehicles').update({ location: newLocation }).eq('vin', vin);
  } catch (e) {}

  const all = getAllVehicles();
  const updated = all.map(v => v.vin === vin ? { ...v, location: newLocation } : v);
  saveStockInventory(updated);
  return true;
};

export const updateVehicleStatus = async (vin: string, newStatus: string): Promise<boolean> => {
  try {
    await supabase.from('vehicles').update({ status: newStatus }).eq('vin', vin);
  } catch (e) {}

  const current = await fetchVehicles();
  const updated = current.map(v => v.vin === vin ? { ...v, status: newStatus } : v);
  localStorage.setItem('dhoot_stock_inventory', JSON.stringify(updated));
  window.dispatchEvent(new Event('stock-updated'));
  return true;
};

// ============================================================================
// 8. CUSTOMER BOOKINGS
// ============================================================================

export const fetchBookings = async (brandCode?: string): Promise<BookingRecord[]> => {
  try {
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) {
      localStorage.setItem('dhoot_bookings_inventory', JSON.stringify(data));
      return filterByBrand(data, brandCode);
    }
  } catch (e) {
    console.warn('DB bookings fetch notice:', e);
  }

  const cached = localStorage.getItem('dhoot_bookings_inventory');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return filterByBrand(parsed, brandCode);
    } catch (e) {}
  }
  return [];
};

export const saveBooking = async (booking: Partial<BookingRecord>): Promise<boolean> => {
  const orgId = isHyundai(booking) ? HYUNDAI_ORG_ID : TATA_ORG_ID;
  const payload = {
    ...booking,
    organization_id: booking.organization_id || orgId,
    status: booking.allocated_vin_no ? 'ALLOCATED' : 'PENDING_ALLOCATION'
  };

  let synced = false;
  try {
    const { error } = await supabase.from('bookings').upsert(payload, { onConflict: 'receipt_no' });
    if (error) throw error;
    synced = true;
  } catch (e) {
    console.warn('Save booking remote sync notice, queued to outbox:', e);
    addToSyncQueue({
      action: 'SAVE_BOOKING',
      entity: 'bookings',
      data: payload
    });
  }

  const current = await fetchBookings();
  const updated = [payload as BookingRecord, ...current.filter(b => b.receipt_no !== booking.receipt_no)];
  localStorage.setItem('dhoot_bookings_inventory', JSON.stringify(updated));
  window.dispatchEvent(new Event('bookings-updated'));
  return synced;
};

export const bulkImportBookings = async (bookings: Partial<BookingRecord>[]): Promise<{ count: number; error?: string }> => {
  if (bookings.length === 0) return { count: 0 };

  const sanitized = bookings.map(b => ({
    ...b,
    organization_id: b.organization_id || (isHyundai(b) ? HYUNDAI_ORG_ID : TATA_ORG_ID),
    status: b.allocated_vin_no ? 'ALLOCATED' : 'PENDING_ALLOCATION'
  }));

  try {
    const { error } = await supabase.from('bookings').upsert(sanitized, { onConflict: 'receipt_no' });
    if (error) throw error;
  } catch (e: any) {
    console.warn('Batch DB bookings upsert notice:', e);
  }

  const current = await fetchBookings();
  const receiptSet = new Set(sanitized.map(b => b.receipt_no));
  const merged = [...sanitized, ...current.filter(b => !receiptSet.has(b.receipt_no))];
  localStorage.setItem('dhoot_bookings_inventory', JSON.stringify(merged));
  window.dispatchEvent(new Event('bookings-updated'));

  return { count: sanitized.length };
};

export const allocateBookingVin = async (bookingId: string, receiptNo: string, vin: string, customerName: string): Promise<boolean> => {
  // 1. Concurrency Check: Verify if VIN is already allocated to another active booking
  try {
    const { data: existingAllocations, error: checkErr } = await supabase
      .from('bookings')
      .select('id, receipt_no, customer_name, status')
      .eq('allocated_vin_no', vin)
      .neq('status', 'CANCELLED');

    if (!checkErr && Array.isArray(existingAllocations) && existingAllocations.length > 0) {
      const conflict = existingAllocations.find(b => b.receipt_no !== receiptNo && b.id !== bookingId);
      if (conflict) {
        const msg = `[Dual-Allocation Prevented]: Vehicle VIN ${vin} is already actively assigned to Booking #${conflict.receipt_no} (${conflict.customer_name}). Please choose another stock vehicle or refresh the list.`;
        console.error(msg);
        alert(msg);
        return false;
      }
    }
  } catch (err) {
    console.warn('Concurrency pre-check notice:', err);
  }

  let dbSynced = false;
  try {
    // 2. Update Booking
    const { error: bErr } = await supabase.from('bookings').update({
      allocated_vin_no: vin,
      status: 'ALLOCATED',
      allotment_date: new Date().toISOString()
    }).or(`id.eq.${bookingId},receipt_no.eq.${receiptNo}`);
    if (bErr) throw bErr;

    // 3. Update Vehicle Status
    const { error: vErr } = await supabase.from('vehicles').update({
      status: 'ALLOCATED',
      customer_name: customerName,
      allocation_date: new Date().toISOString().split('T')[0]
    }).eq('vin', vin);
    if (vErr) throw vErr;

    dbSynced = true;
  } catch (e: any) {
    console.warn('Live VIN allocation DB notice:', e);
    // If DB returned unique constraint violation
    if (e?.code === '23505' || e?.message?.includes('idx_unique_active_vin_allocation')) {
      alert(`[Allocation Blocked]: Vehicle ${vin} is already allocated according to database unique index constraint!`);
      return false;
    }
    // Queue offline sync action
    addToSyncQueue({
      action: 'ALLOCATE_VIN',
      entity: 'bookings',
      data: { bookingId, receiptNo, vin, customerName }
    });
  }

  // Update local caches
  const bookings = await fetchBookings();
  const updatedBookings = bookings.map(b => (b.id === bookingId || b.receipt_no === receiptNo) ? {
    ...b,
    allocated_vin_no: vin,
    status: 'ALLOCATED' as const
  } : b);
  localStorage.setItem('dhoot_bookings_inventory', JSON.stringify(updatedBookings));

  const vehicles = await fetchVehicles();
  const updatedVehicles = vehicles.map(v => v.vin === vin ? {
    ...v,
    status: 'ALLOCATED',
    customer_name: customerName
  } : v);
  localStorage.setItem('dhoot_stock_inventory', JSON.stringify(updatedVehicles));

  window.dispatchEvent(new Event('bookings-updated'));
  window.dispatchEvent(new Event('stock-updated'));
  return true;
};

// ============================================================================
// 9. DELIVERY CHALLANS & TAX INVOICES
// ============================================================================

export const fetchChallans = async (brandCode?: string): Promise<ChallanRecord[]> => {
  try {
    const { data, error } = await supabase.from('challan_invoices').select('*').order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) {
      const normalized = data.map((c: any) => ({
        ...c,
        mobile: c.mobile || c.mobile_no || '',
        other: c.other || c.other_charges || 0
      }));
      localStorage.setItem('dhoot_challans_inventory', JSON.stringify(normalized));
      return filterByBrand(normalized, brandCode);
    }
  } catch (e) {
    console.warn('DB challans fetch notice:', e);
  }

  const cached = localStorage.getItem('dhoot_challans_inventory');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return filterByBrand(parsed, brandCode);
    } catch (e) {}
  }
  return [];
};

export const saveChallan = async (challan: Partial<ChallanRecord>): Promise<boolean> => {
  const orgId = isHyundai(challan) ? HYUNDAI_ORG_ID : TATA_ORG_ID;
  const payload = {
    ...challan,
    organization_id: challan.organization_id || orgId
  };

  let synced = false;
  try {
    const { error } = await supabase.from('challan_invoices').upsert(payload, { onConflict: 'challan_no' });
    if (error) throw error;
    synced = true;
  } catch (e) {
    console.warn('Save challan remote sync notice, queued to outbox:', e);
    addToSyncQueue({
      action: 'SAVE_CHALLAN',
      entity: 'challan_invoices',
      data: payload
    });
  }

  const current = await fetchChallans();
  const updated = [payload as ChallanRecord, ...current.filter(c => c.challan_no !== challan.challan_no)];
  localStorage.setItem('dhoot_challans_inventory', JSON.stringify(updated));
  window.dispatchEvent(new Event('challans-updated'));
  return synced;
};

export const bulkImportChallans = async (challans: Partial<ChallanRecord>[]): Promise<{ count: number; error?: string }> => {
  if (challans.length === 0) return { count: 0 };

  const sanitized = challans.map(c => ({
    ...c,
    organization_id: c.organization_id || (isHyundai(c) ? HYUNDAI_ORG_ID : TATA_ORG_ID)
  }));

  try {
    const { error } = await supabase.from('challan_invoices').upsert(sanitized, { onConflict: 'challan_no' });
    if (error) throw error;
  } catch (e: any) {
    console.warn('Batch DB challans upsert notice:', e);
  }

  const current = await fetchChallans();
  const challanNoSet = new Set(sanitized.map(c => c.challan_no));
  const merged = [...sanitized, ...current.filter(c => !challanNoSet.has(c.challan_no))];
  localStorage.setItem('dhoot_challans_inventory', JSON.stringify(merged));
  window.dispatchEvent(new Event('challans-updated'));

  return { count: sanitized.length };
};

// ============================================================================
// 10. PDI QUEUE & INSPECTIONS
// ============================================================================

export const fetchPdiQueue = async (brandCode?: string): Promise<PdiInspectionItem[]> => {
  const allVehicles = await fetchVehicles(brandCode);
  return allVehicles
    .filter(v => v.status === 'PDI_PENDING' || v.status === 'PDI_IN_PROGRESS' || v.status === 'RECEIVED')
    .map(v => ({
      id: v.id || v.vin,
      vin: v.vin,
      brand: isHyundai(v) ? 'HYUNDAI' : 'TATA',
      model: v.model || 'OEM Vehicle',
      variant: v.variant || 'Standard',
      color: v.color || 'White',
      yardLocation: v.location || 'Basni Yard • Bay 1',
      inspector: 'Senior PDI Quality Inspector',
      progress: v.status === 'PDI_IN_PROGRESS' ? 65 : 0,
      passed: v.status === 'PDI_IN_PROGRESS' ? 42 : 0,
      failed: 0,
      total: 64,
      status: v.status === 'RECEIVED' ? 'PENDING_START' : v.status,
      startedAt: '10:30 AM',
      elapsedTime: v.status === 'PDI_IN_PROGRESS' ? '24 mins' : 'Not Started'
    }));
};

// ============================================================================
// 11. DEFECT REPAIRS & RECTIFICATIONS
// ============================================================================

export const fetchRepairs = async (brandCode?: string): Promise<RepairTicketItem[]> => {
  try {
    // 1. Primary: repair_tickets table from database
    const { data: tickets, error: ticketErr } = await supabase
      .from('repair_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!ticketErr && Array.isArray(tickets) && tickets.length > 0) {
      const mapped = tickets.map((t: any) => ({
        id: t.id,
        vin: t.vin || 'VIN-UNKNOWN',
        brand: t.brand || 'TATA',
        model: t.model || 'Vehicle',
        defectArea: t.area || t.defectArea || t.part_area || 'Exterior Body',
        area: t.area || t.defectArea || t.part_area || 'Exterior Body',
        severity: t.severity || 'MAJOR',
        description: t.description || 'Inspection finding requiring rectification',
        technician: t.assigned_to || t.assignedTo || t.technician || 'Senior Bodyshop Tech',
        assignedTo: t.assigned_to || t.assignedTo || t.technician || 'Senior Bodyshop Tech',
        bay: t.bay || 'Bay 1',
        status: t.status || 'OPEN',
        createdAt: t.created_at || t.createdAt || new Date().toISOString()
      }));
      return filterByBrand(mapped, brandCode);
    }

    // 2. Secondary: pdi_findings table fallback
    const { data, error } = await supabase.from('pdi_findings').select('*').order('created_at', { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data.map((f: any) => ({
        id: f.id,
        vin: f.vin || 'VIN-UNKNOWN',
        brand: f.brand || 'TATA',
        model: f.model || 'Vehicle',
        defectArea: f.part_area || f.area || 'Exterior Body',
        area: f.part_area || f.area || 'Exterior Body',
        severity: f.severity || 'MAJOR',
        description: f.description || 'Inspection finding requiring rectification',
        technician: f.assigned_to || 'Senior Bodyshop Tech',
        assignedTo: f.assigned_to || 'Senior Bodyshop Tech',
        bay: f.bay || 'Bay 3',
        status: f.status || 'OPEN',
        createdAt: f.created_at || new Date().toISOString()
      }));
      return filterByBrand(mapped, brandCode);
    }
  } catch (e) {}
  return [];
};

export const updateRepairStatus = async (findingId: string, status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'): Promise<boolean> => {
  try {
    const { error: err1 } = await supabase.from('repair_tickets').update({ status }).eq('id', findingId);
    if (!err1) return true;
    await supabase.from('pdi_findings').update({ status }).eq('id', findingId);
    return true;
  } catch (e) {
    return false;
  }
};

// ============================================================================
// 12. QA QUEUE & CERTIFICATION
// ============================================================================

export const fetchQaQueue = async (brandCode?: string): Promise<any[]> => {
  const allVehicles = await fetchVehicles(brandCode);
  return allVehicles
    .filter(v => v.status === 'PDI_APPROVED' || v.status === 'QA_PENDING' || v.status === 'DELIVERY_READY')
    .map(v => ({
      id: v.id || v.vin,
      vin: v.vin,
      model: v.model || 'OEM Vehicle',
      variant: v.variant || 'Standard',
      color: v.color || 'Standard',
      inspector: 'Senior PDI Quality Inspector',
      passed: 64,
      failed: 0,
      submittedAt: 'Today, 11:30 AM',
      status: v.status === 'PDI_APPROVED' || v.status === 'DELIVERY_READY' ? 'APPROVED' : 'PENDING',
      certId: `CERT-${v.vin.slice(-6)}`
    }));
};

export const approveQaInspection = async (vin: string): Promise<boolean> => {
  try {
    await supabase.from('vehicles').update({ status: 'DELIVERY_READY' }).eq('vin', vin);
    // Refresh local cache
    const current = await fetchVehicles();
    const updated = current.map(v => v.vin === vin ? { ...v, status: 'DELIVERY_READY' } : v);
    localStorage.setItem('dhoot_stock_inventory', JSON.stringify(updated));
    window.dispatchEvent(new Event('stock-updated'));
    return true;
  } catch (e) {
    return false;
  }
};

// ============================================================================
// 13. YARD RECEIVING & GATE INWARDING
// ============================================================================

export const fetchInwardQueue = async (brandCode?: string): Promise<any[]> => {
  const allVehicles = await fetchVehicles(brandCode);
  return allVehicles.filter(v => 
    v.status === 'YARD_RECEIVING_PENDING' || 
    v.status === 'GATE_INWARD_PENDING' || 
    v.status === 'IN_TRANSIT' || 
    v.location === 'In Transit'
  );
};

export const inwardVehicleGate = async (vin: string, details: { location: string; bay?: string; odometer?: number }): Promise<boolean> => {
  try {
    await supabase.from('vehicles').update({
      status: 'RECEIVED',
      location: details.location,
      yard_bay: details.bay || 'Bay 1',
      odometer_km: details.odometer || 12
    }).eq('vin', vin);

    const current = await fetchVehicles();
    const updated = current.map(v => v.vin === vin ? {
      ...v,
      status: 'RECEIVED',
      location: details.location
    } : v);
    localStorage.setItem('dhoot_stock_inventory', JSON.stringify(updated));
    window.dispatchEvent(new Event('stock-updated'));
    return true;
  } catch (e) {
    return false;
  }
};

// ============================================================================
// 14. 1-CLICK MASTER DATABASE SEEDER
// ============================================================================

export const seedInitialMastersToDatabase = async (): Promise<{ success: boolean; message: string; counts: Record<string, number> }> => {
  const counts: Record<string, number> = {
    stockyards: 0,
    branches: 0,
    models: 0,
    financiers: 0,
    insurance: 0,
    checkpoints: 0
  };

  try {
    // 1. Initial Stockyards
    const initialYards = [
      { id: 'yrd-t-1', organization_id: TATA_ORG_ID, code: 'YRD-BASNI', name: 'Basni Yard', brand: 'Tata Motors', city: 'Jodhpur', state: 'Rajasthan', capacity: '200 Cars', manager: 'Ramesh Choudhary', phone: '+91 98290 10001', status: 'ACTIVE' },
      { id: 'yrd-t-2', organization_id: TATA_ORG_ID, code: 'YRD-SUMER', name: 'Sumerpur', brand: 'Tata Motors', city: 'Sumerpur', state: 'Rajasthan', capacity: '80 Cars', manager: 'Vikram Singh', phone: '+91 98290 10002', status: 'ACTIVE' },
      { id: 'yrd-t-3', organization_id: TATA_ORG_ID, code: 'YRD-PALI', name: 'Pali', brand: 'Tata Motors', city: 'Pali', state: 'Rajasthan', capacity: '100 Cars', manager: 'Dinesh Gehlot', phone: '+91 98290 10003', status: 'ACTIVE' },
      { id: 'yrd-h-1', organization_id: HYUNDAI_ORG_ID, code: 'YRD-SHANTI-H', name: 'Shantinath Yard', brand: 'Hyundai', city: 'Jodhpur', state: 'Rajasthan', capacity: '180 Cars', manager: 'Manish Rathore', phone: '+91 98291 20001', status: 'ACTIVE' },
      { id: 'yrd-h-2', organization_id: HYUNDAI_ORG_ID, code: 'YRD-PNAGAR-H', name: 'Pratap Nagar Showroom', brand: 'Hyundai', city: 'Jodhpur', state: 'Rajasthan', capacity: '50 Cars', manager: 'Anil Vyas', phone: '+91 98291 20002', status: 'ACTIVE' },
    ];
    const { error: yErr } = await supabase.from('stockyards').upsert(initialYards, { onConflict: 'code' });
    if (!yErr) counts.stockyards = initialYards.length;

    // 2. Initial Branches
    const initialBranches = [
      { id: 'br-t-1', organization_id: TATA_ORG_ID, code: 'BR-PNAGAR-T', name: 'Pratap Nagar', brand: 'Tata Motors', type: 'Main Showroom', city: 'Jodhpur', state: 'Rajasthan', capacity: '50 Cars', manager: 'Rajesh Sharma', phone: '+91 98290 10008', status: 'ACTIVE' },
      { id: 'br-t-2', organization_id: TATA_ORG_ID, code: 'BR-BKOTHI', name: 'Bhagat Ki Kothi', brand: 'Tata Motors', type: 'Main Showroom', city: 'Jodhpur', state: 'Rajasthan', capacity: '60 Cars', manager: 'Sunil Jani', phone: '+91 98290 10009', status: 'ACTIVE' },
      { id: 'br-h-1', organization_id: HYUNDAI_ORG_ID, code: 'BR-PNAGAR-H', name: 'Pratap Nagar', brand: 'Hyundai', type: 'Main Showroom', city: 'Jodhpur', state: 'Rajasthan', capacity: '50 Cars', manager: 'Anil Vyas', phone: '+91 98291 20002', status: 'ACTIVE' },
    ];
    const { error: bErr } = await supabase.from('branches').upsert(initialBranches, { onConflict: 'code' });
    if (!bErr) counts.branches = initialBranches.length;

    // 3. Initial OEM Models
    const initialModels = [
      { id: 'm-1', brand: 'Tata Motors', model_name: 'Tata Safari', body_type: 'SUV', base_ex_showroom: 1619000, fuel_types: ['DIESEL'], transmission: '6MT / 6AT', seating_capacity: '6/7 Seater', variants: ['Smart', 'Pure', 'Adventure', 'Accomplished+'], colors: ['Oberon Black', 'Cosmic Gold', 'Stardust Ash'], gst_rate: 28 },
      { id: 'm-2', brand: 'Tata Motors', model_name: 'Tata Harrier', body_type: 'SUV', base_ex_showroom: 1549000, fuel_types: ['DIESEL'], transmission: '6MT / 6AT', seating_capacity: '5 Seater', variants: ['Smart', 'Pure', 'Adventure', 'Fearless+'], colors: ['Oberon Black', 'Sunlit Yellow', 'Pebble Grey'], gst_rate: 28 },
      { id: 'm-3', brand: 'Tata Motors', model_name: 'Tata Nexon', body_type: 'Compact SUV', base_ex_showroom: 799000, fuel_types: ['PETROL', 'DIESEL', 'iCNG', 'EV'], transmission: '5MT / 6MT / 6AMT / 7DCA', seating_capacity: '5 Seater', variants: ['Smart', 'Pure', 'Creative', 'Fearless+'], colors: ['Daytona Grey', 'Fearless Purple', 'Pristine White'], gst_rate: 28 },
      { id: 'm-4', brand: 'Tata Motors', model_name: 'Tata Curvv / Curvv.ev', body_type: 'SUV Coupe', base_ex_showroom: 999000, fuel_types: ['PETROL', 'DIESEL', 'EV'], transmission: '6MT / 7DCA / Electric Drive', seating_capacity: '5 Seater', variants: ['Smart', 'Pure+', 'Creative+', 'Accomplished+'], colors: ['Empowered Oxide', 'Flame Red', 'Opera Blue'], gst_rate: 28 },
      { id: 'm-5', brand: 'Tata Motors', model_name: 'Tata Punch', body_type: 'Micro SUV', base_ex_showroom: 612000, fuel_types: ['PETROL', 'iCNG', 'EV'], transmission: '5MT / 5AMT', seating_capacity: '5 Seater', variants: ['Pure', 'Adventure', 'Accomplished', 'Creative'], colors: ['Calypso Red', 'Atomic Orange', 'Daytona Grey'], gst_rate: 28 },
      { id: 'm-6', brand: 'Hyundai', model_name: 'Hyundai Creta', body_type: 'Midsize SUV', base_ex_showroom: 1099000, fuel_types: ['PETROL', 'DIESEL', 'TURBO'], transmission: '6MT / IVT / 6AT / 7DCT', seating_capacity: '5 Seater', variants: ['E', 'EX', 'S', 'SX', 'SX(O)'], colors: ['Ranger Khaki', 'Abyss Black', 'Atlas White'], gst_rate: 28 },
      { id: 'm-7', brand: 'Hyundai', model_name: 'Hyundai Venue / N Line', body_type: 'Compact SUV', base_ex_showroom: 794000, fuel_types: ['PETROL', 'DIESEL', 'TURBO'], transmission: '5MT / 6MT / 7DCT', seating_capacity: '5 Seater', variants: ['E', 'S', 'S(O)', 'SX', 'SX(O)'], colors: ['Thunder Blue', 'Atlas White', 'Typhoon Silver'], gst_rate: 28 },
    ];
    const { error: mErr } = await supabase.from('master_vehicle_models').upsert(initialModels, { onConflict: 'model_name' });
    if (!mErr) counts.models = initialModels.length;

    // 4. Initial Financiers
    const initialFinanciers = [
      { id: 'fin-1', name: 'HDFC Bank Auto Loan', category: 'PRIVATE_BANK', code: 'HDFC', contact_person: 'Vikram Mehta', contact_phone: '+91 98290 88801', contact_email: 'vikram.mehta@hdfcbank.com', is_active: true, max_ltv: 90, processing_fee: 3500 },
      { id: 'fin-2', name: 'State Bank of India (Car Loan)', category: 'NATIONALISED_BANK', code: 'SBI', contact_person: 'Dinesh Sharma', contact_phone: '+91 98290 88802', contact_email: 'agm.retail@sbi.co.in', is_active: true, max_ltv: 85, processing_fee: 1500 },
      { id: 'fin-3', name: 'Tata Motors Finance (TMFL)', category: 'OEM_CAPTIVE_NBFC', code: 'TMFL', contact_person: 'Pawan Rathore', contact_phone: '+91 98290 88804', contact_email: 'pawan.r@tmf.co.in', is_active: true, max_ltv: 95, processing_fee: 2500 },
      { id: 'fin-4', name: 'ICICI Bank Auto Finance', category: 'PRIVATE_BANK', code: 'ICICI', contact_person: 'Rajeev Singhal', contact_phone: '+91 98290 88803', contact_email: 'rajeev.singhal@icicibank.com', is_active: true, max_ltv: 90, processing_fee: 3000 },
    ];
    const { error: fErr } = await supabase.from('master_financiers').upsert(initialFinanciers, { onConflict: 'name' });
    if (!fErr) counts.financiers = initialFinanciers.length;

    // 5. Initial Insurance
    const initialInsurance = [
      { id: 'ins-1', name: 'Tata AIG General Insurance', code: 'TATA-AIG', claims_lead_name: 'Suresh Menon', contact_phone: '+91 98290 77701', cashless_tieup: true, tie_up_discount_percent: 20, is_active: true },
      { id: 'ins-2', name: 'ICICI Lombard General Insurance', code: 'ICICI-LOMB', claims_lead_name: 'Anand Kulkarni', contact_phone: '+91 98290 77702', cashless_tieup: true, tie_up_discount_percent: 18, is_active: true },
      { id: 'ins-3', name: 'Bajaj Allianz General Insurance', code: 'BAJAJ-ALL', claims_lead_name: 'Pooja Verma', contact_phone: '+91 98290 77703', cashless_tieup: true, tie_up_discount_percent: 15, is_active: true },
    ];
    const { error: iErr } = await supabase.from('master_insurance_providers').upsert(initialInsurance, { onConflict: 'name' });
    if (!iErr) counts.insurance = initialInsurance.length;

    // 6. Initial Checkpoints
    const initialCheckpoints = [
      { id: 'RULE-01', stage: 'Exterior', category: 'Body Panels', code: 'EXT-01', title: 'Body Panel Alignment & Gap Uniformity', description: 'Inspect hood, fenders, doors, and tailgate shutlines for uniform flushness (3.5mm ± 0.5mm)', standard_remark: 'All panel gaps uniform (3.5mm) & factory alignment', is_mandatory: true, photos_required: 2, video_required: false, severity: 'CRITICAL', tool_required: 'Feeler Gap Gauge', is_active: true },
      { id: 'RULE-02', stage: 'Exterior', category: 'Paint Finish', code: 'EXT-02', title: 'Paint Gloss & Clear Coat Transit Inspection', description: '360° visual scan under diffused inspection lights for orange peel, dust nibs, transit scratches, or buffer swirl marks', standard_remark: 'High-gloss clear coat verified, zero transit defects', is_mandatory: true, photos_required: 4, video_required: true, severity: 'CRITICAL', tool_required: 'Defect Marker Lamp', is_active: true },
      { id: 'RULE-03', stage: 'Electricals', category: 'Lighting', code: 'ELE-01', title: 'Full LED Headlamps, DRLs & Connected Lightbars', description: 'Verify Bi-LED projectors high/low beam leveler, sequential turn indicators, and rear connected taillight animation', standard_remark: 'Bi-LED projector & sequential animations verified', is_mandatory: true, photos_required: 2, video_required: false, severity: 'CRITICAL', tool_required: 'Beam Tester', is_active: true },
      { id: 'RULE-04', stage: 'Interior', category: 'Cockpit', code: 'INT-01', title: 'Digital Instrument Cluster & Infotainment', description: 'Check 10.25-inch instrument cluster dials, touchscreen, wireless Android Auto / Apple CarPlay pairing', standard_remark: 'Display cluster responsive & smartphone pairing OK', is_mandatory: true, photos_required: 2, video_required: false, severity: 'MAJOR', tool_required: 'Diagnostic Tool', is_active: true },
      { id: 'RULE-05', stage: 'Wheels', category: 'Tyres & Wheels', code: 'WHL-01', title: 'Tyre & Wheel Inspection', description: 'Check tyre pressure, tread depth, rim scratches, wheel nut torque, and spare tyre kit', standard_remark: 'Correct size, pressure & tread depth verified', is_mandatory: true, photos_required: 1, video_required: false, severity: 'MINOR', tool_required: 'Tyre Gauge', is_active: true },
      { id: 'RULE-06', stage: 'Engine Bay', category: 'Fluids', code: 'ENG-01', title: 'Engine Oil, Coolant, Brake Fluid & Battery SOC', description: 'Verify oil dipstick level, coolant reservoir MAX mark, DOT4 brake fluid, and 12V auxiliary battery terminal voltage (>12.6V)', standard_remark: 'Fluid levels at MAX line; 12V auxiliary battery at 12.8V', is_mandatory: true, photos_required: 2, video_required: false, severity: 'CRITICAL', tool_required: 'Multimeter & Refractometer', is_active: true },
    ];
    const { error: cErr } = await supabase.from('checkpoints').upsert(initialCheckpoints, { onConflict: 'code' });
    if (!cErr) counts.checkpoints = initialCheckpoints.length;

    // 7. Initial Operational Users
    const initialUsers = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        organization_id: TATA_ORG_ID,
        employee_id: 'ADMIN01',
        user_code: 'ADMIN01',
        user_name: 'System Administrator',
        first_name: 'System',
        last_name: 'Administrator',
        email: 'admin@dhootgroup.com',
        phone: '+919829010001',
        role: 'SUPER_ADMIN',
        designation: 'General Manager',
        brand: 'ALL',
        nature: 'Management',
        password_hash: 'Admin@2026',
        is_active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        organization_id: TATA_ORG_ID,
        employee_id: 'PDI01',
        user_code: 'PDI01',
        user_name: 'Ramesh Choudhary',
        first_name: 'Ramesh',
        last_name: 'Choudhary',
        email: 'pdi@dhootgroup.com',
        phone: '+919829010002',
        role: 'PDI_ENGINEER',
        designation: 'Senior PDI Inspector',
        brand: 'Autoprime Tata',
        nature: 'Quality Inspection',
        password_hash: 'Pdi@2026',
        is_active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        organization_id: TATA_ORG_ID,
        employee_id: 'QA01',
        user_code: 'QA01',
        user_name: 'Sunil Sharma',
        first_name: 'Sunil',
        last_name: 'Sharma',
        email: 'qa@dhootgroup.com',
        phone: '+919829010003',
        role: 'QA_MANAGER',
        designation: 'QA Certifying Head',
        brand: 'ALL',
        nature: 'Quality Assurance',
        password_hash: 'Qa@2026',
        is_active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        organization_id: TATA_ORG_ID,
        employee_id: 'YARD01',
        user_code: 'YARD01',
        user_name: 'Vikram Singh',
        first_name: 'Vikram',
        last_name: 'Singh',
        email: 'yard@dhootgroup.com',
        phone: '+919829010004',
        role: 'YARD_MANAGER',
        designation: 'Basni Yard In-charge',
        brand: 'Autoprime Tata',
        nature: 'Stockyard',
        password_hash: 'Yard@2026',
        is_active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000005',
        organization_id: HYUNDAI_ORG_ID,
        employee_id: 'SALES01',
        user_code: 'SALES01',
        user_name: 'Dinesh Gehlot',
        first_name: 'Dinesh',
        last_name: 'Gehlot',
        email: 'sales@dhootgroup.com',
        phone: '+919829010005',
        role: 'BRANCH_MANAGER',
        designation: 'Senior Sales Consultant',
        brand: 'Raja Hyundai',
        nature: 'Sales',
        password_hash: 'Sales@2026',
        is_active: true
      }
    ];
    const { error: uErr } = await supabase.from('users').upsert(initialUsers, { onConflict: 'employee_id' });
    if (!uErr) counts.users = initialUsers.length;

    // Trigger local refreshes
    window.dispatchEvent(new Event('stockyards-updated'));
    window.dispatchEvent(new Event('branches-updated'));
    window.dispatchEvent(new Event('models-updated'));
    window.dispatchEvent(new Event('financiers-updated'));
    window.dispatchEvent(new Event('insurance-updated'));
    window.dispatchEvent(new Event('pdi-rules-updated'));

    return {
      success: true,
      message: 'Initial master catalogs seeded successfully into live PostgreSQL database.',
      counts
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error occurred while seeding master data to database.',
      counts
    };
  }
};
