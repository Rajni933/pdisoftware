import { formatDate } from '../utils/dateUtils';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, FileSpreadsheet, X, Loader2, ChevronRight,
  Download, Upload, Trash2, Plus, RefreshCw, Car, CheckCircle2, AlertTriangle,
  Warehouse, Package, User, FileCheck, DoorClosed
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NewVehicleModal } from '../components/vehicles/NewVehicleModal';
import { ExcelStockImporter } from '../components/vehicles/ExcelStockImporter';
import { isTataItem, isHyundaiItem } from '../data/seedData';
import { supabase } from '../lib/supabase';
import { 
  fetchVehicles, saveVehicle, updateVehicleLocation, 
  fetchStockyards, YardItem, StockVehicle 
} from '../services/dataService';
import { Empty } from '../components/ui/primitives';
import { DatabaseConfigModal } from '../components/common/DatabaseConfigModal';
import { Database } from 'lucide-react';

export type { StockVehicle };

// Helper: Calculate Ageing Days from Date of Billing (Purchase Date)
const calculateAgeingDays = (purchaseDate?: string, fallbackDays?: number): number => {
  if (!purchaseDate) return fallbackDays || 0;
  const d = new Date(purchaseDate);
  if (isNaN(d.getTime())) return fallbackDays || 0;
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - d.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Helper: Resolve Location City/Area automatically from Yard Name
const getYardLocation = (yardName?: string, locationFallback?: string): string => {
  if (!yardName && !locationFallback) return '—';
  const val = (yardName || locationFallback || '').toLowerCase().trim();
  if (val.includes('transit')) return 'In Transit';
  if (val.includes('plant') || val.includes('oem')) return 'OEM Plant';
  if (val.includes('basni')) return 'Jodhpur (Basni)';
  if (val.includes('pratap')) return 'Jodhpur (Pratap Nagar)';
  if (val.includes('bhagat')) return 'Jodhpur (Bhagat Ki Kothi)';
  if (val.includes('shantinath')) return 'Jodhpur (Shantinath)';
  if (val.includes('new yard')) return 'Jodhpur';
  if (val.includes('sumerpur')) return 'Sumerpur';
  if (val.includes('pali')) return 'Pali';
  if (val.includes('jalore')) return 'Jalore';
  if (val.includes('balotra')) return 'Balotra';
  if (val.includes('barmer')) return 'Barmer';
  if (val.includes('bhinmal')) return 'Bhinmal';
  if (val.includes('jaisalmer')) return 'Jaisalmer';
  if (val.includes('bilara')) return 'Bilara';
  if (val.includes('pipar')) return 'Pipar';
  return locationFallback || yardName || 'Central Stockyard';
};

export const VehiclesPage: React.FC = () => {
  const { currentBrand } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modelFilter, setModelFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const [selectedStock, setSelectedStock] = useState<StockVehicle | null>(null);

  const [vehicles, setVehicles] = useState<StockVehicle[]>([]);
  const [yardsList, setYardsList] = useState<YardItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to get active yards specifically for a vehicle's brand
  const getYardsForVehicle = (v: StockVehicle): string[] => {
    const isHyn = isHyundaiItem(v);
    const brandMatch = isHyn ? 'Hyundai' : 'Tata Motors';
    const matched = yardsList.filter(y => y.brand === brandMatch || y.brand === 'Shared').map(y => y.name);
    return matched.length > 0 ? matched : ['Central Stockyard', 'Basni Yard', 'Pratap Nagar Yard'];
  };

  const fetchStock = async () => {
    setLoading(true);
    try {
      const [stock, yards] = await Promise.all([
        fetchVehicles(currentBrand.code),
        fetchStockyards(currentBrand.code)
      ]);
      setVehicles(stock);
      setYardsList(yards);
    } catch (e) {
      console.error('Error loading stock inventory:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const brand = currentBrand.code === 'DHOOT-ALL' ? 'ALL' : currentBrand.code;
    setBrandFilter(brand);
    fetchStock();

    const handleStockUpdate = () => {
      fetchVehicles(currentBrand.code).then(setVehicles);
    };

    window.addEventListener('stock-updated', handleStockUpdate);
    return () => window.removeEventListener('stock-updated', handleStockUpdate);
  }, [currentBrand.code]);

  // Instant update of Vehicle Yard from Table Dropdown
  const handleUpdateVehicleYard = async (vin: string, newYard: string) => {
    setVehicles(prev => prev.map(v => v.vin === vin ? { ...v, location: newYard } : v));
    await updateVehicleLocation(vin, newYard);
  };



  // Export 21-Column Stock CSV
  const handleExportStockCSV = () => {
    const headers = [
      'Purchase Date',
      'Model',
      'Variant',
      'Colour',
      'Fuel',
      'FSC Code',
      'Dealer Code',
      'Plant Code',
      'Year',
      'Status',
      'Vin No',
      'Quantity',
      'Location',
      'Customer Name',
      'Sales Consultant',
      'Accessories Amount',
      'Vehicle Status',
      'Delivery Date',
      'Allocation Date',
      'Allocated Days',
      'Received Amount'
    ];

    const rows = vehicles.map(v => [
      v.purchase_date || '',
      v.model || '',
      v.variant || '',
      v.color || '',
      v.fuel_type || '',
      v.fsc_code || '',
      v.dealer_code || '',
      v.plant_code || '',
      v.manufacturing_year || '',
      v.status || '',
      v.vin || '',
      v.quantity || 1,
      v.location || '',
      v.customer_name || '',
      v.sales_consultant || '',
      v.accessories_amount || 0,
      v.vehicle_status || v.status || '',
      v.delivery_date || '',
      v.allocation_date || '',
      v.allocated_days || 0,
      v.received_amount || 0
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dhoot_Stock_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeTone = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('ALLOCAT')) return 'accent';
    if (s.includes('APPROV') || s.includes('CERTIF') || s.includes('DELIVER')) return 'ok';
    if (s.includes('PROG') || s.includes('PENDING') || s.includes('INWARD') || s.includes('RECEIV')) return 'warn';
    if (s.includes('REPAIR') || s.includes('FAIL') || s.includes('HOLD')) return 'danger';
    return 'neutral';
  };

  // Filter vehicles by Brand first
  const brandScopedVehicles = useMemo(() => {
    if (brandFilter === 'DHOOT-TATA') return vehicles.filter(isTataItem);
    if (brandFilter === 'DHOOT-HYUNDAI') return vehicles.filter(isHyundaiItem);
    return vehicles;
  }, [vehicles, brandFilter]);

  // Distinct Models & Yard Locations for Filter Dropdowns
  const uniqueModels = Array.from(new Set(brandScopedVehicles.map(v => v.model).filter(Boolean))).sort();
  const activeYards = yardsList.map(y => y.name);
  const vehicleLocations = brandScopedVehicles.map(v => v.location).filter(Boolean);
  const customYardOptions = ['In Transit', 'In OEM Plant'];
  const uniqueLocations = Array.from(new Set([...customYardOptions, ...activeYards, ...vehicleLocations])).sort();

  const filtered = brandScopedVehicles.filter(v => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      (v.vin || '').toLowerCase().includes(s) ||
      (v.model || '').toLowerCase().includes(s) ||
      (v.customer_name || '').toLowerCase().includes(s) ||
      (v.variant || '').toLowerCase().includes(s) ||
      (v.fsc_code || '').toLowerCase().includes(s) ||
      (v.location || '').toLowerCase().includes(s) ||
      (v.sales_consultant || '').toLowerCase().includes(s);

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter || (v.vehicle_status && v.vehicle_status === statusFilter);
    const matchesModel = modelFilter === 'ALL' || v.model === modelFilter;
    const matchesLocation = locationFilter === 'ALL' || v.location === locationFilter;

    return matchesSearch && matchesStatus && matchesModel && matchesLocation;
  });

  const totalStockCount = brandScopedVehicles.length;
  const unallocatedStockCount = brandScopedVehicles.filter(v => !v.customer_name && v.status !== 'ALLOCATED' && v.status !== 'DELIVERED').length;
  const allocatedStockCount = brandScopedVehicles.filter(v => !!v.customer_name || v.status === 'ALLOCATED').length;
  const pdiCertifiedStockCount = brandScopedVehicles.filter(v => v.status === 'PDI_APPROVED' || v.status === 'DELIVERY_READY').length;
  const inwardPendingCount = brandScopedVehicles.filter(v => v.status === 'YARD_RECEIVING_PENDING' || v.status === 'GATE_INWARD_PENDING' || v.status === 'IN_TRANSIT').length;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto select-none pb-20">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER                                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Warehouse className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink tracking-tight">Stock Inventory Management</h1>
            <p className="text-xs text-ink-3">
              21-Column Dealership Vehicle Ledger • Realtime VIN Tracking &amp; Daily Bulk Import
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {vehicles.length > 0 && (
            <button
              type="button"
              onClick={handleExportStockCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-white hover:bg-slate-50 text-xs font-semibold text-ink shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-ink-3" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-white hover:bg-slate-50 text-xs font-semibold text-ink shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-ink-3" />
            <span>Add Vehicle</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDbModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-white hover:bg-slate-50 text-xs font-semibold text-ink shadow-xs transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-accent" />
            <span>Database Seeder</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Bulk Import Stock</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 5 KPI METRIC SUMMARY CARDS                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* TOTAL VEHICLES */}
        <div className="bg-white rounded-xl border border-blue-100/90 p-4 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">
                TOTAL VEHICLES
              </span>
              <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum mt-0.5">
                {totalStockCount}
              </span>
            </div>
          </div>
          <div className="text-xs text-ink-3">Units in stock database</div>
        </div>

        {/* AVAILABLE FREE */}
        <div className="bg-white rounded-xl border border-emerald-100/90 p-4 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">
                AVAILABLE FREE
              </span>
              <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum mt-0.5">
                {unallocatedStockCount}
              </span>
            </div>
          </div>
          <div className="text-xs text-ink-3">Unallocated free inventory</div>
        </div>

        {/* ALLOCATED */}
        <div className="bg-white rounded-xl border border-purple-100/90 p-4 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">
                ALLOCATED
              </span>
              <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum mt-0.5">
                {allocatedStockCount}
              </span>
            </div>
          </div>
          <div className="text-xs text-ink-3">Booked with customer</div>
        </div>

        {/* PDI CERTIFIED */}
        <div className="bg-white rounded-xl border border-amber-100/90 p-4 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">
                POI CERTIFIED
              </span>
              <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum mt-0.5">
                {pdiCertifiedStockCount}
              </span>
            </div>
          </div>
          <div className="text-xs text-ink-3">Inspection certified</div>
        </div>

        {/* GATE INWARD */}
        <div className="bg-white rounded-xl border border-cyan-100/90 p-4 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
              <DoorClosed className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">
                GATE INWARD
              </span>
              <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum mt-0.5">
                {inwardPendingCount}
              </span>
            </div>
          </div>
          <div className="text-xs text-ink-3">Pending yard receiving</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. VEHICLE STOCK LEDGER CARD & DATA TABLE                                 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-line shadow-xs overflow-hidden flex flex-col">
        {/* Header Bar with Filters */}
        <div className="px-4 py-3 border-b border-line flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-ink">Vehicle Stock Ledger</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              {filtered.length} Units
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative w-44 sm:w-60">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search VIN, model, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-8 pr-2.5 text-xs bg-canvas border border-line rounded-lg text-ink placeholder:text-ink-3 focus:outline-none focus:border-blue-500 font-medium shadow-xs"
              />
            </div>

            {/* Yards & Status Dropdown */}
            {uniqueLocations.length > 0 && (
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-8 text-xs bg-canvas border border-line rounded-lg px-2.5 text-ink focus:outline-none focus:border-blue-500 font-medium cursor-pointer shadow-xs"
              >
                <option value="ALL">All Yards &amp; Status</option>
                {uniqueLocations.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            )}

            {/* Statuses Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 text-xs bg-canvas border border-line rounded-lg px-2.5 text-ink focus:outline-none focus:border-blue-500 font-medium cursor-pointer shadow-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="YARD_RECEIVING_PENDING">Gate Inward Pending</option>
              <option value="RECEIVED">Received in Yard</option>
              <option value="PDI_PENDING">PDI Pending</option>
              <option value="PDI_IN_PROGRESS">PDI In Progress</option>
              <option value="PDI_APPROVED">PDI Approved</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="DELIVERY_READY">Delivery Ready</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-blue-50/40 border-b border-line text-[11px] font-bold uppercase tracking-wider text-blue-900/70 whitespace-nowrap">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">PURCHASE / BILLING DATE</th>
                <th className="py-2.5 px-3">MODEL</th>
                <th className="py-2.5 px-3">VARIANT</th>
                <th className="py-2.5 px-3">COLOUR</th>
                <th className="py-2.5 px-3">FUEL</th>
                <th className="py-2.5 px-3">FSC CODE</th>
                <th className="py-2.5 px-3">DEALER CODE</th>
                <th className="py-2.5 px-3">PLANT CODE</th>
                <th className="py-2.5 px-3">YEAR</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">VIN NO</th>
                <th className="py-2.5 px-3 text-center">QTY</th>
                <th className="py-2.5 px-3">YARD</th>
                <th className="py-2.5 px-3">LOCATION (CITY)</th>
                <th className="py-2.5 px-3 text-center">VEHICLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-xs">
              {loading ? (
                <tr>
                  <td colSpan={16} className="p-4">
                    <div className="space-y-2.5">
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={16} className="p-6">
                    <Empty
                      title={searchTerm || statusFilter !== 'ALL' || modelFilter !== 'ALL' || locationFilter !== 'ALL' ? "No matching vehicles" : "0 Vehicles in Live Database"}
                      hint={searchTerm || statusFilter !== 'ALL' || modelFilter !== 'ALL' || locationFilter !== 'ALL'
                        ? "Try clearing your search keyword or selecting 'All' in the filters."
                        : "Stock inventory has 0 records in Supabase. Import your daily dealership spreadsheet or seed sample master records."}
                      action={
                        <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
                          <button
                            type="button"
                            onClick={() => setIsImportModalOpen(true)}
                            className="btn btn-primary text-xs h-8 px-3.5"
                          >
                            <Upload className="w-3.5 h-3.5 mr-1" /> Bulk Import Stock
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="btn btn-secondary text-xs h-8 px-3.5"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Single Vehicle
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDbModalOpen(true)}
                            className="btn btn-secondary text-xs h-8 px-3.5"
                          >
                            <Database className="w-3.5 h-3.5 mr-1" /> Seed Master Data
                          </button>
                        </div>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((v, idx) => {
                  const vinPrefix = v.vin.length > 5 ? v.vin.slice(0, -5) : '';
                  const vinSuffix = v.vin.length > 5 ? v.vin.slice(-5) : v.vin;

                  return (
                    <tr 
                      key={v.id || idx} 
                      className="hover:bg-slate-50/70 transition-colors bg-white cursor-pointer"
                      onClick={() => setSelectedStock(v)}
                    >
                      <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 font-mono tnum whitespace-nowrap">
                        {formatDate(v.purchase_date)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-ink whitespace-nowrap">
                        {v.model}
                      </td>
                      <td className="py-2.5 px-3 text-ink font-medium whitespace-nowrap">
                        {v.variant || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                        {v.color || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 uppercase font-medium whitespace-nowrap">
                        {v.fuel_type || 'PETROL'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-ink-3 whitespace-nowrap">
                        {v.fsc_code || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-ink-3 whitespace-nowrap">
                        {v.dealer_code || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-ink-3 whitespace-nowrap">
                        {v.plant_code || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 font-mono tnum whitespace-nowrap">
                        {v.manufacturing_year || 2026}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          v.status === 'ALLOCATED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : v.status.includes('APPROV') || v.status.includes('CERTIF')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : v.status.includes('PENDING') || v.status.includes('IN_TRANSIT')
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        <span className="text-ink-3">{vinPrefix}</span>
                        <span className="text-blue-700 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-200 ml-0.5">
                          {vinSuffix}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-ink font-mono tnum whitespace-nowrap">
                        {v.quantity || 1}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const brandYards = getYardsForVehicle(v);
                          return (
                            <select
                              value={v.location || (brandYards[0] || 'Basni Yard')}
                              onChange={(e) => handleUpdateVehicleYard(v.vin, e.target.value)}
                              className="h-7 text-xs font-semibold rounded-lg px-2 bg-canvas border border-line cursor-pointer focus:outline-none focus:border-blue-500 shadow-xs"
                            >
                              <optgroup label="Transit & Plant">
                                <option value="In Transit">In Transit</option>
                                <option value="In OEM Plant">In OEM Plant</option>
                              </optgroup>
                              <optgroup label="Active Brand Stockyards">
                                {brandYards.map(y => (
                                  <option key={y} value={y}>{y}</option>
                                ))}
                              </optgroup>
                            </select>
                          );
                        })()}
                      </td>
                      <td className="py-2.5 px-3 text-ink font-medium whitespace-nowrap">
                        {getYardLocation(v.location)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {v.status === 'YARD_RECEIVING_PENDING' || v.status === 'GATE_INWARD_PENDING' ? (
                          <Link
                            to="/receiving"
                            className="h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-xs whitespace-nowrap"
                          >
                            Receive
                          </Link>
                        ) : v.status === 'PDI_APPROVED' ? (
                          <Link
                            to={`/certificate/${v.id}`}
                            className="h-7 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                          >
                            Certified
                          </Link>
                        ) : (
                          <Link
                            to="/pdi"
                            className="h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Universal Excel Importer */}
      <ExcelStockImporter
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchStock}
      />

      {/* Stock Details Modal */}
      {selectedStock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-pop border border-line overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-line flex items-center justify-between bg-canvas">
              <div>
                <h3 className="font-bold text-ink text-sm">Vehicle Details: {selectedStock.vin}</h3>
                <p className="text-xs text-ink-3 mt-0.5">{selectedStock.model} • {selectedStock.variant} • {selectedStock.color}</p>
              </div>
              <button 
                onClick={() => setSelectedStock(null)}
                className="w-8 h-8 rounded-lg text-ink-3 hover:text-ink hover:bg-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">VIN No</span>
                  <span className="font-mono font-semibold text-ink">{selectedStock.vin}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">Model & Variant</span>
                  <span className="font-medium text-ink">{selectedStock.model} {selectedStock.variant}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">Colour & Fuel</span>
                  <span className="text-ink">{selectedStock.color} • {selectedStock.fuel_type}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">FSC Code</span>
                  <span className="font-mono text-ink">{selectedStock.fsc_code || '—'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">Dealer & Plant</span>
                  <span className="font-mono text-ink">{selectedStock.dealer_code || '—'} / {selectedStock.plant_code || '—'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">Manufacturing Year</span>
                  <span className="text-ink font-mono tnum">{selectedStock.manufacturing_year || '2026'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">Stock Location</span>
                  <span className="text-ink">{selectedStock.location || 'Central Stockyard'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">Customer Name</span>
                  <span className="font-semibold text-ink">{selectedStock.customer_name || 'Unallocated'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">Sales Consultant</span>
                  <span className="text-ink">{selectedStock.sales_consultant || '—'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">Purchase Date</span>
                  <span className="text-ink font-mono tnum">{formatDate(selectedStock.purchase_date)}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">Delivery Date</span>
                  <span className="text-ink font-mono tnum">{formatDate(selectedStock.delivery_date)}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">Allocation Date & Days</span>
                  <span className="text-ink font-mono tnum">{formatDate(selectedStock.allocation_date)} ({selectedStock.allocated_days || 0}d)</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">Accessories Amt</span>
                  <span className="font-semibold text-ink font-mono tnum">₹{(Number(selectedStock.accessories_amount) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">Received Amount</span>
                  <span className="font-semibold text-ink font-mono tnum">₹{(Number(selectedStock.received_amount) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded-lg">
                  <span className="eyebrow block">Vehicle Status</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedStock.vehicle_status || selectedStock.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-line bg-canvas flex items-center justify-end">
              <button
                onClick={() => setSelectedStock(null)}
                className="h-8 px-4 rounded-lg bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Vehicle Modal */}
      <NewVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={async (newVeh) => {
          await saveVehicle({
            ...newVeh,
            fuel_type: newVeh.fuelType || newVeh.fuel_type || 'PETROL',
            purchase_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          });
          fetchStock();
        }}
      />

      {/* Database Connection & Seeder Modal */}
      <DatabaseConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />

    </div>
  );
};
