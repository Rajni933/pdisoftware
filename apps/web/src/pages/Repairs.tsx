import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, Calendar, ChevronDown, Download, Search, Check,
  FileText, Car, CheckCircle2, Clock, ListFilter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';
import { fetchRepairs as fetchRepairsService, updateRepairStatus } from '../services/dataService';
import { Empty } from '../components/ui/primitives';

export const RepairsPage: React.FC = () => {
  const { currentBrand } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepairs();

    const handleStockUpdate = () => {
      fetchRepairs();
    };
    window.addEventListener('stock-updated', handleStockUpdate);
    return () => {
      window.removeEventListener('stock-updated', handleStockUpdate);
    };
  }, [currentBrand?.code]);

  const getFilteredRepairs = (data: any[]) => {
    if (currentBrand.code === 'DHOOT-TATA') return data.filter((r: any) => r.brand === 'TATA' || (r.model && r.model.includes('Tata')));
    if (currentBrand.code === 'DHOOT-HYUNDAI') return data.filter((r: any) => r.brand === 'HYUNDAI' || (r.model && r.model.includes('Hyundai')));
    return data;
  };

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const liveTickets = await fetchRepairsService(currentBrand?.code);
      if (liveTickets && liveTickets.length > 0) {
        setTickets(liveTickets);
        setLoading(false);
        return;
      }
      setTickets([]);
    } catch (e) {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (id: string) => {
    try {
      await updateRepairStatus(id, 'COMPLETED');
      fetchRepairs();
    } catch (e) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'COMPLETED' } : t))
      );
    }
  };

  const handleExportExcel = () => {
    if (filteredTickets.length === 0) {
      alert('No repair tickets to export.');
      return;
    }
    const headers = ['#', 'Ticket ID', 'VIN / Chassis', 'Brand & Model', 'Defect Area', 'Severity', 'Issue Description', 'Assigned Tech', 'Bay', 'Status'];
    const rows = filteredTickets.map((t, idx) => [
      idx + 1,
      t.id,
      t.vin,
      t.model,
      t.area || t.finding_area || 'General',
      t.severity,
      t.description,
      t.assignedTo || t.assigned_to || 'Technician',
      t.bay || 'Bay 1',
      t.status
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dhoot_Workshop_Repairs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTickets = tickets.filter(t => {
    const vin = (t.vin || '').toLowerCase();
    const model = (t.model || '').toLowerCase();
    const tech = (t.assignedTo || t.assigned_to || '').toLowerCase();
    const desc = (t.description || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = vin.includes(search) || model.includes(search) || tech.includes(search) || desc.includes(search);
    
    if (statusFilter === 'OPEN') return matchesSearch && t.status === 'OPEN';
    if (statusFilter === 'IN_PROGRESS') return matchesSearch && t.status === 'IN_PROGRESS';
    if (statusFilter === 'COMPLETED') return matchesSearch && t.status === 'COMPLETED';
    return matchesSearch;
  });

  const openCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const completedCount = tickets.filter(t => t.status === 'COMPLETED').length;

  // Active Date display formatted nicely
  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto select-none pb-16">
      
      {/* ========================================================================= */}
      {/* 1. TOP HERO BANNER (AUTOMOTIVE WORKSHOP STUDIO THEME)                     */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-line shadow-xs bg-slate-950 p-5 sm:p-6">
        {/* Background automotive image with cinematic gradient overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: `url('/brand/login-car-bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-blue-950/75 pointer-events-none" />

        {/* Banner Content */}
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-600/25 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                <Wrench className="w-6 h-6 stroke-[2.2] -rotate-45" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Defect Repairs &amp; Workshop</h1>
                <p className="text-xs text-slate-300/90 mt-0.5">
                  Manage job cards, track technician repairs for inspection defects, and clear vehicles for QA approval
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
              {/* Date Indicator */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 text-slate-800 text-xs font-semibold shadow-xs border border-line">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentDateFormatted}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </div>

              {/* Export Excel Button */}
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* 4 Metric Summary Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
            {/* TOTAL JOB CARDS */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">
                  TOTAL JOB CARDS
                </span>
                <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum mt-0.5">
                  {tickets.length}
                </span>
                <span className="text-[11px] text-ink-3 truncate">Logged from Inspections</span>
              </div>
            </div>

            {/* ACTIVE IN BAY */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">
                  ACTIVE IN BAY
                </span>
                <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum mt-0.5">
                  {openCount}
                </span>
                <span className="text-[11px] text-ink-3 truncate">Under Rectification</span>
              </div>
            </div>

            {/* COMPLETED */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">
                  COMPLETED
                </span>
                <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum mt-0.5">
                  {completedCount}
                </span>
                <span className="text-[11px] text-ink-3 truncate">QA Clearance Ready</span>
              </div>
            </div>

            {/* AVG TURNAROUND */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">
                  AVG TURNAROUND
                </span>
                <span className="text-2xl font-bold font-mono text-ink tracking-tight tnum mt-0.5">
                  1.4h
                </span>
                <span className="text-[11px] text-ink-3 truncate">Within Service SLA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REPAIR TICKETS LEDGER PANEL                                            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-line shadow-xs overflow-hidden">
        {/* Card Header with Filters */}
        <div className="px-5 py-3.5 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ListFilter className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h2 className="text-sm font-bold text-ink tracking-tight">Repair Tickets Ledger</h2>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/70 self-start md:self-auto">
            {[
              { key: 'ALL', label: 'All Tickets' },
              { key: 'OPEN', label: 'Open' },
              { key: 'IN_PROGRESS', label: 'In Progress' },
              { key: 'COMPLETED', label: 'Completed' },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key as any)}
                className={`px-4 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                  statusFilter === tab.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-ink-2 hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search VIN, Model, Defect, Tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-9 pr-3 text-xs bg-slate-50/80 border border-line rounded-lg text-ink placeholder:text-ink-3 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 border-b border-line text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">TICKET ID</th>
                <th className="py-2.5 px-3">VIN / CHASSIS</th>
                <th className="py-2.5 px-3">BRAND &amp; MODEL</th>
                <th className="py-2.5 px-3">DEFECT AREA</th>
                <th className="py-2.5 px-3">SEVERITY</th>
                <th className="py-2.5 px-3">ISSUE DESCRIPTION</th>
                <th className="py-2.5 px-3">ASSIGNED TECH</th>
                <th className="py-2.5 px-3">BAY</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={11} className="p-6">
                    <div className="space-y-2.5">
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-6">
                    <Empty
                      title="0 Active Repair Tickets Found"
                      hint={searchTerm || statusFilter !== 'ALL'
                        ? "Try clearing search keywords or selecting 'All' in status filters."
                        : "All vehicle inspections have passed without defects requiring workshop repair."}
                      action={
                        <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
                          <Link to="/pdi" className="btn btn-primary text-xs h-8 px-3.5">
                            <Car className="w-3.5 h-3.5 mr-1" /> View PDI Queue
                          </Link>
                          <Link to="/dashboard" className="btn btn-secondary text-xs h-8 px-3.5">
                            Go to Dashboard
                          </Link>
                        </div>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t, idx) => {
                  const isHyundai = (t.model || '').toLowerCase().includes('hyundai') || (t.vin || '').startsWith('MAL');
                  return (
                    <tr key={t.id || idx} className="hover:bg-canvas transition-colors">
                      <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-600">
                        {t.id}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-ink font-semibold">
                        {(t.vin || '').length > 5 ? (
                          <>
                            <span className="text-ink-2">{(t.vin || '').slice(0, -5)}</span>
                            <span className="text-blue-600 font-bold">{(t.vin || '').slice(-5)}</span>
                          </>
                        ) : (
                          t.vin
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${isHyundai ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {isHyundai ? 'Hyundai' : 'Tata'}
                          </span>
                          <span className="font-semibold text-ink">{t.model}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-2">
                        {t.area || t.finding_area || 'General'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.severity === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : t.severity === 'MAJOR'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {t.severity || 'NORMAL'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 max-w-xs truncate" title={t.description}>
                        {t.description}
                      </td>
                      <td className="py-2.5 px-3 text-ink font-medium">
                        {t.assignedTo || t.assigned_to || 'Technician'}
                      </td>
                      <td className="py-2.5 px-3 text-ink font-mono">
                        {t.bay || 'Bay 1'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {t.status !== 'COMPLETED' ? (
                          <button
                            type="button"
                            onClick={() => markComplete(t.id)}
                            className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1 whitespace-nowrap shadow-xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Repaired</span>
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1 whitespace-nowrap">
                            <Check className="w-3.5 h-3.5" />
                            Done
                          </span>
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
