import { formatDate } from '../utils/dateUtils';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFleetCounts } from '../hooks/useFleetCounts';
import { getVehiclesForBrand, getBookingsForBrand, getActiveStockyards, syncWithSupabase, isTataItem, isHyundaiItem } from '../data/seedData';
import { Panel, Stat, Badge, Bar, PageHeader } from '../components/ui/primitives';
import { isSmartPbnaMatch } from '../utils/matchingUtils';
import { 
  Warehouse, Car, Bookmark, Truck, CheckCircle2, AlertTriangle, Eye, 
  ArrowRight, Search, Download, X, Sliders, ShieldCheck, Layers, Palette, Filter, User, Phone, IndianRupee, Calendar,
  ShoppingBag, Key, Sparkles, Award, ArrowUpRight, PieChart
} from 'lucide-react';

const cleanStr = (s?: string) => {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/\b(tata|hyundai)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

/* -------------------------------------------------------------------------- */
/* Stock Overview Donut Chart Component                                       */
/* -------------------------------------------------------------------------- */
const StockDonutChart: React.FC<{
  physical: number;
  allocated: number;
  freeStock: number;
  gateInward: number;
}> = ({ physical, allocated, freeStock, gateInward }) => {
  const total = physical + gateInward;
  const allocPct = physical > 0 ? Math.round((allocated / physical) * 100) : 0;
  
  const radius = 46;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    if (total === 0) return [];
    const items = [
      { val: allocated, color: 'text-purple-500' },
      { val: freeStock, color: 'text-amber-500' },
      { val: gateInward, color: 'text-blue-500' },
    ].filter(item => item.val > 0);
    
    let currentOffset = 0;
    return items.map(item => {
      const pct = item.val / total;
      const strokeLen = Math.max(4, pct * circumference);
      const dasharray = `${strokeLen} ${circumference}`;
      const dashoffset = -currentOffset;
      currentOffset += strokeLen;
      return { ...item, dasharray, dashoffset };
    });
  }, [total, allocated, freeStock, gateInward, circumference]);

  return (
    <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-100"
        />
        {segments.map((s, idx) => (
          <circle
            key={idx}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={s.dasharray}
            strokeDashoffset={s.dashoffset}
            strokeLinecap="round"
            className={`${s.color} transition-all duration-500`}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum">
          {allocPct}%
        </span>
        <span className="text-[10px] text-ink-3 font-semibold tracking-wider uppercase">
          Total %
        </span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Drive Your Dreams Modern White SUV Graphic Component                       */
/* -------------------------------------------------------------------------- */
const DriveDreamsGraphic: React.FC = () => {
  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden py-1">
      <svg
        className="w-full max-w-[290px] h-auto"
        viewBox="0 0 340 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft landscape horizon */}
        <path
          d="M0 130 C60 122, 140 126, 200 118 C260 110, 310 122, 340 118 L340 160 L0 160 Z"
          fill="rgba(230, 240, 250, 0.45)"
        />
        <path
          d="M0 138 C80 134, 160 140, 240 132 C280 128, 315 134, 340 132 L340 160 L0 160 Z"
          fill="rgba(215, 230, 248, 0.55)"
        />

        {/* Shadow under vehicle */}
        <ellipse cx="170" cy="142" rx="125" ry="9" fill="rgba(20, 35, 60, 0.12)" />
        <ellipse cx="170" cy="141" rx="90" ry="5.5" fill="rgba(20, 35, 60, 0.18)" />

        {/* SUV Body facing 3/4 front-left */}
        <g id="modern-white-suv">
          {/* Main White Body Shell */}
          <path
            d="M 288 116 
               L 272 112 
               C 266 98, 255 86, 238 80 
               L 185 74 
               C 165 64, 125 63, 82 70 
               L 58 84 
               L 46 100 
               L 40 110 
               C 38 114, 42 120, 48 122 
               L 62 124 
               C 64 110, 80 100, 96 101 
               C 112 102, 124 114, 124 126 
               L 216 128 
               C 218 114, 232 104, 248 105 
               C 262 106, 274 116, 274 128 
               L 290 126 
               C 294 125, 296 119, 288 116 Z"
            fill="rgba(255, 255, 255, 0.98)"
            stroke="rgba(165, 185, 215, 0.85)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Cabin & Tinted Windows */}
          <path
            d="M 236 82 
               L 186 76 
               L 126 72 
               L 86 76 
               L 64 87 
               L 86 98 
               L 154 99 
               L 232 96 Z"
            fill="rgba(195, 218, 245, 0.45)"
            stroke="rgba(135, 165, 205, 0.75)"
            strokeWidth="1.2"
          />
          {/* Window B-Pillars */}
          <line x1="156" y1="74" x2="154" y2="99" stroke="rgba(95, 125, 165, 0.6)" strokeWidth="2.5" />
          <line x1="110" y1="74" x2="108" y2="98" stroke="rgba(95, 125, 165, 0.5)" strokeWidth="2" />

          {/* Front Grille and Headlights (Left side) */}
          <path
            d="M 56 92 L 43 104 L 52 110 L 62 104 Z"
            fill="rgba(235, 243, 255, 0.9)"
            stroke="rgba(60, 99, 163, 0.6)"
            strokeWidth="1.2"
          />
          {/* LED DRL Signature */}
          <path
            d="M 58 90 L 42 102"
            stroke="rgba(70, 145, 245, 0.9)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Lower Front Bumper */}
          <path
            d="M 64 120 L 44 114 C 40 118, 44 124, 50 125 L 66 124 Z"
            fill="rgba(220, 230, 242, 0.8)"
            stroke="rgba(160, 180, 205, 0.6)"
            strokeWidth="1"
          />

          {/* Front Wheel (Left in front-facing perspective) */}
          <g transform="translate(95, 126)">
            <circle cx="0" cy="0" r="19" fill="rgba(35, 45, 60, 0.95)" />
            <circle cx="0" cy="0" r="14" fill="rgba(235, 240, 248, 0.9)" stroke="rgba(180, 195, 215, 0.8)" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="6" fill="rgba(70, 85, 105, 0.9)" />
            <line x1="-12" y1="0" x2="12" y2="0" stroke="rgba(100, 120, 150, 0.8)" strokeWidth="2" />
            <line x1="0" y1="-12" x2="0" y2="12" stroke="rgba(100, 120, 150, 0.8)" strokeWidth="2" />
            <line x1="-8" y1="-8" x2="8" y2="8" stroke="rgba(100, 120, 150, 0.8)" strokeWidth="1.8" />
            <line x1="8" y1="-8" x2="-8" y2="8" stroke="rgba(100, 120, 150, 0.8)" strokeWidth="1.8" />
          </g>

          {/* Rear Wheel (Right in perspective) */}
          <g transform="translate(247, 128)">
            <circle cx="0" cy="0" r="18" fill="rgba(35, 45, 60, 0.95)" />
            <circle cx="0" cy="0" r="13" fill="rgba(235, 240, 248, 0.9)" stroke="rgba(180, 195, 215, 0.8)" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="5" fill="rgba(70, 85, 105, 0.9)" />
            <line x1="-11" y1="0" x2="11" y2="0" stroke="rgba(100, 120, 150, 0.8)" strokeWidth="1.8" />
            <line x1="0" y1="-11" x2="0" y2="11" stroke="rgba(100, 120, 150, 0.8)" strokeWidth="1.8" />
            <line x1="-7" y1="-7" x2="7" y2="7" stroke="rgba(100, 120, 150, 0.8)" strokeWidth="1.6" />
            <line x1="7" y1="-7" x2="-7" y2="7" stroke="rgba(100, 120, 150, 0.8)" strokeWidth="1.6" />
          </g>

          {/* Body Character Lines & Highlights */}
          <path
            d="M 250 100 C 200 98, 140 96, 85 102"
            stroke="rgba(200, 215, 235, 0.8)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 220 112 C 180 110, 145 110, 115 112"
            stroke="rgba(215, 228, 245, 0.9)"
            strokeWidth="1.2"
          />
          {/* Door Handles */}
          <rect x="175" y="101" width="10" height="2" rx="1" fill="rgba(140, 160, 185, 0.7)" />
          <rect x="125" y="102" width="10" height="2" rx="1" fill="rgba(140, 160, 185, 0.7)" />
        </g>
      </svg>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { currentBrand } = useAuth();
  const counts = useFleetCounts();

  const [fleetList, setFleetList] = useState<any[]>(() => getVehiclesForBrand(currentBrand.code));
  const [bookingsList, setBookingsList] = useState<any[]>(() => getBookingsForBrand(currentBrand.code));
  const [loading, setLoading] = useState(false);

  // Dedicated Model Modal state
  const [selectedModalModel, setSelectedModalModel] = useState<string | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<'MATRIX' | 'CUSTOMERS'>('MATRIX');
  const [viewingVinList, setViewingVinList] = useState<{ 
    variant: string; 
    colour: string; 
    vehicles: Array<{
      vin: string;
      model: string;
      variant: string;
      color: string;
      location: string;
      status: string;
      purchase_date: string;
      ageing_days: number;
    }> 
  } | null>(null);
  const [drilldownSearch, setDrilldownSearch] = useState('');
  const [variantFilter, setVariantFilter] = useState<string>('ALL');
  const [colourFilter, setColourFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    // 1. Sync immediately from in-memory cache
    setFleetList(getVehiclesForBrand(currentBrand.code));
    setBookingsList(getBookingsForBrand(currentBrand.code));
    setLoading(false);

    // 2. Trigger background cloud sync once
    syncWithSupabase().catch(() => {});

    // 3. Listen for updates without infinite re-fetch loop
    const handleDataUpdate = () => {
      setFleetList(getVehiclesForBrand(currentBrand.code));
      setBookingsList(getBookingsForBrand(currentBrand.code));
      setLoading(false);
    };

    window.addEventListener('stock-updated', handleDataUpdate);
    window.addEventListener('bookings-updated', handleDataUpdate);
    window.addEventListener('challans-updated', handleDataUpdate);
    window.addEventListener('stockyards-updated', handleDataUpdate);

    return () => {
      window.removeEventListener('stock-updated', handleDataUpdate);
      window.removeEventListener('bookings-updated', handleDataUpdate);
      window.removeEventListener('challans-updated', handleDataUpdate);
      window.removeEventListener('stockyards-updated', handleDataUpdate);
    };
  }, [currentBrand?.code]);

  const fetchDashboardData = () => {
    setFleetList(getVehiclesForBrand(currentBrand.code));
    setBookingsList(getBookingsForBrand(currentBrand.code));
    setLoading(false);
  };

  // 1. Dynamic Stockyard Network Matrix
  const yardFacilities = useMemo(() => {
    const activeYards = getActiveStockyards(currentBrand?.code);

    return activeYards.map(yard => {
      const yardNameNorm = cleanStr(yard.name);
      
      const yardVehicles = fleetList.filter(v => {
        const vLocNorm = cleanStr(v.location);
        return vLocNorm === yardNameNorm || vLocNorm.includes(yardNameNorm) || yardNameNorm.includes(vLocNorm);
      });

      const physicalStock = yardVehicles.filter(v => v.status !== 'YARD_RECEIVING_PENDING' && v.location !== 'In Transit').length;
      const allocated = yardVehicles.filter(v => (!!v.customer_name && String(v.customer_name).toLowerCase() !== 'unallocated') || v.status === 'ALLOCATED').length;
      const freeStock = Math.max(0, physicalStock - allocated);
      const gateInward = yardVehicles.filter(v => v.status === 'YARD_RECEIVING_PENDING' || v.location === 'In Transit').length;
      
      const allocationPct = physicalStock > 0 ? Math.round((allocated / physicalStock) * 100) : 0;

      return {
        id: yard.id,
        name: yard.name,
        brand: yard.brand,
        city: yard.city,
        capacity: yard.capacity,
        physicalStock,
        allocated,
        freeStock,
        gateInward,
        allocationPct
      };
    });
  }, [currentBrand?.code, fleetList]);

  // 2. Comprehensive Model-Wise Demand & PBNA/VNA Ledger
  const modelMatrix = useMemo(() => {
    const stockModelNames = fleetList.map(v => v.model).filter(Boolean);
    const bookingModelNames = bookingsList.map(b => b.model).filter(Boolean);
    const allUniqueNames = Array.from(new Set([...currentBrand.models, ...stockModelNames, ...bookingModelNames]));
    const brandScopedModels = allUniqueNames.filter(mName => {
      if (currentBrand.code === 'DHOOT-TATA') return isTataItem({ model: mName });
      if (currentBrand.code === 'DHOOT-HYUNDAI') return isHyundaiItem({ model: mName });
      return true;
    });

    return brandScopedModels.map(modelName => {
      const normModel = cleanStr(modelName);

      // All Bookings for this model
      const modelBookings = bookingsList.filter(b => cleanStr(b.model) === normModel || cleanStr(b.model).includes(normModel) || normModel.includes(cleanStr(b.model)));
      const totalBookings = modelBookings.length;
      const allocatedBookings = modelBookings.filter(b => !!b.allocated_vin_no && String(b.allocated_vin_no).trim() !== '').length;
      const unallocatedBookings = modelBookings.filter(b => !b.allocated_vin_no || String(b.allocated_vin_no).trim() === '');

      // All Stock for this model
      const modelVehicles = fleetList.filter(v => cleanStr(v.model) === normModel || cleanStr(v.model).includes(normModel) || normModel.includes(cleanStr(v.model)));
      const physicalInYard = modelVehicles.filter(v => v.status !== 'YARD_RECEIVING_PENDING' && v.location !== 'In Transit').length;
      const freeYardStock = modelVehicles.filter(v => 
        v.status !== 'YARD_RECEIVING_PENDING' && 
        v.location !== 'In Transit' && 
        (!v.customer_name || String(v.customer_name).toLowerCase() === 'unallocated') && 
        v.status !== 'ALLOCATED'
      ).length;
      const inTransit = modelVehicles.filter(v => v.location === 'In Transit' || v.status === 'YARD_RECEIVING_PENDING').length;
      
      // Calculate PBNA vs VNA for this model using smart matcher
      const matchedVinSet = new Set<string>();
      let pbna = 0;
      let vna = 0;

      const freeStockAvailable = modelVehicles.filter(v => 
        v.status !== 'YARD_RECEIVING_PENDING' && 
        v.location !== 'In Transit' && 
        (!v.customer_name || String(v.customer_name).toLowerCase() === 'unallocated') && 
        v.status !== 'ALLOCATED'
      );

      unallocatedBookings.forEach(b => {
        const match = freeStockAvailable.find(v => !matchedVinSet.has(v.vin) && isSmartPbnaMatch(b, v));
        if (match) {
          matchedVinSet.add(match.vin);
          pbna++;
        } else {
          vna++;
        }
      });

      const allocRate = totalBookings > 0 ? Math.round((allocatedBookings / totalBookings) * 100) : (physicalInYard > 0 ? 100 : 0);

      // 3. Variant & Colour Matrix Grouping
      const variantColourMap: Record<string, {
        variant: string;
        colour: string;
        bookings: number;
        allocated: number;
        pbna: number;
        vna: number;
        freeStock: number;
        matchedVins: string[];
        freeVehiclesDetails: Array<{
          vin: string;
          model: string;
          variant: string;
          color: string;
          location: string;
          status: string;
          purchase_date: string;
          ageing_days: number;
        }>;
      }> = {};

      const allCombos = new Set<string>();
      modelBookings.forEach(b => {
        const key = `${b.variant || 'Standard'} ••• ${b.colour || 'Standard'}`;
        allCombos.add(key);
      });
      modelVehicles.forEach(v => {
        const key = `${v.variant || 'Standard'} ••• ${v.color || v.colour || 'Standard'}`;
        allCombos.add(key);
      });

      allCombos.forEach(key => {
        const [variant, colour] = key.split(' ••• ');
        const vClean = cleanStr(variant);
        const cClean = cleanStr(colour);

        const subBookings = modelBookings.filter(b => 
          cleanStr(b.variant) === vClean && 
          cleanStr(b.colour) === cClean
        );
        const subAllocated = subBookings.filter(b => !!b.allocated_vin_no).length;
        const subUnallocated = subBookings.filter(b => !b.allocated_vin_no).length;

        const subFreeVehicles = freeStockAvailable.filter(v => 
          (cleanStr(v.variant) === vClean && cleanStr(v.color || v.colour) === cClean) ||
          subBookings.some(b => isSmartPbnaMatch(b, v))
        );

        const subPbna = Math.min(subUnallocated, subFreeVehicles.length);
        const subVna = Math.max(0, subUnallocated - subFreeVehicles.length);

        variantColourMap[key] = {
          variant,
          colour,
          bookings: subBookings.length,
          allocated: subAllocated,
          pbna: subPbna,
          vna: subVna,
          freeStock: subFreeVehicles.length,
          matchedVins: subFreeVehicles.map(v => `${v.vin} (${v.location || (isHyundaiItem(v) ? 'Shantinath Yard' : 'Basni Yard')})`),
          freeVehiclesDetails: subFreeVehicles.map(v => {
            const pDate = v.purchase_date || v.created_at || '';
            const ageing = pDate ? Math.max(0, Math.floor((Date.now() - new Date(pDate).getTime()) / (1000 * 60 * 60 * 24))) : 0;
            return {
              vin: v.vin,
              model: v.model,
              variant: v.variant || variant,
              color: v.color || v.colour || colour,
              location: v.location || (isHyundaiItem(v) ? 'Shantinath Yard' : 'Basni Yard'),
              status: v.status || v.vehicle_status || 'RECEIVED',
              purchase_date: pDate,
              ageing_days: ageing
            };
          })
        };
      });

      // 4. Detailed Customer Bookings with Stock Tag
      const bookingVinMatchSet = new Set<string>();
      const detailedBookings = modelBookings.map((b, bIdx) => {
        const isAllocated = !!b.allocated_vin_no && String(b.allocated_vin_no).trim() !== '';
        
        let stockStatus: 'ALLOCATED' | 'PBNA' | 'VNA' = 'VNA';
        let matchedStockVin: string | null = null;
        let matchedLocation: string | null = null;

        if (isAllocated) {
          stockStatus = 'ALLOCATED';
          matchedStockVin = b.allocated_vin_no;
          const foundVeh = fleetList.find(v => v.vin === b.allocated_vin_no);
          matchedLocation = foundVeh?.location || (isHyundaiItem(b) ? 'Shantinath Yard' : 'Basni Yard');
        } else {
          const freeMatch = modelVehicles.find(v => {
            if (bookingVinMatchSet.has(v.vin)) return false;
            const isFree = (!v.customer_name || String(v.customer_name).toLowerCase() === 'unallocated') &&
                           v.status !== 'ALLOCATED' &&
                           v.location !== 'In Transit';
            if (!isFree) return false;

            return isSmartPbnaMatch(b, v);
          });

          if (freeMatch) {
            bookingVinMatchSet.add(freeMatch.vin);
            stockStatus = 'PBNA';
            matchedStockVin = freeMatch.vin;
            matchedLocation = freeMatch.location || (isHyundaiItem(b) ? 'Shantinath Yard' : 'Basni Yard');
          } else {
            stockStatus = 'VNA';
          }
        }

        return {
          id: b.id || `bk-${bIdx}`,
          receipt_no: b.receipt_no || '—',
          receipt_date: b.receipt_date || b.created_at || '',
          customer_name: b.customer_name || 'Customer',
          mobile_number: b.mobile_number || '—',
          model: b.model || modelName,
          variant: b.variant || 'Standard',
          colour: b.colour || '—',
          sales_consultant: b.sales_consultant || 'Sales Desk',
          team_leader: b.team_leader || '—',
          receipt_amt: Number(b.receipt_amt) || 0,
          delivery_date: b.delivery_date || '',
          hypothecation: b.hypothecation || 'Self Funded',
          stockStatus,
          matchedStockVin,
          matchedLocation
        };
      });

      return {
        name: modelName,
        brand: currentBrand.shortName || 'OEM',
        totalBookings,
        allocatedBookings,
        pbna,
        vna,
        physicalInYard,
        freeYardStock,
        inTransit,
        allocRate,
        matrixRows: Object.values(variantColourMap),
        detailedBookings
      };
    });
  }, [currentBrand?.code, fleetList, bookingsList]);

  // Selected Model Data for Modal
  const activeModalData = useMemo(() => {
    if (!selectedModalModel) return null;
    return modelMatrix.find(m => m.name === selectedModalModel) || null;
  }, [selectedModalModel, modelMatrix]);

  // Unique variants and colours for dropdown filters
  const uniqueVariantsForModel = useMemo(() => {
    if (!activeModalData) return [];
    return Array.from(new Set(activeModalData.matrixRows.map(d => d.variant).filter(Boolean))).sort();
  }, [activeModalData]);

  const uniqueColoursForModel = useMemo(() => {
    if (!activeModalData) return [];
    return Array.from(new Set(activeModalData.matrixRows.map(d => d.colour).filter(Boolean))).sort();
  }, [activeModalData]);

  // Filtered Matrix Rows (Tab 1)
  const filteredMatrixRows = useMemo(() => {
    if (!activeModalData) return [];
    const q = drilldownSearch.trim().toLowerCase();
    
    return activeModalData.matrixRows.filter(d => {
      const matchesSearch = !q || d.variant.toLowerCase().includes(q) || d.colour.toLowerCase().includes(q);
      const matchesVariant = variantFilter === 'ALL' || d.variant === variantFilter;
      const matchesColour = colourFilter === 'ALL' || d.colour === colourFilter;
      return matchesSearch && matchesVariant && matchesColour;
    });
  }, [activeModalData, drilldownSearch, variantFilter, colourFilter]);

  // Filtered Customer Bookings (Tab 2)
  const filteredModalBookings = useMemo(() => {
    if (!activeModalData) return [];
    const q = drilldownSearch.trim().toLowerCase();
    
    return activeModalData.detailedBookings.filter(d => {
      const matchesSearch = 
        !q || 
        d.customer_name.toLowerCase().includes(q) ||
        d.receipt_no.toLowerCase().includes(q) ||
        d.mobile_number.toLowerCase().includes(q) ||
        d.variant.toLowerCase().includes(q) ||
        d.colour.toLowerCase().includes(q) ||
        d.sales_consultant.toLowerCase().includes(q) ||
        (d.matchedStockVin || '').toLowerCase().includes(q);

      const matchesVariant = variantFilter === 'ALL' || d.variant === variantFilter;
      const matchesColour = colourFilter === 'ALL' || d.colour === colourFilter;
      const matchesStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'VNA' && d.stockStatus === 'VNA') ||
        (statusFilter === 'PBNA' && d.stockStatus === 'PBNA') ||
        (statusFilter === 'ALLOCATED' && d.stockStatus === 'ALLOCATED');

      return matchesSearch && matchesVariant && matchesColour && matchesStatus;
    });
  }, [activeModalData, drilldownSearch, variantFilter, colourFilter, statusFilter]);

  // Dynamic Summary Stats strictly based on active selection
  const modalSummaryStats = useMemo(() => {
    if (modalActiveTab === 'MATRIX') {
      const totalBookings = filteredMatrixRows.reduce((sum, d) => sum + d.bookings, 0);
      const allocated = filteredMatrixRows.reduce((sum, d) => sum + d.allocated, 0);
      const pbna = filteredMatrixRows.reduce((sum, d) => sum + d.pbna, 0);
      const vna = filteredMatrixRows.reduce((sum, d) => sum + d.vna, 0);
      const freeStock = filteredMatrixRows.reduce((sum, d) => sum + d.freeStock, 0);
      return { totalBookings, allocated, pbna, vna, freeStock, totalAdvance: 0 };
    } else {
      const totalBookings = filteredModalBookings.length;
      const allocated = filteredModalBookings.filter(d => d.stockStatus === 'ALLOCATED').length;
      const pbna = filteredModalBookings.filter(d => d.stockStatus === 'PBNA').length;
      const vna = filteredModalBookings.filter(d => d.stockStatus === 'VNA').length;
      const freeStock = activeModalData?.freeYardStock || 0;
      const totalAdvance = filteredModalBookings.reduce((sum, d) => sum + d.receipt_amt, 0);
      return { totalBookings, allocated, pbna, vna, freeStock, totalAdvance };
    }
  }, [modalActiveTab, filteredMatrixRows, filteredModalBookings, activeModalData]);

  // Export CSV
  const handleExportCSV = () => {
    if (!activeModalData) return;
    
    if (modalActiveTab === 'MATRIX') {
      const headers = ['Model', 'Variant', 'Colour', 'Customer Orders', 'VIN Allocated', 'PBNA (In Stock)', 'Not in Stock (VNA)', 'Free Yard Stock', 'Stock Status', 'Available Free VINs'];
      const rows = [
        headers.join(','),
        ...filteredMatrixRows.map(d => [
          `"${activeModalData.name}"`,
          `"${d.variant}"`,
          `"${d.colour}"`,
          d.bookings,
          d.allocated,
          d.pbna,
          d.vna,
          d.freeStock,
          `"${d.vna > 0 ? 'Indent Needed' : d.pbna > 0 ? 'Ready to Allot' : d.freeStock > 0 ? 'Available Free' : 'Settled'}"`,
          `"${(d.matchedVins || []).join('; ')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeModalData.name}_Variant_Colour_Matrix.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = [
        'Receipt Date', 'Receipt No', 'Customer Name', 'Mobile No', 'Model', 'Variant', 'Colour',
        'Sales Consultant', 'Team Leader', 'Received Amount', 'Delivery Date', 'Financier', 'Stock Status', 'Allocated / Matched VIN', 'Yard Location'
      ];
      const rows = [
        headers.join(','),
        ...filteredModalBookings.map(d => [
          `"${formatDate(d.receipt_date)}"`,
          `"${d.receipt_no}"`,
          `"${d.customer_name}"`,
          `"${d.mobile_number}"`,
          `"${d.model}"`,
          `"${d.variant}"`,
          `"${d.colour}"`,
          `"${d.sales_consultant}"`,
          `"${d.team_leader}"`,
          d.receipt_amt,
          `"${d.delivery_date ? formatDate(d.delivery_date) : ''}"`,
          `"${d.hypothecation}"`,
          `"${d.stockStatus === 'VNA' ? 'Not in Stock (Indent Required)' : d.stockStatus === 'PBNA' ? 'PBNA (Vehicle In Stock)' : 'VIN Allocated'}"`,
          `"${d.matchedStockVin || ''}"`,
          `"${d.matchedLocation || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeModalData.name}_Customer_Orders_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto select-none pb-20">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-soft border border-accent-line/60 flex items-center justify-center text-accent shrink-0 shadow-xs">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight">Operations Overview</h1>
            <p className="text-xs text-ink-3">
              100% Live Dealership Vehicle Ledger • Realtime Booking Pipeline, Stockyard Network &amp; PBNA/VNA Status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3.5 py-1.5 bg-surface border border-line rounded-full text-xs font-semibold text-ink shadow-xs">
            {currentBrand.code === 'DHOOT-ALL' ? 'All Dealerships' : currentBrand.name}
          </span>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface border border-line rounded-full text-xs font-medium text-ink-2 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-ink-3" />
            <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* 2. Top 8 KPI Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* Total Bookings */}
        <Link
          to="/bookings"
          className="bg-surface border border-line hover:border-accent/40 rounded-xl p-3 flex flex-col justify-between transition-colors group shadow-xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 border border-blue-100/60">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-ink-2 tracking-wider uppercase truncate">
              TOTAL BOOKINGS
            </span>
          </div>
          <div className="py-2">
            <div className="text-2xl font-bold font-mono text-ink tracking-tight tnum">
              {counts.totalBookings}
            </div>
          </div>
          <div className="text-[11px] text-ink-3 truncate">
            Customer Orders
          </div>
        </Link>

        {/* VIN Allocated */}
        <Link
          to="/bookings"
          className="bg-surface border border-line hover:border-accent/40 rounded-xl p-3 flex flex-col justify-between transition-colors group shadow-xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600 border border-emerald-100/60">
              <Key className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-ink-2 tracking-wider uppercase truncate">
              VIN ALLOCATED
            </span>
          </div>
          <div className="py-2">
            <div className="text-2xl font-bold font-mono text-ink tracking-tight tnum">
              {counts.allocatedVehicles}
            </div>
          </div>
          <div className="text-[11px] text-ink-3 truncate">
            Tagged to Chassis
          </div>
        </Link>

        {/* PBNA (In Stock) */}
        <Link
          to="/bookings"
          className="bg-surface border border-line hover:border-accent/40 rounded-xl p-3 flex flex-col justify-between transition-colors group shadow-xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-purple-50 text-purple-600 border border-purple-100/60">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-ink-2 tracking-wider uppercase truncate">
              PBNA (IN STOCK)
            </span>
          </div>
          <div className="py-2">
            <div className="text-2xl font-bold font-mono text-ink tracking-tight tnum">
              {counts.totalPbnaVehicle}
            </div>
          </div>
          <div className="text-[11px] text-ink-3 truncate">
            Stock Available
          </div>
        </Link>

        {/* Not in Stock (VNA) */}
        <Link
          to="/bookings"
          className="bg-surface border border-line hover:border-accent/40 rounded-xl p-3 flex flex-col justify-between transition-colors group shadow-xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-amber-50 text-amber-600 border border-amber-100/60">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-ink-2 tracking-wider uppercase truncate">
              NOT IN STOCK (VNA)
            </span>
          </div>
          <div className="py-2">
            <div className="text-2xl font-bold font-mono text-ink tracking-tight tnum">
              {counts.totalVnaVehicle}
            </div>
          </div>
          <div className="text-[11px] text-ink-3 truncate">
            Factory Indent Needed
          </div>
        </Link>

        {/* Physical Yard Stock */}
        <Link
          to="/vehicles"
          className="bg-surface border border-line hover:border-accent/40 rounded-xl p-3 flex flex-col justify-between transition-colors group shadow-xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-teal-50 text-teal-600 border border-teal-100/60">
              <Warehouse className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-ink-2 tracking-wider uppercase truncate">
              PHYSICAL YARD STOCK
            </span>
          </div>
          <div className="py-2">
            <div className="text-2xl font-bold font-mono text-ink tracking-tight tnum">
              {counts.totalPhysicalStock}
            </div>
          </div>
          <div className="text-[11px] text-ink-3 truncate">
            In Dealership Yards
          </div>
        </Link>

        {/* Free Yard Stock */}
        <Link
          to="/vehicles"
          className="bg-surface border border-line hover:border-accent/40 rounded-xl p-3 flex flex-col justify-between transition-colors group shadow-xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-rose-50 text-rose-600 border border-rose-100/60">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-ink-2 tracking-wider uppercase truncate">
              FREE YARD STOCK
            </span>
          </div>
          <div className="py-2">
            <div className="text-2xl font-bold font-mono text-ink tracking-tight tnum">
              {counts.totalFreeVehicle}
            </div>
          </div>
          <div className="text-[11px] text-ink-3 truncate">
            Available Unassigned
          </div>
        </Link>

        {/* In-Transit / Gate */}
        <Link
          to="/receiving"
          className="bg-surface border border-line hover:border-accent/40 rounded-xl p-3 flex flex-col justify-between transition-colors group shadow-xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-sky-50 text-sky-600 border border-sky-100/60">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-ink-2 tracking-wider uppercase truncate">
              IN TRANSIT / GATE
            </span>
          </div>
          <div className="py-2">
            <div className="text-2xl font-bold font-mono text-ink tracking-tight tnum">
              {counts.receivingPending}
            </div>
          </div>
          <div className="text-[11px] text-ink-3 truncate">
            En-Route Carrier
          </div>
        </Link>

        {/* PDI Certified */}
        <Link
          to="/pdi"
          className="bg-surface border border-line hover:border-accent/40 rounded-xl p-3 flex flex-col justify-between transition-colors group shadow-xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-600 border border-indigo-100/60">
              <Award className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-ink-2 tracking-wider uppercase truncate">
              PDI CERTIFIED
            </span>
          </div>
          <div className="py-2">
            <div className="text-2xl font-bold font-mono text-ink tracking-tight tnum">
              {counts.pdiDone}
            </div>
          </div>
          <div className="text-[11px] text-ink-3 truncate">
            Ready for Delivery
          </div>
        </Link>
      </div>

      {/* 3. Middle Section: Stockyard Facility Network & Stock Overview Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Stockyard Facility Network */}
        <div className="lg:col-span-8 xl:col-span-9 bg-surface border border-line rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2.5">
                <Warehouse className="w-4 h-4 text-accent shrink-0" />
                <h2 className="text-sm font-bold text-ink">Stockyard Facility Network</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {yardFacilities.length} Active Yards
                </span>
              </div>
              <Link
                to="/vehicles"
                className="text-ink-3 hover:text-accent transition-colors p-1 rounded hover:bg-canvas"
                title="Open Stock Sheet"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-line text-ink-3 font-semibold uppercase tracking-[0.06em] text-[10px]">
                    <th className="py-2.5 px-3 w-8 text-center">#</th>
                    <th className="py-2.5 px-3">Stockyard Facility</th>
                    <th className="py-2.5 px-3">Location (City)</th>
                    <th className="py-2.5 px-3 text-right">Location / Capacity</th>
                    <th className="py-2.5 px-3 text-right">VIN Allocated</th>
                    <th className="py-2.5 px-3 text-right">Free Stock</th>
                    <th className="py-2.5 px-3 w-36">Allocation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink-2 text-xs">
                  {yardFacilities.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-ink-3">
                        <Warehouse className="w-8 h-8 text-ink-3/40 mx-auto mb-2" />
                        <p className="text-xs font-medium text-ink">0 Stockyards in Database</p>
                        <p className="text-[11px] text-ink-3 mt-0.5">Configure your yard network in Admin Master Panel.</p>
                        <Link to="/admin" className="mt-2 inline-block text-xs text-accent hover:underline font-semibold">
                          Open Admin Master Panel &rarr;
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    yardFacilities.map((yard, idx) => (
                    <tr key={yard.id || idx} className="hover:bg-canvas/80 transition-colors">
                      <td className="py-2 px-3 text-center text-ink-3 font-mono tnum text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-semibold text-ink whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Warehouse className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                          <span>{yard.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-ink-2 whitespace-nowrap">
                        {yard.city}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-ink tnum">
                        {yard.physicalStock}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-amber-600 tnum">
                        {yard.allocated}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-emerald-600 tnum">
                        {yard.freeStock}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: `${Math.min(100, yard.allocationPct)}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-ink font-mono font-medium text-[11px] tnum">
                            {yard.allocationPct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: STOCK OVERVIEW Donut Chart */}
        <div className="lg:col-span-4 xl:col-span-3 bg-surface border border-line rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-line">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              STOCK OVERVIEW
            </h3>
          </div>

          <div className="py-4 flex flex-col items-center justify-center gap-4">
            <StockDonutChart
              physical={counts.totalPhysicalStock}
              allocated={counts.allocatedVehicles}
              freeStock={counts.totalFreeVehicle}
              gateInward={counts.receivingPending}
            />

            <div className="space-y-2.5 w-full pt-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-ink-2 font-medium">Physical</span>
                </div>
                <span className="font-mono font-bold text-ink tnum">{counts.totalPhysicalStock}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-ink-2 font-medium">VIN Allocated</span>
                </div>
                <span className="font-mono font-bold text-ink tnum">{counts.allocatedVehicles}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-ink-2 font-medium">Free Stock</span>
                </div>
                <span className="font-mono font-bold text-ink tnum">{counts.totalFreeVehicle}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-ink-2 font-medium">Gate Inward</span>
                </div>
                <span className="font-mono font-bold text-ink tnum">{counts.receivingPending}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-line text-[11px] text-ink-3 text-center">
            Live Yard Network Capacity &amp; Inward Feed
          </div>
        </div>

      </div>

      {/* 4. Bottom Section: Model Demand Ledger & Drive Your Dreams Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Model Demand Ledger */}
        <div className="lg:col-span-8 xl:col-span-9 bg-surface border border-line rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4 text-accent shrink-0" />
                <h2 className="text-sm font-bold text-ink">Model Demand &amp; PBNA / VNA Allocation Ledger</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {modelMatrix.length} Models
                </span>
              </div>
              <Link
                to="/bookings"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>View All Bookings</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-line text-ink-3 font-semibold uppercase tracking-[0.06em] text-[10px]">
                    <th className="py-2.5 px-3 w-8 text-center">#</th>
                    <th className="py-2.5 px-3">Vehicle Model</th>
                    <th className="py-2.5 px-3 text-right">Customer Orders</th>
                    <th className="py-2.5 px-3 text-right">VIN Allocated</th>
                    <th className="py-2.5 px-3 text-right">PBNA (In Stock)</th>
                    <th className="py-2.5 px-3 text-right">Not In Stock (VNA)</th>
                    <th className="py-2.5 px-3 w-36">Allocation Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink-2 text-xs">
                  {modelMatrix.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-ink-3">
                        <Car className="w-8 h-8 text-ink-3/40 mx-auto mb-2" />
                        <p className="text-xs font-medium text-ink">0 Vehicle Models or Bookings Found</p>
                        <p className="text-[11px] text-ink-3 mt-0.5">Import stock or bookings from Excel to view PBNA/VNA demand matrix.</p>
                      </td>
                    </tr>
                  ) : (
                    modelMatrix.map((item, idx) => (
                    <tr
                      key={idx}
                      onClick={() => {
                        setSelectedModalModel(item.name);
                        setModalActiveTab('MATRIX');
                        setDrilldownSearch('');
                        setVariantFilter('ALL');
                        setColourFilter('ALL');
                        setStatusFilter('ALL');
                      }}
                      className="hover:bg-canvas/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-ink whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Car className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                          <span className="group-hover:text-accent transition-colors font-bold">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-ink tnum">
                        {item.totalBookings}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-emerald-600 tnum">
                        {item.allocatedBookings}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-amber-600 tnum">
                        {item.pbna}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-amber-700 tnum">
                        {item.vna}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: `${Math.min(100, item.allocRate)}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-ink font-mono font-medium text-[11px] tnum">
                            {item.allocRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Drive Your Dreams Showcase Card */}
        <div className="lg:col-span-4 xl:col-span-3 bg-surface border border-line rounded-xl p-5 shadow-xs flex flex-col items-center justify-between text-center overflow-hidden">
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            <DriveDreamsGraphic />
          </div>

          <div className="pt-2 pb-1">
            <h3 className="text-lg font-bold text-ink tracking-tight">
              Drive Your Dreams
            </h3>
            <p className="text-xs text-ink-3 font-medium mt-1">
              More Bookings • More Deliveries • Greater Growth
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODEL VARIANT & COLOUR MATRIX + CUSTOMER INDENT ORDERS MODAL              */}
      {/* ========================================================================= */}
      {selectedModalModel && activeModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in">
          <div className="bg-surface text-ink w-full max-w-6xl rounded-panel overflow-hidden border border-line shadow-pop flex flex-col max-h-[92vh] relative">
{/* Modal Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-ink">{activeModalData.name}</h2>
                    <Badge tone="accent">{modalActiveTab === 'MATRIX' ? 'Variant & Colour Matrix' : 'Customer Indent Orders'}</Badge>
                  </div>
                  <p className="text-xs text-ink-3">
                    Live specification demand, stock allocation & customer indent details
                  </p>
                </div>
              </div>

              {/* Tab Selector & Model Switcher & Close */}
              <div className="flex items-center gap-2 flex-wrap">
                
                {/* 2 Navigation Tabs */}
                <div className="flex items-center bg-surface border border-line rounded p-0.5 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setModalActiveTab('MATRIX')}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                      modalActiveTab === 'MATRIX' ? 'bg-accent text-white shadow-xs' : 'text-ink-2 hover:text-ink'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Variant & Colour Matrix</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalActiveTab('CUSTOMERS')}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                      modalActiveTab === 'CUSTOMERS' ? 'bg-accent text-white shadow-xs' : 'text-ink-2 hover:text-ink'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Customer Orders ({activeModalData.detailedBookings.length})</span>
                  </button>
                </div>

                {/* Model Switcher */}
                <div className="flex items-center gap-1.5 bg-surface border border-line rounded px-2.5 py-1 shadow-xs">
                  <span className="text-[11px] text-ink-3 font-semibold">Model:</span>
                  <select
                    value={selectedModalModel}
                    onChange={(e) => {
                      setSelectedModalModel(e.target.value);
                      setDrilldownSearch('');
                      setVariantFilter('ALL');
                      setColourFilter('ALL');
                      setStatusFilter('ALL');
                    }}
                    className="text-xs font-bold text-ink bg-transparent focus:outline-none cursor-pointer"
                  >
                    {modelMatrix.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedModalModel(null)}
                  className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              
              {/* Dynamic Summary KPI Cards Banner (Reflects Active Filters) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-2.5 bg-canvas border border-line rounded">
                  <span className="eyebrow block">Customer Orders</span>
                  <span className="text-base font-bold text-ink tnum">{modalSummaryStats.totalBookings}</span>
                </div>
                <div className="p-2.5 bg-ok/5 border border-ok/20 rounded">
                  <span className="eyebrow block text-ok">VIN Allocated</span>
                  <span className="text-base font-bold text-ok tnum">{modalSummaryStats.allocated}</span>
                </div>
                <div className="p-2.5 bg-warn/5 border border-warn/20 rounded">
                  <span className="eyebrow block text-warn">PBNA (In Stock)</span>
                  <span className="text-base font-bold text-warn tnum">{modalSummaryStats.pbna}</span>
                </div>
                <div className="p-2.5 bg-danger/5 border border-danger/20 rounded">
                  <span className="eyebrow block text-danger">Not in Stock (Indent Needed)</span>
                  <span className="text-base font-bold text-danger tnum">{modalSummaryStats.vna}</span>
                </div>
                <div className="p-2.5 bg-ok/5 border border-ok/20 rounded">
                  <span className="eyebrow block text-ok">Free Yard Stock</span>
                  <span className="text-base font-bold text-ok tnum">{modalSummaryStats.freeStock}</span>
                </div>
              </div>

              {/* Filter Toolbar with Variant & Colour Dropdowns */}
              <div className="p-3 bg-canvas border border-line rounded space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  
                  {/* Variant Filter */}
                  <div>
                    <label className="block text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-0.5">
                      Select Variant ({uniqueVariantsForModel.length})
                    </label>
                    <select
                      value={variantFilter}
                      onChange={(e) => setVariantFilter(e.target.value)}
                      className="w-full h-8 text-xs font-semibold bg-surface border border-line rounded px-2.5 text-ink focus:outline-none focus:border-accent shadow-xs cursor-pointer"
                    >
                      <option value="ALL">All Variants ({uniqueVariantsForModel.length})</option>
                      {uniqueVariantsForModel.map(vName => (
                        <option key={vName} value={vName}>{vName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Colour Filter */}
                  <div>
                    <label className="block text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-0.5">
                      Select Colour ({uniqueColoursForModel.length})
                    </label>
                    <select
                      value={colourFilter}
                      onChange={(e) => setColourFilter(e.target.value)}
                      className="w-full h-8 text-xs font-semibold bg-surface border border-line rounded px-2.5 text-ink focus:outline-none focus:border-accent shadow-xs cursor-pointer"
                    >
                      <option value="ALL">All Colours ({uniqueColoursForModel.length})</option>
                      {uniqueColoursForModel.map(cName => (
                        <option key={cName} value={cName}>{cName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter for Customers Tab */}
                  {modalActiveTab === 'CUSTOMERS' && (
                    <div>
                      <label className="block text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-0.5">
                        Order / Indent Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-8 text-xs font-semibold bg-surface border border-line rounded px-2.5 text-ink focus:outline-none focus:border-accent shadow-xs cursor-pointer"
                      >
                        <option value="ALL">All Orders ({activeModalData.detailedBookings.length})</option>
                        <option value="VNA">Not in Stock (Indent Required) ({activeModalData.vna})</option>
                        <option value="PBNA">PBNA (In Stock Ready) ({activeModalData.pbna})</option>
                        <option value="ALLOCATED">VIN Allocated ({activeModalData.allocatedBookings})</option>
                      </select>
                    </div>
                  )}

                  {/* Search */}
                  <div className={modalActiveTab === 'CUSTOMERS' ? '' : 'sm:col-span-2'}>
                    <label className="block text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-0.5">
                      Keyword Search
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search variant, colour, customer..."
                        value={drilldownSearch}
                        onChange={(e) => setDrilldownSearch(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 text-xs bg-surface border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent font-medium shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Reset Filters */}
                {(variantFilter !== 'ALL' || colourFilter !== 'ALL' || statusFilter !== 'ALL' || drilldownSearch) && (
                  <div className="pt-2 border-t border-line flex items-center justify-between">
                    <span className="text-[11px] text-accent font-semibold">
                      Filtered: Showing {modalActiveTab === 'MATRIX' ? filteredMatrixRows.length : filteredModalBookings.length} records
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setVariantFilter('ALL');
                        setColourFilter('ALL');
                        setStatusFilter('ALL');
                        setDrilldownSearch('');
                      }}
                      className="px-2.5 py-0.5 bg-surface border border-line text-xs font-semibold text-ink-2 rounded hover:bg-canvas shadow-xs cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* TAB 1: VARIANT & COLOUR MATRIX (With smooth horizontal scroll) */}
              {modalActiveTab === 'MATRIX' && (
                <div className="border border-line rounded overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs min-w-[1050px]">
                      <thead className="bg-accent-soft border-b border-accent-line text-accent font-semibold uppercase tracking-[0.06em] text-label">
                        <tr>
                          <th className="py-2.5 px-3 w-8 text-center whitespace-nowrap">#</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Variant Specification</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Exterior Colour</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">Customer Orders</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">VIN Allocated</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">PBNA (In Stock)</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">Not in Stock (VNA)</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">Free Yard Stock</th>
                          <th className="py-2.5 px-3 text-center whitespace-nowrap">Stock Status</th>
                          <th className="py-2.5 px-3 whitespace-nowrap min-w-[280px]">Available Free VINs (Yard)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line text-ink-2">
                        {filteredMatrixRows.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-8 text-center text-ink-3">
                              No variant & colour configurations found matching your filter.
                            </td>
                          </tr>
                        ) : (
                          filteredMatrixRows.map((row, rIdx) => {
                            const vehicles = (row as any).freeVehiclesDetails || [];

                            return (
                              <tr key={rIdx} className="hover:bg-canvas transition-colors">
                                  <td className="py-2.5 px-3 text-center text-ink-3 font-mono text-[11px] whitespace-nowrap">
                                    {rIdx + 1}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-ink whitespace-nowrap">
                                    {row.variant}
                                  </td>
                                  <td className="py-2.5 px-3 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <Palette className="w-3.5 h-3.5 text-accent shrink-0" />
                                      <span className="font-medium text-ink">{row.colour}</span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-medium text-ink tnum whitespace-nowrap">
                                    {row.bookings}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-medium text-ok tnum whitespace-nowrap">
                                    {row.allocated}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-warn tnum whitespace-nowrap">
                                    {row.pbna}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold tnum whitespace-nowrap">
                                    {row.vna > 0 ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setVariantFilter(row.variant);
                                          setColourFilter(row.colour);
                                          setStatusFilter('VNA');
                                          setModalActiveTab('CUSTOMERS');
                                        }}
                                        className="px-2 py-0.5 rounded bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30 font-bold transition-colors cursor-pointer"
                                        title="Click to view Customer Indent Details"
                                      >
                                        +{row.vna} Indent Needed
                                      </button>
                                    ) : (
                                      <span className="text-ink-3">0</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-ok tnum whitespace-nowrap">
                                    {row.freeStock}
                                  </td>
                                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                    {row.vna > 0 ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-danger/10 text-danger border border-danger/30">
                                        Indent Needed ({row.vna})
                                      </span>
                                    ) : row.pbna > 0 ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-warn/10 text-warn border border-warn/30">
                                        Ready to Allot ({row.pbna})
                                      </span>
                                    ) : row.freeStock > 0 ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ok/10 text-ok border border-ok/30">
                                        Available Free ({row.freeStock})
                                      </span>
                                    ) : (
                                      <span className="text-ink-3 text-[11px]">All Settled</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 whitespace-nowrap">
                                    {vehicles.length > 0 ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setViewingVinList({
                                            variant: row.variant,
                                            colour: row.colour,
                                            vehicles
                                          });
                                        }}
                                        className="px-2.5 py-1 rounded bg-surface border border-line hover:border-accent text-accent text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer hover:bg-accent/10"
                                        title="Click to view chassis VIN numbers & yard locations in popup modal"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-accent" />
                                        <span>{vehicles.length} Stock Units</span>
                                      </button>
                                    ) : (
                                      <span className="text-ink-3 font-mono text-xs">—</span>
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
              )}
{/* TAB 2: CUSTOMER INDENT ORDERS (With full customer profile) */}
              {modalActiveTab === 'CUSTOMERS' && (
                <div className="border border-line rounded overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs min-w-[1100px]">
                      <thead className="bg-accent-soft border-b border-accent-line text-accent font-semibold uppercase tracking-[0.06em] text-label">
                        <tr>
                          <th className="py-2.5 px-3 w-8 text-center whitespace-nowrap">#</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Receipt No & Date</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Customer Name & Phone</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Vehicle Specification</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Sales Consultant & TL</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">Advance Received</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Delivery & Financer</th>
                          <th className="py-2.5 px-3 text-center whitespace-nowrap">Stock / Indent Status</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Stock VIN / Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line text-ink-2">
                        {filteredModalBookings.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-10 text-center text-ink-3">
                              <Bookmark className="w-6 h-6 mx-auto mb-1 text-ink-3 opacity-60" />
                              <p className="font-semibold text-ink">No Customer Orders Found</p>
                              <p className="text-[11px] text-ink-3 mt-0.5">Try clearing filters or search criteria.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredModalBookings.map((row, rIdx) => (
                            <tr key={row.id || rIdx} className="hover:bg-canvas transition-colors">
                              <td className="py-2.5 px-3 text-center text-ink-3 font-mono text-[11px] whitespace-nowrap">
                                {rIdx + 1}
                              </td>
                              <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                                <span className="font-semibold text-ink block">{row.receipt_no}</span>
                                <span className="text-[10px] text-ink-3">{formatDate(row.receipt_date)}</span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <strong className="text-ink block">{row.customer_name}</strong>
                                <span className="text-[11px] font-mono text-ink-3">{row.mobile_number}</span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className="font-semibold text-ink block">{row.variant}</span>
                                <div className="flex items-center gap-1 text-[11px] text-ink-3">
                                  <Palette className="w-3 h-3 text-accent" />
                                  <span>{row.colour}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className="text-ink font-medium block">{row.sales_consultant}</span>
                                <span className="text-[10px] text-ink-3">TL: {row.team_leader}</span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-ink tnum whitespace-nowrap">
                                ₹{row.receipt_amt.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className="text-ink block font-medium">
                                  {row.delivery_date ? formatDate(row.delivery_date) : 'Pending'}
                                </span>
                                <span className="text-[10px] text-ink-3">{row.hypothecation}</span>
                              </td>
                              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                {row.stockStatus === 'ALLOCATED' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ok/10 text-ok border border-ok/30">
                                    Allocated (VIN Tagged)
                                  </span>
                                ) : row.stockStatus === 'PBNA' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-warn/10 text-warn border border-warn/30">
                                    PBNA (In Stock)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-danger/10 text-danger border border-danger/30">
                                    Not in Stock (Indent Required)
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                                {row.matchedStockVin ? (
                                  <div>
                                    <span className="font-bold text-accent block">{row.matchedStockVin}</span>
                                    <span className="text-[10px] text-ink-3 font-sans">{row.matchedLocation}</span>
                                  </div>
                                ) : (
                                  <span className="text-danger font-semibold text-[10px]">Factory Order Needed</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-line bg-canvas flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-ink-3">
                {activeModalData.name} • {modalActiveTab === 'MATRIX' ? `${filteredMatrixRows.length} Configurations` : `${filteredModalBookings.length} Orders`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="h-8 px-3 rounded bg-surface border border-line text-xs font-semibold text-ink flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-ink-3" />
                  <span>Download CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModalModel(null)}
                  className="h-8 px-4 rounded bg-accent text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FREE STOCK VINS POPUP MODAL (EYE ICON CLICK - FULL STOCK DETAILS)     */}
      {/* ========================================================================= */}
      {viewingVinList && (
        <div 
          style={{ zIndex: 99999 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in"
        >
          <div 
            style={{ zIndex: 100000 }}
            className="bg-surface text-ink w-full max-w-3xl rounded-panel overflow-hidden border border-line shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95"
          >
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-ink">Chassis VIN & Stockyard Inventory Details</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ok/10 text-ok border border-ok/30">
                      {viewingVinList.vehicles.length} Units Free in Stock
                    </span>
                  </div>
                  <p className="text-xs text-ink-3">
                    {viewingVinList.variant} • {viewingVinList.colour}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingVinList(null)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              
              <div className="flex items-center justify-between bg-accent-soft p-3 rounded border border-accent/20">
                <div className="flex items-center gap-2 text-ink font-semibold">
                  <Warehouse className="w-4 h-4 text-accent" />
                  <span>Physical Units Matched with Live Dealership Stock Sheet</span>
                </div>
                <span className="text-xs font-bold text-ok">
                  All {viewingVinList.vehicles.length} Units Ready for Allocation
                </span>
              </div>

              <div className="border border-line rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-accent-soft border-b border-accent-line text-accent font-semibold uppercase tracking-[0.06em] text-label">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-3">Chassis VIN Number</th>
                      <th className="py-2.5 px-3">Current Stockyard</th>
                      <th className="py-2.5 px-3 text-right">Ageing (Days)</th>
                      <th className="py-2.5 px-3">Billing Date</th>
                      <th className="py-2.5 px-3 text-center">PDI Status</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-2">
                    {viewingVinList.vehicles.map((veh, vIdx) => (
                      <tr key={veh.vin || vIdx} className="hover:bg-canvas transition-colors">
                        <td className="py-2.5 px-3 text-center text-ink-3 font-mono text-[11px]">
                          {vIdx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-ink whitespace-nowrap">
                          <span className="text-accent">{veh.vin}</span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-ink whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Warehouse className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span>{veh.location}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-ink tnum whitespace-nowrap">
                          {veh.ageing_days} Days
                        </td>
                        <td className="py-2.5 px-3 text-ink-3 whitespace-nowrap">
                          {veh.purchase_date ? formatDate(veh.purchase_date) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ok/10 text-ok border border-ok/20">
                            {veh.status || 'RECEIVED'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <Link
                            to="/vehicles"
                            onClick={() => {
                              setViewingVinList(null);
                              setSelectedModalModel(null);
                            }}
                            className="px-2.5 py-1 bg-surface border border-line hover:border-accent text-accent rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs"
                          >
                            <span>Open in Stock</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-line bg-canvas flex items-center justify-between">
              <span className="text-xs text-ink-3">
                Total {viewingVinList.vehicles.length} Physical Units Available in Yards
              </span>
              <button
                type="button"
                onClick={() => setViewingVinList(null)}
                className="h-8 px-4 rounded bg-accent text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
