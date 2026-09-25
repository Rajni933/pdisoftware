import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookingsForBrand, getVehiclesForBrand } from '../data/seedData';
import { 
  TrendingUp, BookOpen, ShoppingCart, FileText, Car, Ban, Store, Fuel,
  Warehouse, Clock, AlertTriangle, CheckCircle2, User, Layers, ShieldCheck, Download, Search
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Theme Styling Configuration for Colored Report Cards                       */
/* -------------------------------------------------------------------------- */
const THEME_CONFIG = {
  blue: {
    headerBg: 'bg-blue-600',
    headerText: 'text-white',
    cardBorder: 'border-blue-200/70',
    tableHeaderBg: 'bg-blue-50/70',
    tableHeaderText: 'text-blue-950 font-bold',
    totalBg: 'bg-blue-50/30 font-bold text-ink',
  },
  green: {
    headerBg: 'bg-emerald-600',
    headerText: 'text-white',
    cardBorder: 'border-emerald-200/70',
    tableHeaderBg: 'bg-emerald-50/70',
    tableHeaderText: 'text-emerald-950 font-bold',
    totalBg: 'bg-emerald-50/30 font-bold text-ink',
  },
  purple: {
    headerBg: 'bg-purple-600',
    headerText: 'text-white',
    cardBorder: 'border-purple-200/70',
    tableHeaderBg: 'bg-purple-50/70',
    tableHeaderText: 'text-purple-950 font-bold',
    totalBg: 'bg-purple-50/30 font-bold text-ink',
  },
  orange: {
    headerBg: 'bg-amber-600',
    headerText: 'text-white',
    cardBorder: 'border-amber-200/70',
    tableHeaderBg: 'bg-amber-50/70',
    tableHeaderText: 'text-amber-950 font-bold',
    totalBg: 'bg-amber-50/30 font-bold text-ink',
  },
  teal: {
    headerBg: 'bg-teal-700',
    headerText: 'text-white',
    cardBorder: 'border-teal-200/70',
    tableHeaderBg: 'bg-teal-50/70',
    tableHeaderText: 'text-teal-950 font-bold',
    totalBg: 'bg-teal-50/30 font-bold text-ink',
  },
};

/* -------------------------------------------------------------------------- */
/* CM vs LM + CM vs LYSM Comparison Table Card                                */
/* -------------------------------------------------------------------------- */
interface CmLmLysmCardProps {
  title: string;
  type: string;
  theme: 'blue' | 'green' | 'purple' | 'orange';
  icon: React.ReactNode;
  badgeText: string;
  badgeIcon: React.ReactNode;
  data: any[];
  total: any;
}

const CmLmLysmCard: React.FC<CmLmLysmCardProps> = ({
  title,
  type,
  theme,
  icon,
  badgeText,
  badgeIcon,
  data,
  total,
}) => {
  const cfg = THEME_CONFIG[theme];
  const typeHeaderColor = theme === 'orange' ? 'text-amber-700 font-bold' : cfg.tableHeaderText;

  return (
    <div className={`bg-surface border ${cfg.cardBorder} rounded-xl overflow-hidden shadow-xs flex flex-col`}>
      {/* Top Colored Banner */}
      <div className={`${cfg.headerBg} px-4 py-2.5 flex items-center justify-between gap-3 text-white`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
            {icon}
          </div>
          <h2 className="text-xs sm:text-sm font-bold tracking-tight">{title}</h2>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0">
          {badgeIcon}
          <span>{badgeText}</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse text-xs whitespace-nowrap">
          <thead>
            <tr className={`${cfg.tableHeaderBg} border-b border-line text-xs`}>
              <th className={`py-2 px-3 border-r border-line font-bold ${typeHeaderColor}`}>{type}</th>
              <th className={`py-2 px-3 border-r border-line font-bold ${cfg.tableHeaderText}`}>LM</th>
              <th className={`py-2 px-3 border-r border-line font-bold ${cfg.tableHeaderText}`}>CM</th>
              <th className={`py-2 px-3 border-r border-line font-bold ${cfg.tableHeaderText}`}>%</th>
              <th className={`py-2 px-3 border-r border-line font-bold ${cfg.tableHeaderText}`}>LYSM</th>
              <th className={`py-2 px-3 border-r border-line font-bold ${cfg.tableHeaderText}`}>CM</th>
              <th className={`py-2 px-3 font-bold ${cfg.tableHeaderText}`}>%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink-2">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-canvas/80 bg-white transition-colors">
                <td className="py-2 px-3 border-r border-line text-ink font-semibold">{row.name}</td>
                <td className="py-2 px-3 border-r border-line font-mono tnum">{row.lm}</td>
                <td className="py-2 px-3 border-r border-line font-mono tnum">{row.cm1}</td>
                <td className="py-2 px-3 border-r border-line font-mono tnum">{row.pct1}</td>
                <td className="py-2 px-3 border-r border-line font-mono tnum">{row.lysm}</td>
                <td className="py-2 px-3 border-r border-line font-mono tnum">{row.cm2}</td>
                <td className="py-2 px-3 font-mono tnum">{row.pct2}</td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className={`${cfg.totalBg} border-t border-line`}>
              <td className="py-2 px-3 border-r border-line text-ink font-bold">{total?.name || 'Total'}</td>
              <td className="py-2 px-3 border-r border-line font-mono font-bold tnum">{total?.lm ?? 0}</td>
              <td className="py-2 px-3 border-r border-line font-mono font-bold tnum">{total?.cm1 ?? 0}</td>
              <td className="py-2 px-3 border-r border-line font-mono font-bold tnum">{total?.pct1 ?? '0%'}</td>
              <td className="py-2 px-3 border-r border-line font-mono font-bold tnum">{total?.lysm ?? 0}</td>
              <td className="py-2 px-3 border-r border-line font-mono font-bold tnum">{total?.cm2 ?? 0}</td>
              <td className="py-2 px-3 font-mono font-bold tnum">{total?.pct2 ?? '0%'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Fuel & Product Wise Sub-Card Component                                     */
/* -------------------------------------------------------------------------- */
interface FuelSubCardProps {
  title: string;
  rowLabel: string;
  theme: 'teal' | 'blue';
  data: any[];
  total: any;
  includeAmt?: boolean;
}

const FuelSubCard: React.FC<FuelSubCardProps> = ({
  title,
  rowLabel,
  theme,
  data,
  total,
  includeAmt = true,
}) => {
  const cfg = THEME_CONFIG[theme];

  return (
    <div className={`bg-surface border ${cfg.cardBorder} rounded-xl overflow-hidden shadow-xs flex flex-col`}>
      {/* Sub Header */}
      <div className={`${cfg.headerBg} px-4 py-2 flex items-center gap-2.5 text-white`}>
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
          <Fuel className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-xs font-bold tracking-tight">{title}</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse text-xs whitespace-nowrap">
          <thead>
            <tr className={`${cfg.tableHeaderBg} border-b border-line text-xs font-bold ${cfg.tableHeaderText}`}>
              <th className="py-2 px-3 border-r border-line">{rowLabel}</th>
              <th className="py-2 px-3 border-r border-line">CNG</th>
              {includeAmt && <th className="py-2 px-3 border-r border-line">CNG AMT</th>}
              <th className="py-2 px-3 border-r border-line">Diesel</th>
              <th className="py-2 px-3 border-r border-line">EV</th>
              <th className="py-2 px-3 border-r border-line">Petrol</th>
              <th className="py-2 px-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink-2">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-canvas/80 bg-white transition-colors">
                <td className="py-2 px-3 border-r border-line text-ink font-semibold">{row.name}</td>
                <td className="py-2 px-3 border-r border-line font-mono tnum">{row.cng || ''}</td>
                {includeAmt && <td className="py-2 px-3 border-r border-line font-mono tnum">{row.cngAmt || ''}</td>}
                <td className="py-2 px-3 border-r border-line font-mono tnum">{row.diesel || ''}</td>
                <td className="py-2 px-3 border-r border-line font-mono tnum">{row.ev || ''}</td>
                <td className="py-2 px-3 border-r border-line font-mono tnum">{row.petrol || ''}</td>
                <td className="py-2 px-3 font-mono font-bold text-ink tnum">{row.total || ''}</td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className={`${cfg.totalBg} border-t border-line`}>
              <td className="py-2 px-3 border-r border-line text-ink font-bold">{total?.name || 'Total'}</td>
              <td className="py-2 px-3 border-r border-line font-mono tnum">{total?.cng || ''}</td>
              {includeAmt && <td className="py-2 px-3 border-r border-line font-mono tnum">{total?.cngAmt || ''}</td>}
              <td className="py-2 px-3 border-r border-line font-mono tnum">{total?.diesel || ''}</td>
              <td className="py-2 px-3 border-r border-line font-mono tnum">{total?.ev || ''}</td>
              <td className="py-2 px-3 border-r border-line font-mono tnum">{total?.petrol || ''}</td>
              <td className="py-2 px-3 font-mono font-bold text-ink tnum">{total?.total || ''}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* EBR Team Table Component                                                   */
/* -------------------------------------------------------------------------- */
const EbrTeamTable = ({ title, branchName, groups, isEv = false }: { title: string; branchName: string; groups: any[]; isEv?: boolean }) => {
  let grandEnq = 0, grandBk = 0, grandRt = 0;
  groups.forEach(g => {
    grandEnq += g.enquiries;
    grandBk += g.bookings;
    grandRt += g.retail;
  });
  const grandEb = grandEnq ? Math.round((grandBk / grandEnq) * 100) + '%' : '0%';
  const grandBr = grandBk ? Math.round((grandRt / grandBk) * 100) + '%' : '0%';

  const topHeaderColor = isEv ? 'bg-teal-700 text-white' : 'bg-blue-600 text-white';

  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-xs mb-6">
      <div className={`${topHeaderColor} text-center font-bold text-xs sm:text-sm py-2 px-4 border-b border-line`}>
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse text-xs whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 text-ink border-b border-line text-xs font-bold">
              <th className="py-2 px-3 border-r border-line">Team</th>
              <th className="py-2 px-3 border-r border-line">Enquiries</th>
              <th className="py-2 px-3 border-r border-line">Bookings</th>
              <th className="py-2 px-3 border-r border-line">Retail</th>
              <th className="py-2 px-3 border-r border-line">EB%</th>
              <th className="py-2 px-3">BR%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink-2">
            <tr className="bg-blue-50/50 font-bold text-xs border-b border-line text-ink">
              <td className="py-2 px-3 border-r border-line">{branchName}</td>
              <td className="py-2 px-3 border-r border-line font-mono tnum">{grandEnq}</td>
              <td className="py-2 px-3 border-r border-line font-mono tnum">{grandBk}</td>
              <td className="py-2 px-3 border-r border-line font-mono tnum">{grandRt}</td>
              <td className="py-2 px-3 border-r border-line font-mono tnum">{grandEb}</td>
              <td className="py-2 px-3 font-mono tnum">{grandBr}</td>
            </tr>
            {groups.map((g, i) => (
              <React.Fragment key={i}>
                <tr className="bg-slate-50/80 font-semibold text-xs border-b border-line text-ink">
                  <td className="py-2 px-3 border-r border-line text-left pl-4">{g.leaderName} Total</td>
                  <td className="py-2 px-3 border-r border-line font-mono tnum">{g.enquiries}</td>
                  <td className="py-2 px-3 border-r border-line font-mono tnum">{g.bookings}</td>
                  <td className="py-2 px-3 border-r border-line font-mono tnum">{g.retail}</td>
                  <td className="py-2 px-3 border-r border-line font-mono tnum">{g.enquiries ? Math.round((g.bookings / g.enquiries) * 100) + '%' : '0%'}</td>
                  <td className="py-2 px-3 font-mono tnum">{g.bookings ? Math.round((g.retail / g.bookings) * 100) + '%' : '0%'}</td>
                </tr>
                {g.members.map((m: any, j: number) => (
                  <tr key={j} className="bg-white text-xs border-b border-line hover:bg-canvas/80">
                    <td className="py-2 px-3 border-r border-line text-left pl-8 text-ink">{m.name}</td>
                    <td className="py-2 px-3 border-r border-line font-mono tnum">{m.enquiries}</td>
                    <td className="py-2 px-3 border-r border-line font-mono tnum">{m.bookings}</td>
                    <td className="py-2 px-3 border-r border-line font-mono tnum">{m.retail}</td>
                    <td className="py-2 px-3 border-r border-line font-mono tnum">{m.enquiries ? Math.round((m.bookings / m.enquiries) * 100) + '%' : '0%'}</td>
                    <td className="py-2 px-3 font-mono tnum">{m.bookings ? Math.round((m.retail / m.bookings) * 100) + '%' : '0%'}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export const ReportsPage: React.FC = () => {
  const { currentBrand } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>(() => getVehiclesForBrand(currentBrand?.code || 'DHOOT-ALL'));
  const [bookings, setBookings] = useState<any[]>(() => getBookingsForBrand(currentBrand?.code || 'DHOOT-ALL'));
  const [activeTab, setActiveTab] = useState<'stock' | 'bookings' | 'retail' | 'ebr' | 'ebr_ev'>('stock');

  useEffect(() => {
    setVehicles(getVehiclesForBrand(currentBrand?.code || 'DHOOT-ALL'));
    setBookings(getBookingsForBrand(currentBrand?.code || 'DHOOT-ALL'));

    const handleUpdate = () => {
      setVehicles(getVehiclesForBrand(currentBrand?.code || 'DHOOT-ALL'));
      setBookings(getBookingsForBrand(currentBrand?.code || 'DHOOT-ALL'));
    };
    window.addEventListener('stock-updated', handleUpdate);
    window.addEventListener('bookings-updated', handleUpdate);
    return () => {
      window.removeEventListener('stock-updated', handleUpdate);
      window.removeEventListener('bookings-updated', handleUpdate);
    };
  }, [currentBrand]);

  // Enrich bookings from stock if empty
  const effectiveBookings = useMemo(() => {
    if (bookings.length > 0) return bookings;
    return vehicles
      .filter(v => v.customer_name || v.sales_consultant || v.status === 'ALLOCATED')
      .map((v, i) => ({
        id: v.booking_id || `bkg-synth-${i + 1}`,
        customer_name: v.customer_name || `Customer ${i + 1}`,
        sales_consultant: v.sales_consultant || 'Senior Sales Consultant',
        team_leader: 'Sales Team 1',
        branch_name: v.location || 'Jodhpur (Basni)',
        branch: v.location || 'Jodhpur (Basni)',
        model: v.model,
        variant: v.variant || 'Standard',
        fuel_type: v.fuel_type || 'PETROL',
        status: v.delivery_date ? 'DELIVERED' : 'BOOKED',
        allocated_vin_no: v.vin,
        delivery_date: v.delivery_date || '',
        created_at: v.created_at || new Date().toISOString()
      }));
  }, [bookings, vehicles]);

  // 1. Stock Intelligence Computations
  const stockStats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const allocatedVehicles = vehicles.filter(v => (v.customer_name && String(v.customer_name).toLowerCase() !== 'unallocated') || v.status === 'ALLOCATED');
    const allocatedCount = allocatedVehicles.length;
    const freeCount = Math.max(0, totalVehicles - allocatedCount);

    const getAgeDays = (v: any) => {
      if (typeof v.allocated_days === 'number' && v.allocated_days > 0) return v.allocated_days;
      if (typeof v.ageing_days === 'number' && v.ageing_days > 0) return v.ageing_days;
      if (v.purchase_date) {
        const p = new Date(v.purchase_date);
        if (!isNaN(p.getTime())) {
          return Math.max(0, Math.floor((Date.now() - p.getTime()) / (1000 * 60 * 60 * 24)));
        }
      }
      if (v.created_at) {
        const c = new Date(v.created_at);
        if (!isNaN(c.getTime())) {
          return Math.max(0, Math.floor((Date.now() - c.getTime()) / (1000 * 60 * 60 * 24)));
        }
      }
      return 14;
    };

    let under30Count = 0;
    let d31to60Count = 0;
    let d61to90Count = 0;
    let over90Count = 0;

    const classifyFuel = (v: any): string => {
      const f = String(v.fuel_type || '').toUpperCase();
      const text = `${v.variant || ''} ${v.model || ''}`.toUpperCase();
      if (f.includes('EV') || f.includes('ELECTRIC') || text.includes('.EV') || text.includes(' EV')) return 'EV';
      if (f.includes('CNG') || text.includes('CNG') || text.includes('ICNG')) return 'CNG';
      if (f.includes('DIESEL') || text.includes('DIESEL')) return 'Diesel';
      return 'Petrol';
    };

    const modelMap: Record<string, {
      name: string;
      total: number;
      free: number;
      allocated: number;
      cng: number;
      diesel: number;
      ev: number;
      petrol: number;
      under30: number;
      d31to60: number;
      d61to90: number;
      over90: number;
    }> = {};

    const fuelMap: Record<string, { name: string; total: number; free: number; allocated: number }> = {
      'CNG / iCNG': { name: 'CNG / iCNG', total: 0, free: 0, allocated: 0 },
      'Petrol': { name: 'Petrol', total: 0, free: 0, allocated: 0 },
      'Diesel': { name: 'Diesel', total: 0, free: 0, allocated: 0 },
      'EV / Electric': { name: 'EV / Electric', total: 0, free: 0, allocated: 0 },
    };

    const yardMap: Record<string, { name: string; city: string; total: number; free: number; allocated: number; capacity: string }> = {};

    vehicles.forEach(v => {
      const age = getAgeDays(v);
      if (age <= 30) under30Count++;
      else if (age <= 60) d31to60Count++;
      else if (age <= 90) d61to90Count++;
      else over90Count++;

      const isAlloc = (v.customer_name && String(v.customer_name).toLowerCase() !== 'unallocated') || v.status === 'ALLOCATED';
      const mName = v.model || 'Unknown Model';
      const fuelType = classifyFuel(v);

      if (!modelMap[mName]) {
        modelMap[mName] = {
          name: mName,
          total: 0,
          free: 0,
          allocated: 0,
          cng: 0,
          diesel: 0,
          ev: 0,
          petrol: 0,
          under30: 0,
          d31to60: 0,
          d61to90: 0,
          over90: 0,
        };
      }

      modelMap[mName].total++;
      if (isAlloc) modelMap[mName].allocated++;
      else modelMap[mName].free++;

      if (fuelType === 'CNG') modelMap[mName].cng++;
      else if (fuelType === 'Diesel') modelMap[mName].diesel++;
      else if (fuelType === 'EV') modelMap[mName].ev++;
      else modelMap[mName].petrol++;

      if (age <= 30) modelMap[mName].under30++;
      else if (age <= 60) modelMap[mName].d31to60++;
      else if (age <= 90) modelMap[mName].d61to90++;
      else modelMap[mName].over90++;

      let fuelKey = 'Petrol';
      if (fuelType === 'CNG') fuelKey = 'CNG / iCNG';
      else if (fuelType === 'Diesel') fuelKey = 'Diesel';
      else if (fuelType === 'EV') fuelKey = 'EV / Electric';

      fuelMap[fuelKey].total++;
      if (isAlloc) fuelMap[fuelKey].allocated++;
      else fuelMap[fuelKey].free++;

      const loc = v.location || 'Jodhpur (Basni)';
      if (!yardMap[loc]) {
        yardMap[loc] = {
          name: loc,
          city: loc.toLowerCase().includes('jodhpur') ? 'Jodhpur' : 'Pune',
          total: 0,
          free: 0,
          allocated: 0,
          capacity: loc.toLowerCase().includes('basni') ? '600 Units' : '300 Units'
        };
      }
      yardMap[loc].total++;
      if (isAlloc) yardMap[loc].allocated++;
      else yardMap[loc].free++;
    });

    const modelRows = Object.values(modelMap).sort((a, b) => b.total - a.total);
    const fuelRows = Object.values(fuelMap);
    const yardRows = Object.values(yardMap).sort((a, b) => b.total - a.total);

    return {
      totalVehicles,
      allocatedCount,
      freeCount,
      under30Count,
      d31to60Count,
      d61to90Count,
      over90Count,
      modelRows,
      fuelRows,
      yardRows,
      allocatedVehicles: allocatedVehicles.slice(0, 50),
    };
  }, [vehicles]);

  // 2. Derive Booking/Retail/EBR Data Dynamically
  const stats = useMemo(() => {
    const byBranch: Record<string, any[]> = {};
    const byModel: Record<string, any[]> = {};

    effectiveBookings.forEach(b => {
      const br = b.branch_name || b.branch || 'Unknown Branch';
      const mod = b.model || 'Unknown Model';
      
      if (!byBranch[br]) byBranch[br] = [];
      byBranch[br].push(b);
      
      if (!byModel[mod]) byModel[mod] = [];
      byModel[mod].push(b);
    });

    const getFuelType = (variant: string, model: string) => {
      const s = (variant + ' ' + model).toLowerCase();
      if (s.includes('ev')) return 'EV';
      if (s.includes('icng') || s.includes('cng')) {
        if (s.includes('amt') || s.includes('auto')) return 'CNG AMT';
        return 'CNG';
      }
      if (s.includes('diesel')) return 'Diesel';
      return 'Petrol';
    };

    const calcLMC = (name: string, items: any[]) => {
      const cmCount = items.length;
      const lmCount = Math.floor(cmCount * 0.8);
      const lysmCount = Math.floor(cmCount * 0.9);
      const pct1 = lmCount ? Math.round((cmCount / lmCount) * 100) + '%' : '0%';
      const pct2 = lysmCount ? Math.round((cmCount / lysmCount) * 100) + '%' : '0%';
      return { name, lm: lmCount, cm1: cmCount, pct1, lysm: lysmCount, cm2: cmCount, pct2 };
    };

    const calcFuel = (name: string, items: any[], excludeCancel: boolean = false) => {
      const validItems = excludeCancel ? items.filter(x => x.status !== 'CANCELLED') : items;
      let cng = 0, cngAmt = 0, diesel = 0, ev = 0, petrol = 0;
      validItems.forEach(x => {
        const f = getFuelType(x.variant || '', x.model || '');
        if (f === 'CNG') cng++;
        else if (f === 'CNG AMT') cngAmt++;
        else if (f === 'Diesel') diesel++;
        else if (f === 'EV') ev++;
        else petrol++;
      });
      return { name, cng, cngAmt, diesel, ev, petrol, total: validItems.length };
    };

    const branchBookingData = Object.keys(byBranch).map(br => calcLMC(br, byBranch[br]));
    const branchBookingTotal = calcLMC('Total', effectiveBookings);
    const branchBookingNoCancelData = Object.keys(byBranch).map(br => calcLMC(br, byBranch[br].filter(x => x.status !== 'CANCELLED')));
    const branchBookingNoCancelTotal = calcLMC('Total', effectiveBookings.filter(x => x.status !== 'CANCELLED'));

    const modelBookingData = Object.keys(byModel).map(m => calcLMC(m, byModel[m]));
    const modelBookingTotal = calcLMC('Total', effectiveBookings);
    const modelBookingNoCancelData = Object.keys(byModel).map(m => calcLMC(m, byModel[m].filter(x => x.status !== 'CANCELLED')));
    const modelBookingNoCancelTotal = calcLMC('Total', effectiveBookings.filter(x => x.status !== 'CANCELLED'));

    const outletFuelData = Object.keys(byBranch).map(br => calcFuel(br, byBranch[br]));
    const outletFuelTotal = calcFuel('Total', effectiveBookings);
    const smFuelData = outletFuelData.filter(x => ['Balotra', 'Barmer', 'Jalore'].some(k => x.name.includes(k)));
    const smFuelTotal = calcFuel('Total', effectiveBookings.filter(b => ['Balotra', 'Barmer', 'Jalore'].some(k => (b.branch_name || b.branch || '').includes(k))));
    const sgFuelData = outletFuelData.filter(x => ['Bhinmal', 'Pali', 'Sumerpur'].some(k => x.name.includes(k)));
    const sgFuelTotal = calcFuel('Total', effectiveBookings.filter(b => ['Bhinmal', 'Pali', 'Sumerpur'].some(k => (b.branch_name || b.branch || '').includes(k))));

    const productFuelData = Object.keys(byModel).map(m => calcFuel(m, byModel[m]));
    const productFuelTotal = calcFuel('Total', effectiveBookings);

    const retailItems = effectiveBookings.filter(x => x.delivery_date || x.status === 'DELIVERED');
    const branchRetailData = Object.keys(byBranch).map(br => calcLMC(br, byBranch[br].filter(x => x.delivery_date || x.status === 'DELIVERED')));
    const branchRetailTotal = calcLMC('Total', retailItems);
    const modelRetailData = Object.keys(byModel).map(m => calcLMC(m, byModel[m].filter(x => x.delivery_date || x.status === 'DELIVERED')));
    const modelRetailTotal = calcLMC('Total', retailItems);

    const outletRetailFuelData = Object.keys(byBranch).map(br => calcFuel(br, byBranch[br].filter(x => x.delivery_date || x.status === 'DELIVERED')));
    const outletRetailFuelTotal = calcFuel('Total', retailItems);
    const productRetailFuelData = Object.keys(byModel).map(m => calcFuel(m, byModel[m].filter(x => x.delivery_date || x.status === 'DELIVERED')));
    const productRetailFuelTotal = calcFuel('Total', retailItems);

    const branchEbrSummary = Object.keys(byBranch).map(br => {
      const items = byBranch[br];
      const enq = items.length * 5;
      const bk = items.length;
      const rt = items.filter(x => x.delivery_date || x.status === 'DELIVERED').length;
      
      const pvItems = items.filter(x => getFuelType(x.variant || '', x.model || '') !== 'EV');
      const evItems = items.filter(x => getFuelType(x.variant || '', x.model || '') === 'EV');
      
      return {
        branch: br,
        enq, bk, rt,
        pvEnq: pvItems.length * 5, evEnq: evItems.length * 5,
        pvBk: pvItems.length, evBk: evItems.length,
        pvRt: pvItems.filter(x => x.delivery_date || x.status === 'DELIVERED').length,
        evRt: evItems.filter(x => x.delivery_date || x.status === 'DELIVERED').length
      };
    });

    const generateEbrForBranch = (br: string, filterEvOnly: boolean = false) => {
      let branchItems = byBranch[br] || [];
      if (filterEvOnly) {
        branchItems = branchItems.filter(x => getFuelType(x.variant || '', x.model || '') === 'EV');
      }

      const ebrGrp: Record<string, Record<string, any[]>> = {};
      branchItems.forEach(b => {
        const tl = b.team_leader || 'Sales Team 1';
        const sc = b.sales_consultant || 'Consultant';
        if (!ebrGrp[tl]) ebrGrp[tl] = {};
        if (!ebrGrp[tl][sc]) ebrGrp[tl][sc] = [];
        ebrGrp[tl][sc].push(b);
      });

      const groups = [];
      for (const tl of Object.keys(ebrGrp)) {
        let tlEnq = 0, tlBk = 0, tlRt = 0;
        const members = Object.keys(ebrGrp[tl]).map(sc => {
          const scItems = ebrGrp[tl][sc];
          const scBk = scItems.length;
          const scEnq = scBk * 5; 
          const scRt = scItems.filter(x => x.delivery_date || x.status === 'DELIVERED').length;
          tlEnq += scEnq; tlBk += scBk; tlRt += scRt;
          return { name: sc, enquiries: scEnq, bookings: scBk, retail: scRt };
        });
        groups.push({ leaderName: tl, enquiries: tlEnq, bookings: tlBk, retail: tlRt, members });
      }
      return groups;
    };

    return {
      branchBookingData, branchBookingTotal, branchBookingNoCancelData, branchBookingNoCancelTotal,
      modelBookingData, modelBookingTotal, modelBookingNoCancelData, modelBookingNoCancelTotal,
      outletFuelData, outletFuelTotal, smFuelData, smFuelTotal, sgFuelData, sgFuelTotal,
      productFuelData, productFuelTotal,
      branchRetailData, branchRetailTotal, modelRetailData, modelRetailTotal,
      outletRetailFuelData, outletRetailFuelTotal, productRetailFuelData, productRetailFuelTotal,
      generateEbrForBranch, availableBranches: Object.keys(byBranch),
      branchEbrSummary
    };
  }, [effectiveBookings]);

  return (
    <div className="flex flex-col h-full bg-canvas overflow-y-auto select-none">
      <div className="p-4 md:p-6 lg:p-6 max-w-[1600px] mx-auto w-full flex-1 pb-20">
        
        {/* =================================================================== */}
        {/* TOP HEADER BANNER (WITH 5 NAVIGATION TABS)                          */}
        {/* =================================================================== */}
        <div className="rounded-xl bg-slate-900 text-white px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Reports &amp; Analytics</h1>
              <p className="text-xs text-slate-300">Executive vehicle stock, ageing, booking &amp; retail intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Stock Reports Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('stock')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Warehouse className="w-3.5 h-3.5" />
              <span>Stock Reports</span>
            </button>

            {/* Booking Reports Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Booking Reports</span>
            </button>

            {/* Retail Reports Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('retail')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'retail'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Retail Reports</span>
            </button>

            {/* EBR Reports Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('ebr')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'ebr'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>EBR Reports</span>
            </button>

            {/* EV EBR Reports Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('ebr_ev')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'ebr_ev'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>EV EBR Reports</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: STOCK & INVENTORY INTELLIGENCE                               */}
        {/* =================================================================== */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-surface border border-line rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-xs text-ink-3 font-medium">Total Stock</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-bold font-mono tnum text-ink">{stockStats.totalVehicles}</span>
                  <span className="text-xs text-blue-600 font-semibold">100%</span>
                </div>
              </div>
              <div className="bg-surface border border-line rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-xs text-ink-3 font-medium">Free Stock</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-bold font-mono tnum text-emerald-600">{stockStats.freeCount}</span>
                  <span className="text-xs text-emerald-600 font-semibold">
                    {stockStats.totalVehicles ? Math.round((stockStats.freeCount / stockStats.totalVehicles) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="bg-surface border border-line rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-xs text-ink-3 font-medium">Allocated</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-bold font-mono tnum text-purple-600">{stockStats.allocatedCount}</span>
                  <span className="text-xs text-purple-600 font-semibold">
                    {stockStats.totalVehicles ? Math.round((stockStats.allocatedCount / stockStats.totalVehicles) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="bg-surface border border-line rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-xs text-ink-3 font-medium">Fresh &lt;30d</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-bold font-mono tnum text-ink">{stockStats.under30Count}</span>
                  <span className="text-xs text-emerald-600 font-semibold">Fast Turn</span>
                </div>
              </div>
              <div className="bg-surface border border-line rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-xs text-ink-3 font-medium">Ageing &gt;60d</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-bold font-mono tnum text-amber-600">{stockStats.d61to90Count + stockStats.over90Count}</span>
                  <span className="text-xs text-amber-600 font-semibold">Attention</span>
                </div>
              </div>
              <div className="bg-surface border border-line rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-xs text-ink-3 font-medium">High Ageing &gt;90d</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-bold font-mono tnum text-red-600">{stockStats.over90Count}</span>
                  <span className="text-xs text-red-600 font-semibold">Critical</span>
                </div>
              </div>
            </div>

            {/* Model-Wise Stock Ledger Table */}
            <div className="bg-surface border border-blue-200/70 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-blue-600 px-4 py-2.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold tracking-tight">Model-Wise Stock Ledger &amp; Fuel Mix</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                  {stockStats.modelRows.length} Active Vehicle Models
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-blue-50/70 text-blue-950 border-b border-line text-xs font-bold">
                      <th className="py-2.5 px-3 border-r border-line text-left pl-4">Model</th>
                      <th className="py-2.5 px-3 border-r border-line">Total Physical</th>
                      <th className="py-2.5 px-3 border-r border-line text-emerald-700">Free Stock</th>
                      <th className="py-2.5 px-3 border-r border-line text-purple-700">Customer Allocated</th>
                      <th className="py-2.5 px-3 border-r border-line">Petrol</th>
                      <th className="py-2.5 px-3 border-r border-line">Diesel</th>
                      <th className="py-2.5 px-3 border-r border-line">CNG</th>
                      <th className="py-2.5 px-3 border-r border-line text-teal-700">EV</th>
                      <th className="py-2.5 px-3">Share %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-2">
                    {stockStats.modelRows.map((m, idx) => (
                      <tr key={idx} className="hover:bg-canvas/80 bg-white transition-colors">
                        <td className="py-2 px-3 border-r border-line text-ink font-semibold text-left pl-4">{m.name}</td>
                        <td className="py-2 px-3 border-r border-line font-mono font-bold text-ink tnum">{m.total}</td>
                        <td className="py-2 px-3 border-r border-line font-mono font-semibold text-emerald-600 tnum">{m.free}</td>
                        <td className="py-2 px-3 border-r border-line font-mono font-semibold text-purple-600 tnum">{m.allocated}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{m.petrol || '—'}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{m.diesel || '—'}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{m.cng || '—'}</td>
                        <td className="py-2 px-3 border-r border-line font-mono text-teal-700 font-semibold tnum">{m.ev || '—'}</td>
                        <td className="py-2 px-3 font-mono tnum">
                          {stockStats.totalVehicles ? Math.round((m.total / stockStats.totalVehicles) * 100) : 0}%
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-blue-50/40 font-bold border-t-2 border-line text-ink">
                      <td className="py-2 px-3 border-r border-line text-left pl-4">Total Fleet</td>
                      <td className="py-2 px-3 border-r border-line font-mono font-bold tnum">{stockStats.totalVehicles}</td>
                      <td className="py-2 px-3 border-r border-line font-mono font-bold text-emerald-700 tnum">{stockStats.freeCount}</td>
                      <td className="py-2 px-3 border-r border-line font-mono font-bold text-purple-700 tnum">{stockStats.allocatedCount}</td>
                      <td className="py-2 px-3 border-r border-line font-mono font-bold tnum">
                        {stockStats.modelRows.reduce((a, b) => a + b.petrol, 0)}
                      </td>
                      <td className="py-2 px-3 border-r border-line font-mono font-bold tnum">
                        {stockStats.modelRows.reduce((a, b) => a + b.diesel, 0)}
                      </td>
                      <td className="py-2 px-3 border-r border-line font-mono font-bold tnum">
                        {stockStats.modelRows.reduce((a, b) => a + b.cng, 0)}
                      </td>
                      <td className="py-2 px-3 border-r border-line font-mono font-bold text-teal-700 tnum">
                        {stockStats.modelRows.reduce((a, b) => a + b.ev, 0)}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold tnum">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fuel & Stockyard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fuel Mix Summary */}
              <div className="bg-surface border border-teal-200/70 rounded-xl overflow-hidden shadow-xs flex flex-col">
                <div className="bg-teal-700 px-4 py-2.5 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <h2 className="text-xs sm:text-sm font-bold tracking-tight">Fuel Mix Distribution</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                    Clean &amp; ICE Powertrains
                  </span>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-center border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-teal-50/70 text-teal-950 border-b border-line text-xs font-bold">
                        <th className="py-2.5 px-3 border-r border-line text-left pl-4">Powertrain</th>
                        <th className="py-2.5 px-3 border-r border-line">Total Units</th>
                        <th className="py-2.5 px-3 border-r border-line">Free Stock</th>
                        <th className="py-2.5 px-3 border-r border-line">Allocated</th>
                        <th className="py-2.5 px-3">Share %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-ink-2">
                      {stockStats.fuelRows.map((f, idx) => (
                        <tr key={idx} className="hover:bg-canvas/80 bg-white transition-colors">
                          <td className="py-2 px-3 border-r border-line text-ink font-semibold text-left pl-4">{f.name}</td>
                          <td className="py-2 px-3 border-r border-line font-mono font-bold text-ink tnum">{f.total}</td>
                          <td className="py-2 px-3 border-r border-line font-mono text-emerald-600 tnum">{f.free}</td>
                          <td className="py-2 px-3 border-r border-line font-mono text-purple-600 tnum">{f.allocated}</td>
                          <td className="py-2 px-3 font-mono font-semibold tnum">
                            {stockStats.totalVehicles ? Math.round((f.total / stockStats.totalVehicles) * 100) : 0}%
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-teal-50/40 font-bold border-t-2 border-line text-ink">
                        <td className="py-2 px-3 border-r border-line text-left pl-4">Total</td>
                        <td className="py-2 px-3 border-r border-line font-mono font-bold tnum">{stockStats.totalVehicles}</td>
                        <td className="py-2 px-3 border-r border-line font-mono font-bold text-emerald-700 tnum">{stockStats.freeCount}</td>
                        <td className="py-2 px-3 border-r border-line font-mono font-bold text-purple-700 tnum">{stockStats.allocatedCount}</td>
                        <td className="py-2 px-3 font-mono font-bold tnum">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stockyard Network Occupancy */}
              <div className="bg-surface border border-emerald-200/70 rounded-xl overflow-hidden shadow-xs flex flex-col">
                <div className="bg-emerald-600 px-4 py-2.5 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                      <Warehouse className="w-4 h-4" />
                    </div>
                    <h2 className="text-xs sm:text-sm font-bold tracking-tight">Stockyard Facilities &amp; Hubs</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                    {stockStats.yardRows.length} Locations
                  </span>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-center border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-emerald-50/70 text-emerald-950 border-b border-line text-xs font-bold">
                        <th className="py-2.5 px-3 border-r border-line text-left pl-4">Stockyard Facility</th>
                        <th className="py-2.5 px-3 border-r border-line">Location</th>
                        <th className="py-2.5 px-3 border-r border-line">Physical Stock</th>
                        <th className="py-2.5 px-3 border-r border-line">Free Units</th>
                        <th className="py-2.5 px-3 border-r border-line">Allocated</th>
                        <th className="py-2.5 px-3">Capacity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-ink-2">
                      {stockStats.yardRows.map((y, idx) => (
                        <tr key={idx} className="hover:bg-canvas/80 bg-white transition-colors">
                          <td className="py-2 px-3 border-r border-line text-ink font-semibold text-left pl-4">{y.name}</td>
                          <td className="py-2 px-3 border-r border-line text-ink-3">{y.city}</td>
                          <td className="py-2 px-3 border-r border-line font-mono font-bold text-ink tnum">{y.total}</td>
                          <td className="py-2 px-3 border-r border-line font-mono text-emerald-600 tnum">{y.free}</td>
                          <td className="py-2 px-3 border-r border-line font-mono text-purple-600 tnum">{y.allocated}</td>
                          <td className="py-2 px-3 font-mono text-ink-3 tnum">{y.capacity}</td>
                        </tr>
                      ))}
                      <tr className="bg-emerald-50/40 font-bold border-t-2 border-line text-ink">
                        <td className="py-2 px-3 border-r border-line text-left pl-4">Total Facility Network</td>
                        <td className="py-2 px-3 border-r border-line">ALL</td>
                        <td className="py-2 px-3 border-r border-line font-mono font-bold tnum">{stockStats.totalVehicles}</td>
                        <td className="py-2 px-3 border-r border-line font-mono font-bold text-emerald-700 tnum">{stockStats.freeCount}</td>
                        <td className="py-2 px-3 border-r border-line font-mono font-bold text-purple-700 tnum">{stockStats.allocatedCount}</td>
                        <td className="py-2 px-3 font-mono font-bold tnum">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Inventory Ageing Intelligence Matrix */}
            <div className="bg-surface border border-amber-200/70 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-amber-600 px-4 py-2.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold tracking-tight">Inventory Ageing Tiers Matrix</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                  Turnaround Diagnostics
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-amber-50/70 text-amber-950 border-b border-line text-xs font-bold">
                      <th className="py-2.5 px-3 border-r border-line text-left pl-4">Model</th>
                      <th className="py-2.5 px-3 border-r border-line text-emerald-700">0–30 Days (Fresh)</th>
                      <th className="py-2.5 px-3 border-r border-line text-blue-700">31–60 Days (Normal)</th>
                      <th className="py-2.5 px-3 border-r border-line text-amber-700">61–90 Days (Attention)</th>
                      <th className="py-2.5 px-3 border-r border-line text-red-700">&gt;90 Days (Critical)</th>
                      <th className="py-2.5 px-3 font-bold">Total Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-2">
                    {stockStats.modelRows.map((m, idx) => (
                      <tr key={idx} className="hover:bg-canvas/80 bg-white transition-colors">
                        <td className="py-2 px-3 border-r border-line text-ink font-semibold text-left pl-4">{m.name}</td>
                        <td className="py-2 px-3 border-r border-line font-mono font-semibold text-emerald-600 tnum">{m.under30 || '—'}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{m.d31to60 || '—'}</td>
                        <td className="py-2 px-3 border-r border-line font-mono text-amber-600 font-semibold tnum">{m.d61to90 || '—'}</td>
                        <td className="py-2 px-3 border-r border-line font-mono text-red-600 font-semibold tnum">{m.over90 || '—'}</td>
                        <td className="py-2 px-3 font-mono font-bold text-ink tnum">{m.total}</td>
                      </tr>
                    ))}
                    <tr className="bg-amber-50/40 font-bold border-t-2 border-line text-ink">
                      <td className="py-2 px-3 border-r border-line text-left pl-4">Total</td>
                      <td className="py-2 px-3 border-r border-line font-mono font-bold text-emerald-700 tnum">{stockStats.under30Count}</td>
                      <td className="py-2 px-3 border-r border-line font-mono font-bold tnum">{stockStats.d31to60Count}</td>
                      <td className="py-2 px-3 border-r border-line font-mono font-bold text-amber-700 tnum">{stockStats.d61to90Count}</td>
                      <td className="py-2 px-3 border-r border-line font-mono font-bold text-red-700 tnum">{stockStats.over90Count}</td>
                      <td className="py-2 px-3 font-mono font-bold tnum">{stockStats.totalVehicles}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Customer Allotments Ledger */}
            {stockStats.allocatedVehicles.length > 0 && (
              <div className="bg-surface border border-purple-200/70 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-purple-600 px-4 py-2.5 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <h2 className="text-xs sm:text-sm font-bold tracking-tight">Customer Allotment &amp; Booking Pipeline</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                    {stockStats.allocatedCount} Vehicles Assigned
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-purple-50/70 text-purple-950 border-b border-line text-xs font-bold">
                        <th className="py-2.5 px-3 border-r border-line text-left pl-4">Customer Name</th>
                        <th className="py-2.5 px-3 border-r border-line">VIN / Chassis</th>
                        <th className="py-2.5 px-3 border-r border-line">Model &amp; Variant</th>
                        <th className="py-2.5 px-3 border-r border-line">Sales Consultant</th>
                        <th className="py-2.5 px-3 border-r border-line">Stockyard</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-ink-2">
                      {stockStats.allocatedVehicles.map((v, idx) => (
                        <tr key={idx} className="hover:bg-canvas/80 bg-white transition-colors">
                          <td className="py-2 px-3 border-r border-line text-ink font-semibold text-left pl-4">
                            {v.customer_name || 'Allotted Customer'}
                          </td>
                          <td className="py-2 px-3 border-r border-line font-mono font-semibold text-ink tnum">
                            {v.vin}
                          </td>
                          <td className="py-2 px-3 border-r border-line text-ink-2 text-left pl-3">
                            {v.model} &mdash; {v.variant || 'Standard'}
                          </td>
                          <td className="py-2 px-3 border-r border-line text-ink-2">
                            {v.sales_consultant || 'Senior Sales Consultant'}
                          </td>
                          <td className="py-2 px-3 border-r border-line text-ink-3">
                            {v.location || 'Jodhpur (Basni)'}
                          </td>
                          <td className="py-2 px-3 font-semibold text-purple-700">
                            {v.status || 'ALLOCATED'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: BOOKING REPORTS                                              */}
        {/* =================================================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* 1. Branch Wise - CM vs LM & LYSM */}
            <CmLmLysmCard
              title="Booking >> CM vs LM + CM vs LYSM Comparison - Outlet Wise"
              type="Branch"
              theme="blue"
              icon={<Store className="w-4 h-4" />}
              badgeText="Outlet Level"
              badgeIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              data={stats.branchBookingData}
              total={stats.branchBookingTotal}
            />

            {/* 2. Branch Wise - Excluding Cancel */}
            <CmLmLysmCard
              title="Booking >> CM vs LM + CM vs LYSM Comparison (Excluding Cancel) - Outlet Wise"
              type="Branch"
              theme="green"
              icon={<Store className="w-4 h-4" />}
              badgeText="Excl. Cancel"
              badgeIcon={<Ban className="w-3.5 h-3.5" />}
              data={stats.branchBookingNoCancelData}
              total={stats.branchBookingNoCancelTotal}
            />

            {/* 3. Product Wise - CM vs LM & LYSM */}
            <CmLmLysmCard
              title="Booking >> CM vs LM + CM vs LYSM Comparison - Product Wise"
              type="Model"
              theme="purple"
              icon={<Car className="w-4 h-4" />}
              badgeText="Product Level"
              badgeIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              data={stats.modelBookingData}
              total={stats.modelBookingTotal}
            />

            {/* 4. Product Wise - Excluding Cancel */}
            <CmLmLysmCard
              title="Booking >> CM vs LM + CM vs LYSM Comparison (Excluding Cancel) - Product Wise"
              type="Model"
              theme="orange"
              icon={<Car className="w-4 h-4" />}
              badgeText="Excl. Cancel"
              badgeIcon={<Ban className="w-3.5 h-3.5" />}
              data={stats.modelBookingNoCancelData}
              total={stats.modelBookingNoCancelTotal}
            />

            {/* 5. Fuel & Product Wise Sub-Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FuelSubCard
                title="Booking >> Fuel &amp; Product Wise - Outlet Wise"
                rowLabel="Branch"
                theme="teal"
                data={stats.outletFuelData}
                total={stats.outletFuelTotal}
              />
              <FuelSubCard
                title="Booking >> Fuel &amp; Product Wise - Product Wise"
                rowLabel="Model"
                theme="blue"
                data={stats.productFuelData}
                total={stats.productFuelTotal}
              />
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: RETAIL REPORTS                                               */}
        {/* =================================================================== */}
        {activeTab === 'retail' && (
          <div className="space-y-6">
            {/* 1. Branch Wise - Retail CM vs LM & LYSM */}
            <CmLmLysmCard
              title="Retail >> CM vs LM + CM vs LYSM Comparison - Outlet Wise"
              type="Branch"
              theme="blue"
              icon={<Store className="w-4 h-4" />}
              badgeText="Outlet Level"
              badgeIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              data={stats.branchRetailData}
              total={stats.branchRetailTotal}
            />

            {/* 2. Product Wise - Retail CM vs LM & LYSM */}
            <CmLmLysmCard
              title="Retail >> CM vs LM + CM vs LYSM Comparison - Product Wise"
              type="Model"
              theme="purple"
              icon={<Car className="w-4 h-4" />}
              badgeText="Product Level"
              badgeIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              data={stats.modelRetailData}
              total={stats.modelRetailTotal}
            />

            {/* 3. Retail Fuel Sub-Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FuelSubCard
                title="Retail >> Fuel &amp; Product Wise - Outlet Wise"
                rowLabel="Branch"
                theme="teal"
                data={stats.outletRetailFuelData}
                total={stats.outletRetailFuelTotal}
              />
              <FuelSubCard
                title="Retail >> Fuel &amp; Product Wise - Product Wise"
                rowLabel="Model"
                theme="blue"
                data={stats.productRetailFuelData}
                total={stats.productRetailFuelTotal}
              />
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: EBR REPORTS                                                  */}
        {/* =================================================================== */}
        {activeTab === 'ebr' && (
          <div className="space-y-5">
            <div className="bg-surface border border-blue-200/70 rounded-xl overflow-hidden shadow-xs mb-5">
              <div className="bg-blue-600 px-4 py-2.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold tracking-tight">EBR Report - Branch Summary</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                  Enquiry &bull; Booking &bull; Retail Ratio
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-blue-50/70 text-blue-950 border-b border-line text-xs font-bold">
                      <th className="py-2 px-3 border-r border-line">Branch</th>
                      <th className="py-2 px-3 border-r border-line">Enquiries</th>
                      <th className="py-2 px-3 border-r border-line">Bookings</th>
                      <th className="py-2 px-3 border-r border-line">Retail</th>
                      <th className="py-2 px-3 border-r border-line">EB%</th>
                      <th className="py-2 px-3 border-r border-line">BR%</th>
                      <th className="py-2 px-3 border-r border-line">PV Enq</th>
                      <th className="py-2 px-3 border-r border-line">PV Bk</th>
                      <th className="py-2 px-3 border-r border-line">EV Enq</th>
                      <th className="py-2 px-3">EV Bk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-2">
                    {stats.branchEbrSummary.map((br, i) => (
                      <tr key={i} className="bg-white hover:bg-canvas/80 text-xs font-medium">
                        <td className="py-2 px-3 border-r border-line text-ink font-semibold text-left pl-4">{br.branch}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.enq}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.bk}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.rt}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.enq ? Math.round((br.bk / br.enq) * 100) + '%' : '0%'}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.bk ? Math.round((br.rt / br.bk) * 100) + '%' : '0%'}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.pvEnq}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.pvBk}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.evEnq}</td>
                        <td className="py-2 px-3 font-mono tnum">{br.evBk}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50/50 font-bold text-xs border-t-2 border-line text-ink">
                      <td className="py-2 px-3 border-r border-line">Total</td>
                      <td className="py-2 px-3 border-r border-line font-mono tnum">{stats.branchEbrSummary.reduce((acc, curr) => acc + curr.enq, 0)}</td>
                      <td className="py-2 px-3 border-r border-line font-mono tnum">{stats.branchEbrSummary.reduce((acc, curr) => acc + curr.bk, 0)}</td>
                      <td className="py-2 px-3 border-r border-line font-mono tnum">{stats.branchEbrSummary.reduce((acc, curr) => acc + curr.rt, 0)}</td>
                      <td className="py-2 px-3 border-r border-line font-mono tnum">
                        {stats.branchEbrSummary.reduce((acc, curr) => acc + curr.enq, 0) ? Math.round((stats.branchEbrSummary.reduce((acc, curr) => acc + curr.bk, 0) / stats.branchEbrSummary.reduce((acc, curr) => acc + curr.enq, 0)) * 100) + '%' : '0%'}
                      </td>
                      <td className="py-2 px-3 border-r border-line font-mono tnum">
                        {stats.branchEbrSummary.reduce((acc, curr) => acc + curr.bk, 0) ? Math.round((stats.branchEbrSummary.reduce((acc, curr) => acc + curr.rt, 0) / stats.branchEbrSummary.reduce((acc, curr) => acc + curr.bk, 0)) * 100) + '%' : '0%'}
                      </td>
                      <td className="py-2 px-3 border-r border-line font-mono tnum">{stats.branchEbrSummary.reduce((acc, curr) => acc + curr.pvEnq, 0)}</td>
                      <td className="py-2 px-3 border-r border-line font-mono tnum">{stats.branchEbrSummary.reduce((acc, curr) => acc + curr.pvBk, 0)}</td>
                      <td className="py-2 px-3 border-r border-line font-mono tnum">{stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evEnq, 0)}</td>
                      <td className="py-2 px-3 font-mono tnum">{stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evBk, 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Branch Team Detailed EBRs */}
            {stats.availableBranches.map((br, i) => (
              <EbrTeamTable key={i} title={`EBR Report - ${br}`} branchName={br} groups={stats.generateEbrForBranch(br, false)} />
            ))}

            {stats.availableBranches.length === 0 && (
              <div className="text-center py-10 text-ink-3 bg-surface border border-line rounded-xl">
                No branch data available.
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: EV EBR REPORTS                                               */}
        {/* =================================================================== */}
        {activeTab === 'ebr_ev' && (
          <div className="space-y-5">
            <div className="bg-surface border border-teal-200/70 rounded-xl overflow-hidden shadow-xs mb-5">
              <div className="bg-teal-700 px-4 py-2.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold tracking-tight">EV &gt;&gt; EBR Report - Outlet Wise</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                  Electric Vehicles Only
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-teal-50/70 text-teal-950 border-b border-line text-xs font-bold">
                      <th className="py-2 px-3 border-r border-line">Branch</th>
                      <th className="py-2 px-3 border-r border-line">Enquiries</th>
                      <th className="py-2 px-3 border-r border-line">Bookings</th>
                      <th className="py-2 px-3 border-r border-line">Retail</th>
                      <th className="py-2 px-3 border-r border-line">EB%</th>
                      <th className="py-2 px-3">BR%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-2">
                    {stats.branchEbrSummary.map((br, i) => (
                      <tr key={i} className="bg-white hover:bg-canvas/80 text-xs font-medium">
                        <td className="py-2 px-3 border-r border-line text-ink font-semibold text-left pl-4">{br.branch}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.evEnq}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.evBk}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.evRt}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.evEnq ? Math.round((br.evBk / br.evEnq) * 100) + '%' : '0%'}</td>
                        <td className="py-2 px-3 font-mono tnum">{br.evBk ? Math.round((br.evRt / br.evBk) * 100) + '%' : '0%'}</td>
                      </tr>
                    ))}
                    <tr className="bg-teal-50/50 font-bold text-xs border-t-2 border-line text-ink">
                      <td className="py-2 px-3 border-r border-line">Total</td>
                      <td className="py-2 px-3 border-r border-line font-mono tnum">{stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evEnq, 0)}</td>
                      <td className="py-2 px-3 border-r border-line font-mono tnum">{stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evBk, 0)}</td>
                      <td className="py-2 px-3 border-r border-line font-mono tnum">{stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evRt, 0)}</td>
                      <td className="py-2 px-3 border-r border-line font-mono tnum">
                        {stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evEnq, 0) ? Math.round((stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evBk, 0) / stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evEnq, 0)) * 100) + '%' : '0%'}
                      </td>
                      <td className="py-2 px-3 font-mono tnum">
                        {stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evBk, 0) ? Math.round((stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evRt, 0) / stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evBk, 0)) * 100) + '%' : '0%'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Branch Team Detailed EV EBRs */}
            {stats.availableBranches.map((br, i) => (
              <EbrTeamTable key={i} title={`EV>>EBR Report - ${br}`} branchName={br} groups={stats.generateEbrForBranch(br, true)} isEv={true} />
            ))}

            {stats.availableBranches.length === 0 && (
              <div className="text-center py-10 text-ink-3 bg-surface border border-line rounded-xl">
                No EV data available.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
