import { supabase } from '../lib/supabase';
import { 
  TATA_ORG_ID, 
  HYUNDAI_ORG_ID, 
  getAllVehicles, 
  getVehiclesForBrand, 
  saveStockInventory, 
  getAllUsers, 
  saveUsersInventory, 
  saveSingleUser, 
  deleteUserFromInventory, 
  findUserForAuth, 
  SEED_USERS,
  SEED_STOCKYARDS,
  SEED_BRANCHES,
  SEED_CHECKPOINTS,
  SEED_MODELS,
  SEED_FINANCIERS,
  SEED_INSURANCE,
  deleteVehicleFromStorage,
  deleteMultipleVehiclesFromStorage,
  clearCustomUploadedStockFromStorage,
  resetAllStockToDefaultInStorage,
  getDeletedBookingReceipts,
  saveDeletedBookingReceipts,
  deleteBookingFromStorage,
  deleteMultipleBookingsFromStorage,
  clearAllBookingsFromStorage,
  resetBookingsToDefaultInStorage
} from '../data/seedData';
export { getAllUsers, saveUsersInventory, saveSingleUser, deleteUserFromInventory, findUserForAuth, SEED_USERS };
export { 
  deleteVehicleFromStorage, 
  deleteMultipleVehiclesFromStorage, 
  clearCustomUploadedStockFromStorage, 
  resetAllStockToDefaultInStorage,
  getDeletedBookingReceipts,
  saveDeletedBookingReceipts,
  deleteBookingFromStorage,
  deleteMultipleBookingsFromStorage,
  clearAllBookingsFromStorage,
  resetBookingsToDefaultInStorage
};
export type { EnterpriseUser } from '../data/seedData';
import initialStockVehicles from '../data/initialVehicles.json';

const LOCAL_DB_URL = 'http://localhost:54321/rest/v1';
const getLocalDbEndpoint = (table: string) => `${LOCAL_DB_URL}/${table.replace(/^\//, '')}`;


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
  area?: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  description: string;
  technician: string;
  assignedTo?: string;
  location?: string;
  bay?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  actionTaken?: string;
  partsUsed?: string;
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
  // Tier 1: Dedicated Local DB Server (Fastest, 100% resilient offline/LAN)
  try {
    const res = await fetch(getLocalDbEndpoint('stockyards'), { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('autoprime_stockyards', JSON.stringify(data));
        return filterByBrand(data, brandCode);
      }
    }
  } catch (e) {}

  // Tier 2: Supabase Cloud Database
  try {
    const { data, error } = await supabase.from('stockyards').select('*').order('name');
    if (!error && Array.isArray(data) && data.length > 0) {
      localStorage.setItem('autoprime_stockyards', JSON.stringify(data));
      return filterByBrand(data, brandCode);
    }
  } catch (e) {
    console.warn('DB stockyards fetch notice:', e);
  }

  // Tier 3: LocalStorage Cache
  try {
    const cached = localStorage.getItem('autoprime_stockyards');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return filterByBrand(parsed, brandCode);
      }
    }
  } catch (e) {}

  // Tier 4: Guaranteed Official Dealership Seed Catalog Fallback
  localStorage.setItem('autoprime_stockyards', JSON.stringify(SEED_STOCKYARDS));
  return filterByBrand(SEED_STOCKYARDS, brandCode);
};

export const saveStockyard = async (yard: YardItem): Promise<boolean> => {
  const orgId = yard.brand === 'Hyundai' ? HYUNDAI_ORG_ID : TATA_ORG_ID;
  const sanitizedId = yard.id && yard.id.length >= 30 ? yard.id : (crypto.randomUUID ? crypto.randomUUID() : `44444444-4444-4444-4444-${Date.now().toString().slice(-12)}`);
  const payload: YardItem = {
    ...yard,
    id: sanitizedId,
    organization_id: yard.organization_id || orgId
  };

  // 1. Optimistic LocalStorage Update
  try {
    const current = await fetchStockyards();
    const existingIndex = current.findIndex(y => y.id === payload.id || y.code === payload.code);
    let updated: YardItem[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...payload };
    } else {
      updated = [payload, ...current];
    }
    localStorage.setItem('autoprime_stockyards', JSON.stringify(updated));
    window.dispatchEvent(new Event('stockyards-updated'));
  } catch (e) {}

  // 2. Persist to Local DB Server
  try {
    await fetch(getLocalDbEndpoint('stockyards'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {}

  // 3. Sync to Supabase Cloud (with numeric capacity parsing to avoid 22P02 error)
  try {
    const numCap = parseInt(String(payload.capacity || '').replace(/\D/g, ''), 10) || 100;
    const dbPayload = {
      id: payload.id,
      code: payload.code,
      name: payload.name,
      organization_id: orgId,
      city: payload.city,
      state: payload.state,
      capacity: numCap,
      status: payload.status
    };
    await supabase.from('stockyards').upsert(dbPayload, { onConflict: 'code' });
  } catch (e) {
    console.warn('Supabase stockyard sync notice:', e);
  }

  return true;
};

export const deleteStockyard = async (id: string): Promise<boolean> => {
  // 1. LocalStorage
  try {
    const cached = localStorage.getItem('autoprime_stockyards');
    if (cached) {
      const current: YardItem[] = JSON.parse(cached);
      const updated = current.filter(y => y.id !== id);
      localStorage.setItem('autoprime_stockyards', JSON.stringify(updated));
      window.dispatchEvent(new Event('stockyards-updated'));
    }
  } catch (e) {}

  // 2. Local DB
  try {
    await fetch(`${getLocalDbEndpoint('stockyards')}?id=eq.${id}`, { method: 'DELETE', signal: AbortSignal.timeout(2000) });
  } catch (e) {}

  // 3. Supabase
  try {
    await supabase.from('stockyards').delete().eq('id', id);
  } catch (e) {}

  return true;
};

export const toggleStockyardStatus = async (id: string, newStatus: 'ACTIVE' | 'INACTIVE'): Promise<boolean> => {
  try {
    const cached = localStorage.getItem('autoprime_stockyards');
    const current: YardItem[] = cached ? JSON.parse(cached) : SEED_STOCKYARDS;
    const updated = current.map(y => y.id === id ? { ...y, status: newStatus } : y);
    localStorage.setItem('autoprime_stockyards', JSON.stringify(updated));
    window.dispatchEvent(new Event('stockyards-updated'));
  } catch (e) {}

  try {
    await fetch(`${getLocalDbEndpoint('stockyards')}?id=eq.${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {}

  try {
    await supabase.from('stockyards').update({ status: newStatus }).eq('id', id);
  } catch (e) {}

  return true;
};

// ============================================================================
// 2. MASTER BRANCHES
// ============================================================================

export const fetchBranches = async (brandCode?: string): Promise<BranchItem[]> => {
  // Tier 1: Local Dedicated DB Server
  try {
    const res = await fetch(getLocalDbEndpoint('branches'), { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('autoprime_branches', JSON.stringify(data));
        return filterByBrand(data, brandCode);
      }
    }
  } catch (e) {}

  // Tier 2: Supabase Cloud Database
  try {
    const { data, error } = await supabase.from('branches').select('*').order('name');
    if (!error && Array.isArray(data) && data.length > 0) {
      localStorage.setItem('autoprime_branches', JSON.stringify(data));
      return filterByBrand(data, brandCode);
    }
  } catch (e) {
    console.warn('DB branches fetch notice:', e);
  }

  // Tier 3: LocalStorage Cache
  try {
    const cached = localStorage.getItem('autoprime_branches');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return filterByBrand(parsed, brandCode);
      }
    }
  } catch (e) {}

  // Tier 4: Guaranteed Official Dealership Seed Catalog Fallback
  localStorage.setItem('autoprime_branches', JSON.stringify(SEED_BRANCHES));
  return filterByBrand(SEED_BRANCHES, brandCode);
};

export const saveBranch = async (branch: BranchItem): Promise<boolean> => {
  const orgId = branch.brand === 'Hyundai' ? HYUNDAI_ORG_ID : TATA_ORG_ID;
  const sanitizedId = branch.id && branch.id.length >= 30 ? branch.id : (crypto.randomUUID ? crypto.randomUUID() : `55555555-5555-5555-5555-${Date.now().toString().slice(-12)}`);
  const payload: BranchItem = {
    ...branch,
    id: sanitizedId,
    organization_id: branch.organization_id || orgId
  };

  // 1. Optimistic LocalStorage Update
  try {
    const current = await fetchBranches();
    const existingIndex = current.findIndex(b => b.id === payload.id || b.code === payload.code);
    let updated: BranchItem[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...payload };
    } else {
      updated = [payload, ...current];
    }
    localStorage.setItem('autoprime_branches', JSON.stringify(updated));
    window.dispatchEvent(new Event('branches-updated'));
  } catch (e) {}

  // 2. Persist to Local DB Server
  try {
    await fetch(getLocalDbEndpoint('branches'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {}

  // 3. Sync to Supabase Cloud
  try {
    const dbPayload = {
      id: payload.id,
      code: payload.code,
      name: payload.name,
      organization_id: orgId,
      city: payload.city,
      state: payload.state,
      phone: payload.phone,
      manager: payload.manager,
      status: payload.status
    };
    await supabase.from('branches').upsert(dbPayload, { onConflict: 'code' });
  } catch (e) {
    console.warn('Supabase branch sync notice:', e);
  }

  return true;
};

export const deleteBranch = async (id: string): Promise<boolean> => {
  try {
    const cached = localStorage.getItem('autoprime_branches');
    if (cached) {
      const current: BranchItem[] = JSON.parse(cached);
      const updated = current.filter(b => b.id !== id);
      localStorage.setItem('autoprime_branches', JSON.stringify(updated));
      window.dispatchEvent(new Event('branches-updated'));
    }
  } catch (e) {}

  try {
    await fetch(`${getLocalDbEndpoint('branches')}?id=eq.${id}`, { method: 'DELETE', signal: AbortSignal.timeout(2000) });
  } catch (e) {}

  try {
    await supabase.from('branches').delete().eq('id', id);
  } catch (e) {}

  return true;
};

// ============================================================================
// 3. MASTER VEHICLE MODELS
// ============================================================================

export const fetchMasterModels = async (brandCode?: string): Promise<VehicleModelItem[]> => {
  // Tier 1: Local Dedicated DB Server
  try {
    const res = await fetch(getLocalDbEndpoint('master_vehicle_models'), { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((m: any) => ({
          id: m.id || `mod-${Date.now()}`,
          brand: m.brand === 'HYUNDAI' || m.brand === 'Hyundai' ? 'Hyundai' : 'Tata Motors',
          model_name: m.model_name || m.name || '',
          body_type: m.body_type || m.segment || 'SUV',
          base_ex_showroom: Number(m.base_ex_showroom || m.price || 800000),
          fuel_types: Array.isArray(m.fuel_types) ? m.fuel_types : ['Petrol'],
          transmission: m.transmission || 'Manual / Automatic',
          seating_capacity: m.seating_capacity || '5 Seater',
          variants: Array.isArray(m.variants) ? m.variants : ['Base', 'Top'],
          colors: Array.isArray(m.colors) ? m.colors : ['White', 'Black'],
          gst_rate: Number(m.gst_rate || 28),
          is_active: m.is_active ?? m.active ?? true
        }));
        localStorage.setItem('autoprime_models', JSON.stringify(mapped));
        return filterByBrand(mapped, brandCode);
      }
    }
  } catch (e) {}

  // Tier 2: Supabase Cloud Database
  try {
    const { data, error } = await supabase.from('master_vehicle_models').select('*').order('model_name');
    if (!error && Array.isArray(data) && data.length > 0) {
      localStorage.setItem('autoprime_models', JSON.stringify(data));
      return filterByBrand(data, brandCode);
    }
  } catch (e) {
    console.warn('DB models fetch notice:', e);
  }

  // Tier 3: LocalStorage Cache
  try {
    const cached = localStorage.getItem('autoprime_models');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return filterByBrand(parsed, brandCode);
    }
  } catch (e) {}

  // Tier 4: Guaranteed Official Dealership Seed Catalog Fallback
  localStorage.setItem('autoprime_models', JSON.stringify(SEED_MODELS));
  return filterByBrand(SEED_MODELS, brandCode);
};

export const saveMasterModel = async (model: VehicleModelItem): Promise<boolean> => {
  const current = await fetchMasterModels();
  const updated = [model, ...current.filter(m => m.id !== model.id && m.model_name !== model.model_name)];
  localStorage.setItem('autoprime_models', JSON.stringify(updated));
  window.dispatchEvent(new Event('models-updated'));

  try {
    await fetch(getLocalDbEndpoint('master_vehicle_models'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(model),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {}

  try {
    await supabase.from('master_vehicle_models').upsert(model, { onConflict: 'model_name' });
  } catch (e) {}

  return true;
};

export const deleteMasterModel = async (id: string): Promise<boolean> => {
  const cached = localStorage.getItem('autoprime_models');
  if (cached) {
    const current: VehicleModelItem[] = JSON.parse(cached);
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem('autoprime_models', JSON.stringify(updated));
    window.dispatchEvent(new Event('models-updated'));
  }

  try {
    await fetch(`${getLocalDbEndpoint('master_vehicle_models')}?id=eq.${id}`, { method: 'DELETE', signal: AbortSignal.timeout(2000) });
  } catch (e) {}

  try {
    await supabase.from('master_vehicle_models').delete().eq('id', id);
  } catch (e) {}

  return true;
};

// ============================================================================
// 4. MASTER FINANCIERS
// ============================================================================

export const fetchMasterFinanciers = async (): Promise<FinancierItem[]> => {
  // Tier 1: Local Dedicated DB Server
  try {
    const res = await fetch(getLocalDbEndpoint('master_financiers'), { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: FinancierItem[] = data.map((f: any) => ({
          id: f.id,
          name: f.name,
          category: f.category || 'PRIVATE_BANK',
          code: f.code || f.name.slice(0, 4).toUpperCase(),
          contactPerson: f.contact_person || f.contactPerson || 'Branch Manager',
          phone: f.contact_phone || f.phone || '+91 1800 11 2211',
          email: f.contact_email || f.email || 'loans@bank.com',
          activeStatus: f.active === false || f.is_active === false ? 'INACTIVE' : 'ACTIVE',
          maxLtv: Number(f.max_ltv || f.maxLtv || 90),
          processingFee: Number(f.processing_fee || f.processingFee || 0.25)
        }));
        localStorage.setItem('autoprime_financiers', JSON.stringify(mapped));
        return mapped;
      }
    }
  } catch (e) {}

  // Tier 2: Supabase Cloud Database
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

  // Tier 3: LocalStorage Cache
  try {
    const cached = localStorage.getItem('autoprime_financiers');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  // Tier 4: Guaranteed Official Dealership Seed Catalog Fallback
  localStorage.setItem('autoprime_financiers', JSON.stringify(SEED_FINANCIERS));
  return SEED_FINANCIERS;
};

export const saveMasterFinancier = async (fin: FinancierItem): Promise<boolean> => {
  const current = await fetchMasterFinanciers();
  const updated = [fin, ...current.filter(f => f.id !== fin.id && f.name !== fin.name)];
  localStorage.setItem('autoprime_financiers', JSON.stringify(updated));
  window.dispatchEvent(new Event('financiers-updated'));

  try {
    await fetch(getLocalDbEndpoint('master_financiers'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fin),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {}

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
    await supabase.from('master_financiers').upsert(payload, { onConflict: 'name' });
  } catch (e) {}

  return true;
};

export const deleteMasterFinancier = async (id: string): Promise<boolean> => {
  const cached = localStorage.getItem('autoprime_financiers');
  if (cached) {
    const current: FinancierItem[] = JSON.parse(cached);
    const updated = current.filter(f => f.id !== id);
    localStorage.setItem('autoprime_financiers', JSON.stringify(updated));
    window.dispatchEvent(new Event('financiers-updated'));
  }

  try {
    await fetch(`${getLocalDbEndpoint('master_financiers')}?id=eq.${id}`, { method: 'DELETE', signal: AbortSignal.timeout(2000) });
  } catch (e) {}

  try {
    await supabase.from('master_financiers').delete().eq('id', id);
  } catch (e) {}

  return true;
};

// ============================================================================
// 5. MASTER INSURANCE PROVIDERS
// ============================================================================

export const fetchMasterInsurance = async (): Promise<InsuranceItem[]> => {
  // Tier 1: Local Dedicated DB Server
  try {
    const res = await fetch(getLocalDbEndpoint('master_insurance_providers'), { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: InsuranceItem[] = data.map((i: any) => ({
          id: i.id,
          name: i.name,
          code: i.code || i.name.slice(0, 4).toUpperCase(),
          claimsHead: i.claims_lead || i.claims_lead_name || i.claimsHead || 'Claims Officer',
          surveyorName: i.surveyor_name || i.surveyorName || 'Surveyor Desk',
          surveyorContact: i.contact_phone || i.phone || i.surveyorContact || '+91 1800 200 1122',
          cashlessTieUp: i.cashless_tieup ?? i.cashlessTieUp ?? true,
          discountPercentage: Number(i.tie_up_discount || i.tie_up_discount_percent || i.discountPercentage || 50),
          policyTypes: Array.isArray(i.coverage_packages) ? i.coverage_packages.join(', ') : (i.policyTypes || 'Zero Dep, RTI')
        }));
        localStorage.setItem('autoprime_insurance', JSON.stringify(mapped));
        return mapped;
      }
    }
  } catch (e) {}

  // Tier 2: Supabase Cloud Database
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

  // Tier 3: LocalStorage Cache
  try {
    const cached = localStorage.getItem('autoprime_insurance');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  // Tier 4: Guaranteed Official Dealership Seed Catalog Fallback
  localStorage.setItem('autoprime_insurance', JSON.stringify(SEED_INSURANCE));
  return SEED_INSURANCE;
};

export const saveMasterInsurance = async (ins: InsuranceItem): Promise<boolean> => {
  const current = await fetchMasterInsurance();
  const updated = [ins, ...current.filter(i => i.id !== ins.id && i.name !== ins.name)];
  localStorage.setItem('autoprime_insurance', JSON.stringify(updated));
  window.dispatchEvent(new Event('insurance-updated'));

  try {
    await fetch(getLocalDbEndpoint('master_insurance_providers'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ins),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {}

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
    await supabase.from('master_insurance_providers').upsert(payload, { onConflict: 'name' });
  } catch (e) {}

  return true;
};

export const deleteMasterInsurance = async (id: string): Promise<boolean> => {
  const cached = localStorage.getItem('autoprime_insurance');
  if (cached) {
    const current: InsuranceItem[] = JSON.parse(cached);
    const updated = current.filter(i => i.id !== id);
    localStorage.setItem('autoprime_insurance', JSON.stringify(updated));
    window.dispatchEvent(new Event('insurance-updated'));
  }

  try {
    await fetch(`${getLocalDbEndpoint('master_insurance_providers')}?id=eq.${id}`, { method: 'DELETE', signal: AbortSignal.timeout(2000) });
  } catch (e) {}

  try {
    await supabase.from('master_insurance_providers').delete().eq('id', id);
  } catch (e) {}

  return true;
};

// ============================================================================
// 6. MASTER PDI CHECKPOINTS
// ============================================================================

const mapToCheckpointItem = (c: any): PdiRuleItem => {
  const code = c.code || c.item_code || '';
  let inferredStage: PdiRuleItem['stage'] = 'Exterior';
  if (c.stage) {
    inferredStage = c.stage;
  } else if (code.startsWith('EXT')) {
    inferredStage = 'Exterior';
  } else if (code.startsWith('LGT')) {
    inferredStage = 'Electricals';
  } else if (code.startsWith('ENG')) {
    inferredStage = 'Engine Bay';
  } else if (code.startsWith('TYR')) {
    inferredStage = 'Wheels';
  } else if (code.startsWith('UND')) {
    inferredStage = 'Underbody';
  } else if (code.startsWith('INT') || code.startsWith('BOT')) {
    inferredStage = 'Interior';
  } else if (code.startsWith('BRK') || code.startsWith('DOC')) {
    inferredStage = 'Road Test';
  }

  return {
    id: c.id || `chk-${code || Date.now()}`,
    stage: inferredStage,
    category: c.category || c.category_name || `${inferredStage} Inspection`,
    code,
    title: c.title || c.instructions || 'Inspection Checkpoint',
    description: c.description || c.instructions || c.title || '',
    standardRemark: c.standardRemark || c.standard_remark || 'Verified and inspected OK',
    mandatory: c.mandatory ?? c.is_mandatory ?? true,
    photosRequired: c.photosRequired ?? c.photos_required ?? 1,
    videoRequired: c.videoRequired ?? c.video_required ?? false,
    severity: (c.severity || c.failure_severity || 'MAJOR') as any,
    toolRequired: c.toolRequired || c.tool_required || 'Visual',
    status: c.status || (c.is_active === false ? 'INACTIVE' : 'ACTIVE')
  };
};

export const fetchCheckpoints = async (stage?: string): Promise<PdiRuleItem[]> => {
  // Tier 1: Dedicated Local DB Server (table: checklist_items)
  try {
    const res = await fetch(getLocalDbEndpoint('checklist_items'), { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapToCheckpointItem);
        localStorage.setItem('autoprime_pdi_rules', JSON.stringify(mapped));
        return stage ? mapped.filter(r => r.stage === stage) : mapped;
      }
    }
  } catch (e) {}

  // Tier 2: Supabase Cloud Database (table: checklist_items, fallback checkpoints)
  try {
    let { data, error } = await supabase.from('checklist_items').select('*').order('display_order');
    if (error || !data || data.length === 0) {
      const res = await supabase.from('checkpoints').select('*').order('code');
      data = res.data;
      error = res.error;
    }
    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data.map(mapToCheckpointItem);
      localStorage.setItem('autoprime_pdi_rules', JSON.stringify(mapped));
      return stage ? mapped.filter(r => r.stage === stage) : mapped;
    }
  } catch (e) {
    console.warn('DB checkpoints fetch notice:', e);
  }

  // Tier 3: LocalStorage Cache
  try {
    const cached = localStorage.getItem('autoprime_pdi_rules');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return stage ? parsed.filter((r: PdiRuleItem) => r.stage === stage) : parsed;
      }
    }
  } catch (e) {}

  // Tier 4: Guaranteed Official Dealership Seed Catalog Fallback
  localStorage.setItem('autoprime_pdi_rules', JSON.stringify(SEED_CHECKPOINTS));
  return stage ? SEED_CHECKPOINTS.filter(r => r.stage === stage) : SEED_CHECKPOINTS;
};

export const saveCheckpoint = async (rule: PdiRuleItem): Promise<boolean> => {
  const current = await fetchCheckpoints();
  const updated = [rule, ...current.filter(r => r.id !== rule.id && r.code !== rule.code)];
  localStorage.setItem('autoprime_pdi_rules', JSON.stringify(updated));
  window.dispatchEvent(new Event('pdi-rules-updated'));

  // Save to Local DB server
  try {
    await fetch(getLocalDbEndpoint('checklist_items'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: rule.id,
        item_code: rule.code,
        title: rule.title,
        instructions: rule.description,
        is_mandatory: rule.mandatory,
        failure_severity: rule.severity
      }),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {}

  // Save to Supabase Cloud
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
    await supabase.from('checklist_items').upsert(payload, { onConflict: 'item_code' });
  } catch (e) {}

  return true;
};

export const deleteCheckpoint = async (id: string): Promise<boolean> => {
  const cached = localStorage.getItem('autoprime_pdi_rules');
  if (cached) {
    const current: PdiRuleItem[] = JSON.parse(cached);
    const updated = current.filter(r => r.id !== id);
    localStorage.setItem('autoprime_pdi_rules', JSON.stringify(updated));
    window.dispatchEvent(new Event('pdi-rules-updated'));
  }

  try {
    await fetch(`${getLocalDbEndpoint('checklist_items')}?id=eq.${id}`, { method: 'DELETE', signal: AbortSignal.timeout(2000) });
  } catch (e) {}

  try {
    await supabase.from('checklist_items').delete().eq('id', id);
  } catch (e) {}

  return true;
};

// ============================================================================
// 7. VEHICLES INVENTORY
// ============================================================================

export const fetchVehicles = async (brandCode?: string): Promise<StockVehicle[]> => {
  // Tier 1: Local Dedicated DB Server (Authoritative Store)
  try {
    const res = await fetch(getLocalDbEndpoint('vehicles'), { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveStockInventory(data);
        return getVehiclesForBrand(brandCode) as StockVehicle[];
      }
    }
  } catch (e) {}

  // Tier 2: Supabase Cloud Database
  try {
    const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      saveStockInventory(data);
      return getVehiclesForBrand(brandCode) as StockVehicle[];
    }
  } catch (e) {
    console.warn('DB vehicles fetch notice:', e);
  }

  // Tier 3: Local Storage / Seed Fallback
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

  saveStockInventory([payload]);

  // Sync to Local DB Server
  try {
    await fetch(getLocalDbEndpoint('vehicles'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {}

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

  return true;
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

  // Sync to Local DB Server
  try {
    await fetch(getLocalDbEndpoint('vehicles'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
      signal: AbortSignal.timeout(3000)
    });
  } catch (e) {}

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

export const deleteVehicleRecord = async (vin: string): Promise<boolean> => {
  if (!vin) return false;
  const cleanVin = vin.toUpperCase().trim();

  deleteVehicleFromStorage(cleanVin);

  try {
    await fetch(`${getLocalDbEndpoint('vehicles')}?vin=eq.${encodeURIComponent(cleanVin)}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000)
    });
  } catch (e) {
    console.warn('Local DB vehicle delete note:', e);
  }

  try {
    await supabase.from('vehicles').delete().eq('vin', cleanVin);
  } catch (e) {
    console.warn('Supabase vehicle delete note:', e);
  }

  return true;
};

export const deleteMultipleVehicleRecords = async (vins: string[]): Promise<number> => {
  if (!vins || vins.length === 0) return 0;
  const cleanVins = vins.map(v => v.toUpperCase().trim()).filter(Boolean);

  deleteMultipleVehiclesFromStorage(cleanVins);

  try {
    const vinParam = `in.(${cleanVins.join(',')})`;
    await fetch(`${getLocalDbEndpoint('vehicles')}?vin=${encodeURIComponent(vinParam)}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(4000)
    });
  } catch (e) {
    console.warn('Local DB bulk delete note:', e);
  }

  try {
    await supabase.from('vehicles').delete().in('vin', cleanVins);
  } catch (e) {
    console.warn('Supabase bulk delete note:', e);
  }

  return cleanVins.length;
};

export const clearCustomUploadedVehicles = async (): Promise<number> => {
  const count = clearCustomUploadedStockFromStorage();
  return count;
};

export const resetStockToFactoryDefaults = async (): Promise<boolean> => {
  return resetAllStockToDefaultInStorage();
};

export const updateVehicleLocation = async (vin: string, newLocation: string): Promise<boolean> => {
  const all = getAllVehicles();
  const updated = all.map(v => v.vin === vin ? { ...v, location: newLocation } : v);
  saveStockInventory(updated);

  // Sync to Local DB Server
  try {
    await fetch(`${getLocalDbEndpoint('vehicles')}?vin=eq.${vin}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: newLocation }),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {}

  try {
    await supabase.from('vehicles').update({ location: newLocation }).eq('vin', vin);
  } catch (e) {}

  return true;
};

export const updateVehicleStatus = async (vin: string, newStatus: string): Promise<boolean> => {
  const current = await fetchVehicles();
  const updated = current.map(v => v.vin === vin ? { ...v, status: newStatus } : v);
  localStorage.setItem('dhoot_stock_inventory', JSON.stringify(updated));
  window.dispatchEvent(new Event('stock-updated'));

  // Sync to Local DB Server
  try {
    await fetch(`${getLocalDbEndpoint('vehicles')}?vin=eq.${vin}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {}

  try {
    await supabase.from('vehicles').update({ status: newStatus }).eq('vin', vin);
  } catch (e) {}

  return true;
};

// ============================================================================
// 8. CUSTOMER BOOKINGS
// ============================================================================

export const fetchBookings = async (brandCode?: string): Promise<BookingRecord[]> => {
  const deletedSet = getDeletedBookingReceipts();

  // Tier 1: Local Dedicated DB Server
  try {
    const res = await fetch(getLocalDbEndpoint('bookings'), { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const filtered = data.filter((b: any) => 
          !deletedSet.has((b.receipt_no || '').toUpperCase().trim()) &&
          !deletedSet.has((b.id || '').toUpperCase().trim())
        );
        localStorage.setItem('dhoot_bookings_inventory', JSON.stringify(filtered));
        return filterByBrand(filtered, brandCode);
      }
    }
  } catch (e) {}

  // Tier 2: Supabase
  try {
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) {
      const filtered = data.filter((b: any) => 
        !deletedSet.has((b.receipt_no || '').toUpperCase().trim()) &&
        !deletedSet.has((b.id || '').toUpperCase().trim())
      );
      localStorage.setItem('dhoot_bookings_inventory', JSON.stringify(filtered));
      return filterByBrand(filtered, brandCode);
    }
  } catch (e) {
    console.warn('DB bookings fetch notice:', e);
  }

  const cached = localStorage.getItem('dhoot_bookings_inventory');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((b: any) => 
          !deletedSet.has((b.receipt_no || '').toUpperCase().trim()) &&
          !deletedSet.has((b.id || '').toUpperCase().trim())
        );
        return filterByBrand(filtered, brandCode);
      }
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

  // Sync to Local DB Server
  try {
    await fetch(getLocalDbEndpoint('bookings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {}

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

  // 2. Sync to Local DB Server
  try {
    await fetch(`${getLocalDbEndpoint('bookings')}?receipt_no=eq.${receiptNo}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allocated_vin_no: vin, status: 'ALLOCATED' }),
      signal: AbortSignal.timeout(2000)
    });

    await fetch(`${getLocalDbEndpoint('vehicles')}?vin=eq.${vin}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ALLOCATED', customer_name: customerName }),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {}

  let dbSynced = false;
  try {
    // 3. Update Booking in Supabase
    const { error: bErr } = await supabase.from('bookings').update({
      allocated_vin_no: vin,
      status: 'ALLOCATED',
      allotment_date: new Date().toISOString()
    }).or(`id.eq.${bookingId},receipt_no.eq.${receiptNo}`);
    if (bErr) throw bErr;

    // 4. Update Vehicle Status in Supabase
    const { error: vErr } = await supabase.from('vehicles').update({
      status: 'ALLOCATED',
      customer_name: customerName,
      allocation_date: new Date().toISOString().split('T')[0]
    }).eq('vin', vin);
    if (vErr) throw vErr;

    dbSynced = true;
  } catch (e: any) {
    console.warn('Live VIN allocation DB notice:', e);
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
  saveStockInventory(updatedVehicles);

  window.dispatchEvent(new Event('bookings-updated'));
  window.dispatchEvent(new Event('stock-updated'));
  return true;
};

export const deleteBookingRecord = async (receiptNoOrId: string): Promise<boolean> => {
  if (!receiptNoOrId) return false;
  const cleanKey = receiptNoOrId.toUpperCase().trim();

  // 1. Identify if this booking had an allocated VIN so we can free the vehicle
  let allocatedVin: string | undefined;
  try {
    const cached = localStorage.getItem('dhoot_bookings_inventory');
    if (cached) {
      const parsed: BookingRecord[] = JSON.parse(cached);
      const target = parsed.find(b => 
        (b.receipt_no || '').toUpperCase().trim() === cleanKey || 
        (b.id || '').toUpperCase().trim() === cleanKey
      );
      if (target?.allocated_vin_no) {
        allocatedVin = target.allocated_vin_no;
      }
    }
  } catch (e) {}

  // 2. Delete from local storage and record tombstone
  deleteBookingFromStorage(cleanKey);

  // 3. Sync deletion to Local DB Server
  try {
    await fetch(`${getLocalDbEndpoint('bookings')}?or=(receipt_no.eq.${encodeURIComponent(cleanKey)},id.eq.${encodeURIComponent(cleanKey)})`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000)
    });
  } catch (e) {
    console.warn('Local DB booking delete note:', e);
  }

  // 4. Sync deletion to Supabase
  try {
    await supabase.from('bookings').delete().or(`receipt_no.eq.${cleanKey},id.eq.${cleanKey}`);
  } catch (e) {
    console.warn('Supabase booking delete note:', e);
  }

  // 5. If booking had an allocated VIN, automatically release the vehicle back to Free Stock
  if (allocatedVin) {
    try {
      const vehicles = getAllVehicles();
      const vIdx = vehicles.findIndex(v => v.vin.toUpperCase().trim() === allocatedVin!.toUpperCase().trim());
      if (vIdx >= 0) {
        vehicles[vIdx] = {
          ...vehicles[vIdx],
          status: 'NEW CAR',
          vehicle_status: 'Free Stock',
          customer_name: '',
          sales_consultant: '',
          allocation_date: undefined
        };
        saveStockInventory(vehicles);
      }

      // Sync vehicle release to Local DB Server
      await fetch(`${getLocalDbEndpoint('vehicles')}?vin=eq.${encodeURIComponent(allocatedVin)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'NEW CAR',
          vehicle_status: 'Free Stock',
          customer_name: null,
          sales_consultant: null,
          allocation_date: null
        }),
        signal: AbortSignal.timeout(2000)
      });

      // Sync vehicle release to Supabase
      await supabase.from('vehicles').update({
        status: 'NEW CAR',
        vehicle_status: 'Free Stock',
        customer_name: null,
        sales_consultant: null,
        allocation_date: null
      }).eq('vin', allocatedVin);

      window.dispatchEvent(new Event('stock-updated'));
    } catch (e) {
      console.warn('Vehicle release upon booking deletion note:', e);
    }
  }

  window.dispatchEvent(new Event('bookings-updated'));
  return true;
};

export const deleteMultipleBookingRecords = async (receiptNosOrIds: string[]): Promise<number> => {
  if (!receiptNosOrIds || receiptNosOrIds.length === 0) return 0;
  const cleanKeys = receiptNosOrIds.map(r => r.toUpperCase().trim()).filter(Boolean);

  // 1. Identify any allocated VINs to release
  const allocatedVins: string[] = [];
  try {
    const cached = localStorage.getItem('dhoot_bookings_inventory');
    if (cached) {
      const parsed: BookingRecord[] = JSON.parse(cached);
      const cleanSet = new Set(cleanKeys);
      parsed.forEach(b => {
        const rNo = (b.receipt_no || '').toUpperCase().trim();
        const bId = (b.id || '').toUpperCase().trim();
        if ((cleanSet.has(rNo) || cleanSet.has(bId)) && b.allocated_vin_no) {
          allocatedVins.push(b.allocated_vin_no);
        }
      });
    }
  } catch (e) {}

  // 2. Delete from storage and update tombstones
  deleteMultipleBookingsFromStorage(cleanKeys);

  // 3. Sync to Local DB Server
  try {
    const receiptParam = `in.(${cleanKeys.join(',')})`;
    await fetch(`${getLocalDbEndpoint('bookings')}?receipt_no=${encodeURIComponent(receiptParam)}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(4000)
    });
  } catch (e) {
    console.warn('Local DB bulk booking delete note:', e);
  }

  // 4. Sync to Supabase
  try {
    await supabase.from('bookings').delete().in('receipt_no', cleanKeys);
  } catch (e) {
    console.warn('Supabase bulk booking delete note:', e);
  }

  // 5. Release any allocated VINs to free stock
  if (allocatedVins.length > 0) {
    try {
      const vinSet = new Set(allocatedVins.map(v => v.toUpperCase().trim()));
      const vehicles = getAllVehicles();
      const updatedVehicles = vehicles.map(v => {
        if (vinSet.has(v.vin.toUpperCase().trim())) {
          return {
            ...v,
            status: 'NEW CAR',
            vehicle_status: 'Free Stock',
            customer_name: '',
            sales_consultant: '',
            allocation_date: undefined
          };
        }
        return v;
      });
      saveStockInventory(updatedVehicles);

      // Release in Local DB & Supabase
      const vinParam = `in.(${Array.from(vinSet).join(',')})`;
      await fetch(`${getLocalDbEndpoint('vehicles')}?vin=${encodeURIComponent(vinParam)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'NEW CAR',
          vehicle_status: 'Free Stock',
          customer_name: null,
          sales_consultant: null,
          allocation_date: null
        }),
        signal: AbortSignal.timeout(3000)
      });

      await supabase.from('vehicles').update({
        status: 'NEW CAR',
        vehicle_status: 'Free Stock',
        customer_name: null,
        sales_consultant: null,
        allocation_date: null
      }).in('vin', Array.from(vinSet));

      window.dispatchEvent(new Event('stock-updated'));
    } catch (e) {
      console.warn('Vehicle batch release note:', e);
    }
  }

  window.dispatchEvent(new Event('bookings-updated'));
  return cleanKeys.length;
};

export const clearAllBookingsRecords = async (): Promise<boolean> => {
  clearAllBookingsFromStorage();

  try {
    await fetch(getLocalDbEndpoint('bookings'), {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000)
    });
  } catch (e) {}

  try {
    await supabase.from('bookings').delete().neq('receipt_no', '__PERM_NON_EXISTENT__');
  } catch (e) {}

  window.dispatchEvent(new Event('bookings-updated'));
  return true;
};

export const resetBookingsToDefaultRecords = async (): Promise<boolean> => {
  resetBookingsToDefaultInStorage();
  window.dispatchEvent(new Event('bookings-updated'));
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
      yardLocation: v.location || 'Central Stockyard',
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
  // Tier 1: Local Dedicated DB Server
  try {
    const res = await fetch(getLocalDbEndpoint('repair_tickets'), { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const tickets = await res.json();
      if (Array.isArray(tickets) && tickets.length > 0) {
        const mapped = tickets.map((t: any) => ({
          id: t.id,
          vin: t.vin || 'VIN-UNKNOWN',
          brand: t.brand || (t.model?.includes('Hyundai') || t.vin?.startsWith('MAL') ? 'HYUNDAI' : 'TATA'),
          model: t.model || 'Vehicle',
          defectArea: t.area || t.defectArea || 'General',
          area: t.area || t.defectArea || 'General',
          severity: t.severity || 'MAJOR',
          description: t.description || 'Inspection defect requiring rectification',
          technician: t.assigned_to || t.assignedTo || 'Senior Workshop Technician',
          assignedTo: t.assigned_to || t.assignedTo || 'Senior Workshop Technician',
          location: t.location || t.yard || 'Stockyard Workshop',
          status: t.status || 'OPEN',
          actionTaken: t.action_taken || t.actionTaken || '',
          partsUsed: t.parts_used || t.partsUsed || '',
          createdAt: t.created_at || new Date().toISOString()
        }));
        return filterByBrand(mapped, brandCode);
      }
    }
  } catch (e) {}

  // Tier 2: Supabase
  try {
    const { data: tickets, error: ticketErr } = await supabase
      .from('repair_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!ticketErr && Array.isArray(tickets) && tickets.length > 0) {
      const mapped = tickets.map((t: any) => ({
        id: t.id,
        vin: t.vin || 'VIN-UNKNOWN',
        brand: t.brand || (t.model?.includes('Hyundai') || t.vin?.startsWith('MAL') ? 'HYUNDAI' : 'TATA'),
        model: t.model || 'Vehicle',
        defectArea: t.area || t.defectArea || 'General',
        area: t.area || t.defectArea || 'General',
        severity: t.severity || 'MAJOR',
        description: t.description || 'Inspection defect requiring rectification',
        technician: t.assigned_to || t.assignedTo || 'Senior Workshop Technician',
        assignedTo: t.assigned_to || t.assignedTo || 'Senior Workshop Technician',
        location: t.location || t.yard || 'Stockyard Workshop',
        status: t.status || 'OPEN',
        actionTaken: t.action_taken || '',
        partsUsed: t.parts_used || '',
        createdAt: t.created_at || new Date().toISOString()
      }));
      return filterByBrand(mapped, brandCode);
    }
  } catch (e) {}

  return [];
};

export const updateRepairStatus = async (
  ticketId: string, 
  vin: string, 
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED',
  rectificationNotes?: string,
  partsUsed?: string,
  completedBy?: string
): Promise<boolean> => {
  const now = new Date().toISOString();
  const updatePayload: any = {
    status,
    updated_at: now
  };
  if (rectificationNotes) updatePayload.action_taken = rectificationNotes;
  if (partsUsed) updatePayload.parts_used = partsUsed;
  if (completedBy) updatePayload.completed_by = completedBy;

  // 1. Sync to Local DB Server
  try {
    await fetch(`${getLocalDbEndpoint('repair_tickets')}?id=eq.${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
      signal: AbortSignal.timeout(2000)
    });

    if (vin && status === 'COMPLETED') {
      await fetch(`${getLocalDbEndpoint('vehicles')}?vin=eq.${vin}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'QA_PENDING', updated_at: now }),
        signal: AbortSignal.timeout(2000)
      });
    }
  } catch (e) {}

  // 2. Sync to Supabase
  try {
    await supabase.from('repair_tickets').update(updatePayload).eq('id', ticketId);
    if (vin && status === 'COMPLETED') {
      await supabase.from('vehicles').update({ status: 'QA_PENDING' }).eq('vin', vin);
    }
  } catch (e) {}

  // 3. Local inventory cache update
  if (vin && status === 'COMPLETED') {
    const all = getAllVehicles();
    const updated = all.map(v => v.vin === vin ? { ...v, status: 'QA_PENDING' } : v);
    saveStockInventory(updated);
  }

  return true;
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
      location: v.location || 'Central Stockyard',
      inspector: 'Senior PDI Quality Inspector',
      passed: 64,
      failed: 0,
      submittedAt: 'Today, 11:30 AM',
      status: v.status === 'PDI_APPROVED' || v.status === 'DELIVERY_READY' ? 'APPROVED' : 'PENDING',
      certId: v.certificate_no || `CERT-${v.vin.slice(-6)}`
    }));
};

export const approveQaInspection = async (
  vin: string,
  reviewer?: { employeeId?: string; userName?: string; notes?: string }
): Promise<{ success: boolean; certificateNo: string }> => {
  const current = await fetchVehicles();
  const target = current.find(v => v.vin === vin);
  const isHyn = target?.brand?.toLowerCase().includes('hyundai') || vin.startsWith('MAL');
  const brandPrefix = isHyn ? 'HYU' : 'TATA';
  const year = new Date().getFullYear();
  const certSuffix = vin.slice(-6).toUpperCase();
  const certNo = target?.certificate_no || `CERT-${brandPrefix}-${year}-${certSuffix}`;
  const now = new Date().toISOString();
  const reviewerName = reviewer?.userName || 'Kavita Deshmukh (QA Manager)';
  const reviewerEmpId = reviewer?.employeeId || 'QA01';
  const notes = reviewer?.notes || 'QA Sign-off complete. Vehicle certified 100% Delivery Ready.';

  // 1. Optimistic LocalStorage Update
  const updatedVehicles = current.map(v => v.vin === vin ? {
    ...v,
    status: 'DELIVERY_READY',
    certificate_no: certNo,
    qa_approved_at: now,
    qa_approved_by: reviewerName
  } : v);
  saveStockInventory(updatedVehicles);

  // 2. Persist to Local DB Server
  try {
    // A. Update vehicle
    await fetch(`${getLocalDbEndpoint('vehicles')}?vin=eq.${vin}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'DELIVERY_READY',
        certificate_no: certNo,
        qa_approved_at: now,
        qa_approved_by: reviewerName
      }),
      signal: AbortSignal.timeout(2000)
    });

    // B. Insert into pdi_certificates
    await fetch(getLocalDbEndpoint('pdi_certificates'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: crypto.randomUUID ? crypto.randomUUID() : `cert-${Date.now()}`,
        certificate_number: certNo,
        vehicle_id: target?.id || vin,
        vin,
        brand: target?.brand || (isHyn ? 'Hyundai' : 'Tata Motors'),
        model: target?.model || 'Vehicle',
        variant: target?.variant || 'Standard',
        issued_by: reviewerName,
        reviewer_employee_id: reviewerEmpId,
        verification_qr_token: `QR-${certNo}-VERIFIED`,
        issued_at: now,
        status: 'ISSUED'
      }),
      signal: AbortSignal.timeout(2000)
    });

    // C. Insert into qa_reviews
    await fetch(getLocalDbEndpoint('qa_reviews'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: crypto.randomUUID ? crypto.randomUUID() : `qar-${Date.now()}`,
        vehicle_id: target?.id || vin,
        vin,
        decision: 'APPROVED',
        reviewer_id: reviewerEmpId,
        reviewer_name: reviewerName,
        certificate_number: certNo,
        notes,
        created_at: now
      }),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {
    console.warn('Local DB QA approval sync notice:', e);
  }

  // 3. Supabase Cloud Sync (best effort)
  try {
    await supabase.from('vehicles').update({
      status: 'DELIVERY_READY',
      certificate_no: certNo,
      qa_approved_at: now,
      qa_approved_by: reviewerName
    }).eq('vin', vin);

    await supabase.from('pdi_certificates').upsert({
      certificate_number: certNo,
      vehicle_id: target?.id || vin,
      vin,
      issued_by: reviewerName,
      verification_qr_token: `QR-${certNo}-VERIFIED`,
      issued_at: now
    }, { onConflict: 'certificate_number' });

    await supabase.from('qa_reviews').insert({
      vehicle_id: target?.id || vin,
      vin,
      decision: 'APPROVED',
      reviewer_id: reviewerEmpId,
      notes
    });
  } catch (e) {
    console.warn('Supabase QA approval notice:', e);
  }

  return { success: true, certificateNo: certNo };
};

export const fetchCertificates = async (brandCode?: string): Promise<any[]> => {
  // Tier 1: Local Dedicated DB Server
  try {
    const res = await fetch(getLocalDbEndpoint('pdi_certificates'), { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return filterByBrand(data, brandCode);
      }
    }
  } catch (e) {}

  // Tier 2: Supabase
  try {
    const { data, error } = await supabase.from('pdi_certificates').select('*').order('issued_at', { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      return filterByBrand(data, brandCode);
    }
  } catch (e) {}

  return [];
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

export const inwardVehicleGate = async (vin: string, details: { location: string; odometer?: number }): Promise<boolean> => {
  const current = await fetchVehicles();
  const updated = current.map(v => v.vin === vin ? {
    ...v,
    status: 'RECEIVED',
    location: details.location
  } : v);
  saveStockInventory(updated);

  // Sync to Local DB Server
  try {
    await fetch(`${getLocalDbEndpoint('vehicles')}?vin=eq.${vin}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'RECEIVED',
        location: details.location,
        odometer_km: details.odometer || 12
      }),
      signal: AbortSignal.timeout(2000)
    });
  } catch (e) {}

  // Sync to Supabase
  try {
    await supabase.from('vehicles').update({
      status: 'RECEIVED',
      location: details.location,
      odometer_km: details.odometer || 12
    }).eq('vin', vin);
  } catch (e) {}

  return true;
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
