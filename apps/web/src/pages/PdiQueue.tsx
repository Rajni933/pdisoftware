import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, ChevronRight, FileSpreadsheet,
  FileText, Clock, AlertTriangle, Car, ClipboardCheck, ListChecks
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand } from '../data/seedData';
import { fetchVehicles } from '../services/dataService';
import { Empty } from '../components/ui/primitives';

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

export const PdiQueuePage: React.FC = () => {
  const { currentBrand } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'PENDING' | 'DEFECTS'>('ALL');
  const [pdiSessions, setPdiSessions] = useState<PdiInspectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPdiQueue();

    const handleStockUpdate = () => {
      fetchPdiQueue();
    };
    window.addEventListener('stock-updated', handleStockUpdate);
    return () => {
      window.removeEventListener('stock-updated', handleStockUpdate);
    };
  }, [currentBrand?.code]);

  const mapPdi = (rows: any[]) => {
    return rows
      .filter((v: any) => v.status === 'PDI_PENDING' || v.status === 'PDI_IN_PROGRESS' || v.status === 'RECEIVED')
      .map((v: any) => ({
        id: v.id || v.vin,
        vin: v.vin,
        brand: v.brand || (v.vin?.startsWith('MAL') ? 'HYUNDAI' : 'TATA'),
        model: v.model || 'OEM Vehicle',
        variant: v.variant || 'Standard',
        color: v.color || 'White',
        yardLocation: v.location || 'Central Yard • Bay 1',
        inspector: v.inspector_name || 'Senior PDI Inspector',
        progress: v.status === 'PDI_IN_PROGRESS' ? 65 : 0,
        passed: v.status === 'PDI_IN_PROGRESS' ? 42 : 0,
        failed: 0,
        total: 64,
        status: v.status === 'RECEIVED' ? 'PENDING_START' : v.status,
        startedAt: '10:30 AM',
        elapsedTime: v.status === 'PDI_IN_PROGRESS' ? '24 mins' : 'Not Started'
      }));
  };

  const fetchPdiQueue = async () => {
    setLoading(true);
    try {
      const liveVehicles = await fetchVehicles(currentBrand?.code);
      if (liveVehicles && liveVehicles.length > 0) {
        setPdiSessions(mapPdi(liveVehicles));
        setLoading(false);
        return;
      }
      setPdiSessions(mapPdi(getVehiclesForBrand(currentBrand?.code || '')));
    } catch (e) {
      setPdiSessions(mapPdi(getVehiclesForBrand(currentBrand?.code || '')));
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (filteredSessions.length === 0) {
      alert('No PDI sessions to export.');
      return;
    }
    const headers = ['#', 'VIN / Chassis', 'Brand', 'Model', 'Variant', 'Colour', 'Assigned Inspector', 'Staging Bay', 'Status', 'Passed', 'Total', 'Progress (%)', 'Duration'];
    const rows = filteredSessions.map((s, idx) => [
      idx + 1,
      s.vin,
      s.brand,
      s.model,
      s.variant,
      s.color,
      s.inspector,
      s.yardLocation,
      s.status,
      s.passed,
      s.total,
      `${s.progress}%`,
      s.elapsedTime
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dhoot_PDI_Queue_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSessions = pdiSessions.filter(s => {
    const matchesSearch = s.vin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'IN_PROGRESS') return matchesSearch && s.status === 'PDI_IN_PROGRESS';
    if (statusFilter === 'PENDING') return matchesSearch && s.status !== 'PDI_IN_PROGRESS';
    if (statusFilter === 'DEFECTS') return matchesSearch && s.failed > 0;
    return matchesSearch;
  });

  const inProgressCount = pdiSessions.filter(s => s.status === 'PDI_IN_PROGRESS').length;
  const pendingCount = pdiSessions.filter(s => s.status !== 'PDI_IN_PROGRESS').length;
  const defectsCount = pdiSessions.filter(s => s.failed > 0).length;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto select-none pb-16">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER                                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Car className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink tracking-tight">PDI Inspection Queue</h1>
            <p className="text-xs text-ink-3">
              Manage 64-point vehicle quality checklists, track inspector progress, and approve certifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <Link
            to="/receiving"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-white hover:bg-slate-50 text-xs font-semibold text-ink shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-ink-3" />
            <span>Receive New Car</span>
          </Link>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 4 KPI METRIC SUMMARY CARDS                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* TOTAL IN QUEUE */}
        <div className="bg-white rounded-xl border border-line p-4 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-ink-3 uppercase">
              TOTAL IN QUEUE
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum">
              {pdiSessions.length}
            </span>
          </div>
          <div className="text-xs text-ink-3">Awaiting Certification</div>
        </div>

        {/* IN INSPECTION */}
        <div className="bg-white rounded-xl border border-line p-4 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-ink-3 uppercase">
              IN INSPECTION
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum">
              {inProgressCount}
            </span>
          </div>
          <div className="text-xs text-ink-3">Engineers Active</div>
        </div>

        {/* PENDING START */}
        <div className="bg-white rounded-xl border border-line p-4 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-ink-3 uppercase">
              PENDING START
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum">
              {pendingCount}
            </span>
          </div>
          <div className="text-xs text-ink-3">Bay Staged</div>
        </div>

        {/* DEFECTS FLAGGED */}
        <div className="bg-white rounded-xl border border-line p-4 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-ink-3 uppercase">
              DEFECTS FLAGGED
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum">
              {defectsCount}
            </span>
          </div>
          <div className="text-xs text-ink-3">Zero Critical Blockers</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN INSPECTION TABLE PANEL                                            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-line shadow-xs overflow-hidden">
        {/* Card Header with Filters */}
        <div className="px-4 py-3 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ListChecks className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h2 className="text-sm font-bold text-ink tracking-tight">Inspection Roster</h2>
          </div>

          {/* Segmented Filter Switcher */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg border border-slate-200/70 self-start md:self-auto">
            {(['ALL', 'IN_PROGRESS', 'PENDING', 'DEFECTS'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-blue-950 text-white shadow-xs'
                    : 'text-ink-2 hover:text-ink'
                }`}
              >
                {tab === 'ALL' ? 'All Sessions' : tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search VIN, model, inspector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-canvas border border-line rounded-lg text-ink placeholder:text-ink-3 focus:outline-none focus:border-line-strong transition-colors"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-blue-50/50 border-b border-line text-[11px] font-bold uppercase tracking-wider text-blue-950/70">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">VIN / CHASSIS</th>
                <th className="py-2.5 px-3">MODEL &amp; VARIANT</th>
                <th className="py-2.5 px-3">COLOUR</th>
                <th className="py-2.5 px-3">ASSIGNED INSPECTOR</th>
                <th className="py-2.5 px-3">STAGING BAY</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 w-36">CHECKLIST PROGRESS</th>
                <th className="py-2.5 px-3">DURATION</th>
                <th className="py-2.5 px-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-6">
                    <div className="space-y-2.5">
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                    </div>
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6">
                    <Empty
                      title="0 Inspection Sessions Found"
                      hint={searchTerm || statusFilter !== 'ALL'
                        ? "Try resetting filters or search query to find PDI sessions."
                        : "Receive a carrier trailer at gate inward or import stock to start inspection."}
                      action={
                        <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
                          <Link to="/receiving" className="btn btn-primary text-xs h-8 px-3.5">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Receive Gate Inward
                          </Link>
                          <Link to="/vehicles" className="btn btn-secondary text-xs h-8 px-3.5">
                            <Car className="w-3.5 h-3.5 mr-1" /> View Vehicle Stock
                          </Link>
                        </div>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s, idx) => {
                  const isHyundai = s.model.toLowerCase().includes('hyundai') || s.vin.startsWith('MAL');
                  return (
                    <tr key={s.id} className="hover:bg-canvas transition-colors">
                      <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-ink">
                        {s.vin.length > 5 ? (
                          <>
                            <span className="text-ink-2">{s.vin.slice(0, -5)}</span>
                            <span className="text-blue-600 font-bold">{s.vin.slice(-5)}</span>
                          </>
                        ) : (
                          s.vin
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${isHyundai ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {isHyundai ? 'Hyundai' : 'Tata'}
                          </span>
                          <span className="font-semibold text-ink">{s.model}</span>
                        </div>
                        <div className="text-[10px] text-ink-3 mt-0.5">{s.variant}</div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-2">
                        {s.color}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 font-medium">
                        {s.inspector}
                      </td>
                      <td className="py-2.5 px-3 text-ink">
                        {s.yardLocation}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          s.status === 'PDI_IN_PROGRESS'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : s.status === 'DEFECTS_FLAGGED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {s.status === 'PDI_IN_PROGRESS' ? 'In Progress' : s.status === 'DEFECTS_FLAGGED' ? 'Defect Flagged' : 'Pending Start'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="space-y-1 min-w-[90px]">
                          <div className="flex justify-between text-[10px] font-mono tnum">
                            <span className="text-ink-3">{s.passed}/{s.total}</span>
                            <span className="font-semibold text-ink">{s.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 border border-line rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${s.progress > 0 ? 'bg-blue-600' : 'bg-amber-500'}`}
                              style={{ width: `${s.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 font-mono text-[11px] whitespace-nowrap">
                        {s.elapsedTime}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {s.progress > 0 ? (
                          <Link
                            to={`/pdi/${s.id}`}
                            className="h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                          >
                            <span>Resume</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <Link
                            to={`/pdi/${s.id}`}
                            className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                          >
                            <span>Start PDI</span>
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

    </div>
  );
};
