import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookingsForBrand } from '../data/seedData';
import { 
  TrendingUp, BookOpen, ShoppingCart, FileText, Car, Ban, Store, Fuel 
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
        <div className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shrink-0">
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
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    setBookings(getBookingsForBrand(currentBrand.code || 'DHOOT-ALL'));
  }, [currentBrand]);

  // Derive data dynamically
  const stats = useMemo(() => {
    const byBranch: Record<string, any[]> = {};
    const byModel: Record<string, any[]> = {};

    bookings.forEach(b => {
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
      const pct1 = lmCount ? Math.round((cmCount/lmCount)*100)+'%' : '0%';
      const pct2 = lysmCount ? Math.round((cmCount/lysmCount)*100)+'%' : '0%';
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
    const branchBookingTotal = calcLMC('Total', bookings);
    const branchBookingNoCancelData = Object.keys(byBranch).map(br => calcLMC(br, byBranch[br].filter(x => x.status !== 'CANCELLED')));
    const branchBookingNoCancelTotal = calcLMC('Total', bookings.filter(x => x.status !== 'CANCELLED'));

    const modelBookingData = Object.keys(byModel).map(m => calcLMC(m, byModel[m]));
    const modelBookingTotal = calcLMC('Total', bookings);
    const modelBookingNoCancelData = Object.keys(byModel).map(m => calcLMC(m, byModel[m].filter(x => x.status !== 'CANCELLED')));
    const modelBookingNoCancelTotal = calcLMC('Total', bookings.filter(x => x.status !== 'CANCELLED'));

    const outletFuelData = Object.keys(byBranch).map(br => calcFuel(br, byBranch[br]));
    const outletFuelTotal = calcFuel('Total', bookings);
    const smFuelData = outletFuelData.filter(x => ['Balotra', 'Barmer', 'Jalore'].some(k => x.name.includes(k)));
    const smFuelTotal = calcFuel('Total', bookings.filter(b => ['Balotra', 'Barmer', 'Jalore'].some(k => (b.branch_name || b.branch || '').includes(k))));
    const sgFuelData = outletFuelData.filter(x => ['Bhinmal', 'Pali', 'Sumerpur'].some(k => x.name.includes(k)));
    const sgFuelTotal = calcFuel('Total', bookings.filter(b => ['Bhinmal', 'Pali', 'Sumerpur'].some(k => (b.branch_name || b.branch || '').includes(k))));

    const productFuelData = Object.keys(byModel).map(m => calcFuel(m, byModel[m]));
    const productFuelTotal = calcFuel('Total', bookings);

    const retailItems = bookings.filter(x => x.delivery_date || x.status === 'DELIVERED');
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
      
      const pvItems = items.filter(x => getFuelType(x.variant||'', x.model||'') !== 'EV');
      const evItems = items.filter(x => getFuelType(x.variant||'', x.model||'') === 'EV');
      
      return {
        branch: br,
        enq, bk, rt,
        pvEnq: pvItems.length * 5, evEnq: evItems.length * 5,
        pvBk: pvItems.length, evBk: evItems.length,
        pvRt: pvItems.filter(x => x.delivery_date || x.status === 'DELIVERED').length,
        evRt: evItems.filter(x => x.delivery_date || x.status === 'DELIVERED').length
      };
    });

    // Flexible EBR Generator
    const generateEbrForBranch = (br: string, filterEvOnly: boolean = false) => {
      let branchItems = byBranch[br] || [];
      if (filterEvOnly) {
        branchItems = branchItems.filter(x => getFuelType(x.variant||'', x.model||'') === 'EV');
      }

      const ebrGrp: Record<string, Record<string, any[]>> = {};
      branchItems.forEach(b => {
        const tl = b.team_leader || 'Other';
        const sc = b.sales_consultant || 'Unknown';
        if (!ebrGrp[tl]) ebrGrp[tl] = {};
        if (!ebrGrp[tl][sc]) ebrGrp[tl][sc] = [];
        ebrGrp[tl][sc].push(b);
      });

      const groups = [];
      Object.keys(ebrGrp).forEach(tl => {
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
      });
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
  }, [bookings]);

  return (
    <div className="flex flex-col h-full bg-canvas overflow-y-auto select-none">
      <div className="p-4 md:p-6 lg:p-6 max-w-[1600px] mx-auto w-full flex-1 pb-20">
        
        {/* =================================================================== */}
        {/* 1. TOP HEADER BANNER (DARK NAVY WITH 4 NAVIGATION PILLS)            */}
        {/* =================================================================== */}
        <div className="rounded-xl bg-slate-900 text-white px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Reports</h1>
              <p className="text-xs text-slate-300">View comprehensive business performance reports</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
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
        {/* 2. TAB CONTENT: BOOKING REPORTS                                    */}
        {/* =================================================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-5">
            {/* Row 1: Outlet Wise (Blue) & Model Wise (Green) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <CmLmLysmCard
                title="Booking Report - Outlet Wise (CM Vs LM + CM Vs LYSM)"
                type="Branch"
                theme="blue"
                icon={<Car className="w-4 h-4" />}
                badgeText="Outlet Wise"
                badgeIcon={<Store className="w-3 h-3" />}
                data={stats.branchBookingData}
                total={stats.branchBookingTotal}
              />
              <CmLmLysmCard
                title="Booking Report - Model Wise (CM Vs LM + CM Vs LYSM)"
                type="Model"
                theme="green"
                icon={<Car className="w-4 h-4" />}
                badgeText="Model Wise"
                badgeIcon={<Car className="w-3 h-3" />}
                data={stats.modelBookingData}
                total={stats.modelBookingTotal}
              />
            </div>

            {/* Row 2: Outlet Wise No Cancel (Purple) & Model Wise No Cancel (Orange) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <CmLmLysmCard
                title="Booking Report - Outlet Wise (Excluding Cancellation)"
                type="Branch"
                theme="purple"
                icon={<Ban className="w-4 h-4" />}
                badgeText="Outlet Wise"
                badgeIcon={<Store className="w-3 h-3" />}
                data={stats.branchBookingNoCancelData}
                total={stats.branchBookingNoCancelTotal}
              />
              <CmLmLysmCard
                title="Booking Report - Model Wise (Excluding Cancellation)"
                type="Model"
                theme="orange"
                icon={<Ban className="w-4 h-4" />}
                badgeText="Model Wise"
                badgeIcon={<Car className="w-3 h-3" />}
                data={stats.modelBookingNoCancelData}
                total={stats.modelBookingNoCancelTotal}
              />
            </div>

            {/* Row 3: Fuel & Product Wise Booking Report (Teal Outer Container) */}
            <div className="bg-surface border border-teal-200/70 rounded-xl overflow-hidden shadow-xs">
              {/* Outer Header */}
              <div className="bg-teal-700 px-4 py-2.5 flex items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold tracking-tight">Fuel &amp; Product Wise Booking Report</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Performance Overview</span>
                </div>
              </div>

              {/* Outer Body: 2 Sub-Cards Side by Side */}
              <div className="p-4 bg-canvas/30 grid grid-cols-1 xl:grid-cols-2 gap-4">
                <FuelSubCard
                  title="Outlet Wise & Fuel Wise Booking Report"
                  rowLabel="Branch"
                  theme="teal"
                  data={stats.outletFuelData}
                  total={stats.outletFuelTotal}
                />
                <FuelSubCard
                  title="Model Wise & Fuel Wise Booking Report"
                  rowLabel="Model"
                  theme="blue"
                  data={stats.productFuelData}
                  total={stats.productFuelTotal}
                />
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 3. TAB CONTENT: RETAIL REPORTS                                     */}
        {/* =================================================================== */}
        {activeTab === 'retail' && (
          <div className="space-y-5">
            {/* Row 1: Outlet Wise (Blue) & Model Wise (Green) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <CmLmLysmCard
                title="Retail Report - Outlet Wise (CM Vs LM + CM Vs LYSM)"
                type="Branch"
                theme="blue"
                icon={<Car className="w-4 h-4" />}
                badgeText="Outlet Wise"
                badgeIcon={<Store className="w-3 h-3" />}
                data={stats.branchRetailData}
                total={stats.branchRetailTotal}
              />
              <CmLmLysmCard
                title="Retail Report - Model Wise (CM Vs LM + CM Vs LYSM)"
                type="Model"
                theme="green"
                icon={<Car className="w-4 h-4" />}
                badgeText="Model Wise"
                badgeIcon={<Car className="w-3 h-3" />}
                data={stats.modelRetailData}
                total={stats.modelRetailTotal}
              />
            </div>

            {/* Row 2: Fuel & Product Wise Retail Report */}
            <div className="bg-surface border border-teal-200/70 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-teal-700 px-4 py-2.5 flex items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold tracking-tight">Fuel &amp; Product Wise Retail Report</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Performance Overview</span>
                </div>
              </div>

              <div className="p-4 bg-canvas/30 grid grid-cols-1 xl:grid-cols-2 gap-4">
                <FuelSubCard
                  title="Outlet Wise & Fuel Wise Retail Report"
                  rowLabel="Branch"
                  theme="teal"
                  data={stats.outletRetailFuelData}
                  total={stats.outletRetailFuelTotal}
                  includeAmt={false}
                />
                <FuelSubCard
                  title="Model Wise & Fuel Wise Retail Report"
                  rowLabel="Model"
                  theme="blue"
                  data={stats.productRetailFuelData}
                  total={stats.productRetailFuelTotal}
                  includeAmt={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 4. TAB CONTENT: EBR REPORTS                                        */}
        {/* =================================================================== */}
        {activeTab === 'ebr' && (
          <div className="space-y-5">
            {/* Simple EBR Outlet Wise */}
            <div className="bg-surface border border-blue-200/70 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-blue-600 px-4 py-2.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold tracking-tight">EBR Report - Outlet Wise (Simple)</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold">
                  Summary
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
                      <th className="py-2 px-3">BR%</th>
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
                        <td className="py-2 px-3 font-mono tnum">{br.bk ? Math.round((br.rt / br.bk) * 100) + '%' : '0%'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EBR PV/EV Detail */}
            <div className="bg-surface border border-purple-200/70 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-purple-600 px-4 py-2.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold tracking-tight">EBR Report - Outlet Wise (PV / EV Split)</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold">
                  Detailed Segment
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-purple-50/70 text-purple-950 border-b border-line text-xs font-bold">
                      <th className="py-2 px-3 border-r border-line" rowSpan={2}>Branch</th>
                      <th className="py-2 px-3 border-r border-line" colSpan={3}>Enquiries</th>
                      <th className="py-2 px-3 border-r border-line" colSpan={3}>Bookings</th>
                      <th className="py-2 px-3 border-r border-line" colSpan={3}>Retail</th>
                      <th className="py-2 px-3 border-r border-line" colSpan={2}>EB%</th>
                      <th className="py-2 px-3" colSpan={2}>BR%</th>
                    </tr>
                    <tr className="bg-purple-50/70 text-purple-950 border-b border-line text-xs font-bold">
                      <th className="py-1 px-2 border-r border-line">PV</th>
                      <th className="py-1 px-2 border-r border-line">EV</th>
                      <th className="py-1 px-2 border-r border-line">Total</th>
                      <th className="py-1 px-2 border-r border-line">PV</th>
                      <th className="py-1 px-2 border-r border-line">EV</th>
                      <th className="py-1 px-2 border-r border-line">Total</th>
                      <th className="py-1 px-2 border-r border-line">PV</th>
                      <th className="py-1 px-2 border-r border-line">EV</th>
                      <th className="py-1 px-2 border-r border-line">Total</th>
                      <th className="py-1 px-2 border-r border-line">PV</th>
                      <th className="py-1 px-2 border-r border-line">EV</th>
                      <th className="py-1 px-2 border-r border-line">PV</th>
                      <th className="py-1 px-2">EV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-2">
                    {stats.branchEbrSummary.map((br, i) => (
                      <tr key={i} className="bg-white hover:bg-canvas/80 text-xs font-medium">
                        <td className="py-2 px-3 border-r border-line text-ink font-semibold text-left pl-4">{br.branch}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.pvEnq}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.evEnq}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum font-bold text-ink">{br.enq}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.pvBk}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.evBk}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum font-bold text-ink">{br.bk}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.pvRt}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.evRt}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum font-bold text-ink">{br.rt}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.pvEnq ? Math.round((br.pvBk / br.pvEnq) * 100) + '%' : '0%'}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.evEnq ? Math.round((br.evBk / br.evEnq) * 100) + '%' : '0%'}</td>
                        <td className="py-2 px-3 border-r border-line font-mono tnum">{br.pvBk ? Math.round((br.pvRt / br.pvBk) * 100) + '%' : '0%'}</td>
                        <td className="py-2 px-3 font-mono tnum">{br.evBk ? Math.round((br.evRt / br.evBk) * 100) + '%' : '0%'}</td>
                      </tr>
                    ))}
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
                No EBR data available. Please add bookings.
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* 5. TAB CONTENT: EV EBR REPORTS                                     */}
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
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold">
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
                No EV data available. Please add EV bookings.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
