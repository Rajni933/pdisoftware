import { supabase } from '../lib/supabase';
import initialStockVehicles from './initialVehicles.json';

export const TATA_ORG_ID = '11111111-1111-1111-1111-111111111111';
export const HYUNDAI_ORG_ID = '11111111-1111-1111-1111-111111111112';

export interface YardItem {
  id: string;
  code: string;
  name: string;
  brand: 'Tata Motors' | 'Hyundai' | 'Shared';
  city: string;
  state: string;
  capacity: string;
  manager: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BranchItem {
  id: string;
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
}

// Master catalogs: empty by default so zero dummy/mock data is displayed unless loaded from database
export const SEED_STOCKYARDS: YardItem[] = [];
export const SEED_BRANCHES: BranchItem[] = [];

// 3. Official Dealership Stock Inventory (Pre-loaded with 543 user vehicles)
export const SEED_STOCK_VEHICLES: any[] = initialStockVehicles;
export const SEED_BOOKINGS: any[] = [];
export const SEED_CHALLANS: any[] = [];

export const getStockyards = (brandCode?: string): YardItem[] => {
  let list = SEED_STOCKYARDS;
  try {
    const saved = localStorage.getItem('autoprime_stockyards');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {}

  if (!brandCode || brandCode === 'DHOOT-ALL' || brandCode === 'ALL') return list;
  if (brandCode === 'DHOOT-TATA' || brandCode.toLowerCase().includes('tata')) {
    return list.filter(y => y.brand === 'Tata Motors' || y.brand === 'Shared');
  }
  if (brandCode === 'DHOOT-HYUNDAI' || brandCode.toLowerCase().includes('hyundai')) {
    return list.filter(y => y.brand === 'Hyundai' || y.brand === 'Shared');
  }
  return list;
};

export const getActiveStockyards = (brandCode?: string): YardItem[] => {
  return getStockyards(brandCode).filter(y => y.status === 'ACTIVE');
};

export const saveStockyards = (yards: YardItem[]) => {
  localStorage.setItem('autoprime_stockyards', JSON.stringify(yards));
  window.dispatchEvent(new Event('stockyards-updated'));
};

export const getBranches = (brandCode?: string): BranchItem[] => {
  let list = SEED_BRANCHES;
  try {
    const saved = localStorage.getItem('autoprime_branches');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {}

  if (!brandCode || brandCode === 'DHOOT-ALL' || brandCode === 'ALL') return list;
  if (brandCode === 'DHOOT-TATA' || brandCode.toLowerCase().includes('tata')) {
    return list.filter(b => b.brand === 'Tata Motors' || b.brand === 'Shared');
  }
  if (brandCode === 'DHOOT-HYUNDAI' || brandCode.toLowerCase().includes('hyundai')) {
    return list.filter(b => b.brand === 'Hyundai' || b.brand === 'Shared');
  }
  return list;
};

export const getActiveBranches = (brandCode?: string): BranchItem[] => {
  return getBranches(brandCode).filter(b => b.status === 'ACTIVE');
};

export const saveBranches = (branches: BranchItem[]) => {
  localStorage.setItem('autoprime_branches', JSON.stringify(branches));
  window.dispatchEvent(new Event('branches-updated'));
};

// ============================================================================
// SMART BRAND CLASSIFICATION ENGINE
// ============================================================================
export const isTataItem = (item: any): boolean => {
  if (!item) return false;
  if (item.organization_id === TATA_ORG_ID) return true;
  if (item.brand && String(item.brand).toLowerCase().includes('tata')) return true;
  
  const vin = String(item.vin || item.allocated_vin_no || item.vin_no || '').toUpperCase().trim();
  if (vin.startsWith('MAT')) return true;

  const m = String(item.model || '').toLowerCase();
  const tataKeywords = ['tata', 'nexon', 'harrier', 'safari', 'curvv', 'punch', 'tiago', 'tigor', 'altroz', 'sierra', 'aeris', 'xpres'];
  return tataKeywords.some(kw => m.includes(kw));
};

export const isHyundaiItem = (item: any): boolean => {
  if (!item) return false;
  if (item.organization_id === HYUNDAI_ORG_ID) return true;
  if (item.brand && String(item.brand).toLowerCase().includes('hyundai')) return true;

  const vin = String(item.vin || item.allocated_vin_no || item.vin_no || '').toUpperCase().trim();
  if (vin.startsWith('MAL')) return true;

  const m = String(item.model || '').toLowerCase();
  const hyundaiKeywords = ['hyundai', 'creta', 'venue', 'verna', 'ioniq', 'exter', 'i20', 'i10', 'tucson', 'alcazar', 'aura', 'grand'];
  return hyundaiKeywords.some(kw => m.includes(kw));
};

// ============================================================================
// STOCK INVENTORY METHODS
// ============================================================================
export const getVehiclesForBrand = (brandCode: string) => {
  let list: any[] = [];
  try {
    const saved = localStorage.getItem('dhoot_stock_inventory');
    if (saved) {
      const parsed: any[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stock from storage:', e);
  }

  if (list.length === 0) {
    list = SEED_STOCK_VEHICLES;
  }

  if (brandCode === 'DHOOT-TATA' || brandCode.toLowerCase().includes('tata')) {
    return list.filter(isTataItem);
  }
  if (brandCode === 'DHOOT-HYUNDAI' || brandCode.toLowerCase().includes('hyundai')) {
    return list.filter(isHyundaiItem);
  }
  return list; // DHOOT-ALL
};

export const saveStockInventory = (vehicles: any[]) => {
  try {
    const sanitized = vehicles.map(v => {
      let copy = { ...v };
      if (copy.paper_pdi_photo && copy.paper_pdi_photo.length > 500) {
        copy.paper_pdi_photo = '[Media Stored / Cloud Reference]';
      }
      if (copy.unloading_video && copy.unloading_video.length > 500) {
        copy.unloading_video = '[Media Stored / Cloud Reference]';
      }
      return copy;
    });
    localStorage.setItem('dhoot_stock_inventory', JSON.stringify(sanitized));
    window.dispatchEvent(new Event('stock-updated'));
  } catch (err) {
    console.warn('LocalStorage saveStockInventory quota safeguard:', err);
  }
};

export const clearStockInventory = () => {
  localStorage.removeItem('dhoot_stock_inventory');
  window.dispatchEvent(new Event('stock-updated'));
};

// ============================================================================
// CUSTOMER BOOKINGS METHODS
// ============================================================================
export const getBookingsForBrand = (brandCode: string) => {
  let list: any[] = [];
  try {
    const saved = localStorage.getItem('dhoot_bookings_inventory');
    if (saved) {
      const parsed: any[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading bookings from storage:', e);
  }

  if (brandCode === 'DHOOT-TATA' || brandCode.toLowerCase().includes('tata')) {
    return list.filter(isTataItem);
  }
  if (brandCode === 'DHOOT-HYUNDAI' || brandCode.toLowerCase().includes('hyundai')) {
    return list.filter(isHyundaiItem);
  }
  return list; // DHOOT-ALL
};

export const saveBookingsInventory = (bookings: any[]) => {
  localStorage.setItem('dhoot_bookings_inventory', JSON.stringify(bookings));
  window.dispatchEvent(new Event('bookings-updated'));
};

export const clearBookingsInventory = () => {
  localStorage.removeItem('dhoot_bookings_inventory');
  window.dispatchEvent(new Event('bookings-updated'));
};

// ============================================================================
// CHALLANS METHODS
// ============================================================================
export const getChallansForBrand = (brandCode?: string) => {
  let list: any[] = [];
  try {
    const saved = localStorage.getItem('dhoot_challans_inventory');
    if (saved) {
      const parsed: any[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading challans from storage:', e);
  }

  if (!brandCode || brandCode === 'DHOOT-ALL' || brandCode === 'ALL') {
    return list;
  }
  if (brandCode === 'DHOOT-TATA' || brandCode.toLowerCase().includes('tata')) {
    const tataList = list.filter(isTataItem);
    return tataList.length > 0 ? tataList : list;
  }
  if (brandCode === 'DHOOT-HYUNDAI' || brandCode.toLowerCase().includes('hyundai')) {
    const hyunList = list.filter(isHyundaiItem);
    return hyunList.length > 0 ? hyunList : list;
  }
  return list;
};

export const saveChallansInventory = (challans: any[]) => {
  localStorage.setItem('dhoot_challans_inventory', JSON.stringify(challans));
  window.dispatchEvent(new Event('challans-updated'));
};

export const clearChallansInventory = () => {
  localStorage.removeItem('dhoot_challans_inventory');
  window.dispatchEvent(new Event('challans-updated'));
};

// ============================================================================
// BIDIRECTIONAL REALTIME CLOUD SYNCHRONIZATION (SUPABASE + WORKER API)
// ============================================================================
export const syncWithSupabase = async () => {
  try {
    const API_BASE = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:8787'
      : 'https://dhoot-group-pdi-api.sunilbishnoi.workers.dev';

    // 1. Fetch Live Bookings from Database
    try {
      const { data: dbBookings } = await supabase.from('bookings').select('*');
      if (dbBookings && Array.isArray(dbBookings)) {
        localStorage.setItem('dhoot_bookings_inventory', JSON.stringify(dbBookings));
        window.dispatchEvent(new Event('bookings-updated'));
      }
    } catch (e) {}

    // 2. Fetch Live Vehicles directly from Supabase
    try {
      const { data: dbVehicles, error: vehErr } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
      if (!vehErr && Array.isArray(dbVehicles)) {
        localStorage.setItem('dhoot_stock_inventory', JSON.stringify(dbVehicles));
        window.dispatchEvent(new Event('stock-updated'));
      } else {
        // Fallback to worker API if present
        const res = await fetch(`${API_BASE}/api/v1/stock`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            localStorage.setItem('dhoot_stock_inventory', JSON.stringify(json.data));
            window.dispatchEvent(new Event('stock-updated'));
          }
        }
      }
    } catch (e) {}

    // 3. Fetch Live Challans from Database
    try {
      const { data: dbChallans } = await supabase.from('challan_invoices').select('*');
      if (dbChallans && Array.isArray(dbChallans)) {
        const normalized = dbChallans.map((c: any) => ({
          ...c,
          mobile: c.mobile || c.mobile_no || '',
          other: c.other || c.other_charges || 0
        }));
        localStorage.setItem('dhoot_challans_inventory', JSON.stringify(normalized));
        window.dispatchEvent(new Event('challans-updated'));
      }
    } catch (e) {}

    // 4. Fetch Stockyards & Branches
    try {
      const { data: dbYards } = await supabase.from('stockyards').select('*');
      if (dbYards && Array.isArray(dbYards) && dbYards.length > 0) {
        localStorage.setItem('autoprime_stockyards', JSON.stringify(dbYards));
        window.dispatchEvent(new Event('stockyards-updated'));
      }
    } catch (e) {}

    try {
      const { data: dbBranches } = await supabase.from('branches').select('*');
      if (dbBranches && Array.isArray(dbBranches) && dbBranches.length > 0) {
        localStorage.setItem('autoprime_branches', JSON.stringify(dbBranches));
        window.dispatchEvent(new Event('branches-updated'));
      }
    } catch (e) {}

    // 5. Fetch Master Vehicle Models
    try {
      const { data: dbModels } = await supabase.from('master_vehicle_models').select('*').order('brand');
      if (dbModels && Array.isArray(dbModels) && dbModels.length > 0) {
        localStorage.setItem('autoprime_models', JSON.stringify(dbModels));
        window.dispatchEvent(new Event('models-updated'));
      }
    } catch (e) {}

    // 6. Fetch Master Financiers
    try {
      const { data: dbFinanciers } = await supabase.from('master_financiers').select('*').order('name');
      if (dbFinanciers && Array.isArray(dbFinanciers) && dbFinanciers.length > 0) {
        localStorage.setItem('autoprime_financiers', JSON.stringify(dbFinanciers));
        window.dispatchEvent(new Event('financiers-updated'));
      }
    } catch (e) {}

    // 7. Fetch Master Insurance Providers
    try {
      const { data: dbInsurance } = await supabase.from('master_insurance_providers').select('*').order('name');
      if (dbInsurance && Array.isArray(dbInsurance) && dbInsurance.length > 0) {
        localStorage.setItem('autoprime_insurance', JSON.stringify(dbInsurance));
        window.dispatchEvent(new Event('insurance-updated'));
      }
    } catch (e) {}

  } catch (e) {
    console.warn('Sync with cloud note:', e);
  }
};

