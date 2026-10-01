import { formatDate } from '../utils/dateUtils';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, ChevronRight, Download,
  Trash2, AlertOctagon, AlertTriangle, Loader2, X, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand } from '../data/seedData';
import { deleteVehicleRecord, deleteMultipleVehicleRecords } from '../services/dataService';
import { Panel, Stat, Badge, Bar, Empty, PageHeader } from '../components/ui/primitives';

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
  const { currentBrand, canDelete } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'PENDING' | 'DEFECTS'>('ALL');
  const [pdiSessions, setPdiSessions] = useState<PdiInspectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Deletion & Multi-selection State
  const [selectedPdiVins, setSelectedPdiVins] = useState<Set<string>>(new Set());
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<PdiInspectionItem | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isManagePdiModalOpen, setIsManagePdiModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchPdiQueue();
    const handleStockUpdated = () => fetchPdiQueue();
    window.addEventListener('stock-updated', handleStockUpdated);
    return () => window.removeEventListener('stock-updated', handleStockUpdated);
  }, [currentBrand?.code]);

  const mapPdi = (rows: any[]) => {
    return rows
      .filter((v: any) => v.status === 'PDI_PENDING' || v.status === 'PDI_IN_PROGRESS' || v.status === 'RECEIVED' || v.status === 'NEW CAR' || !v.status)
      .map((v: any) => ({
        id: v.id || v.vin,
        vin: v.vin,
        brand: v.brand || (v.vin?.startsWith('MAL') ? 'HYUNDAI' : 'TATA'),
        model: v.model || 'OEM Vehicle',
        variant: v.variant || 'Standard',
        color: v.color || 'White',
        yardLocation: v.location || 'Jodhpur (Basni) • Staging',
        inspector: v.inspector_name || 'Senior PDI Inspector',
        progress: v.status === 'PDI_IN_PROGRESS' ? 65 : 0,
        passed: v.status === 'PDI_IN_PROGRESS' ? 42 : 0,
        failed: 0,
        total: 64,
        status: (v.status === 'RECEIVED' || v.status === 'NEW CAR' || !v.status) ? 'PENDING_START' : v.status,
        startedAt: v.status === 'PDI_IN_PROGRESS' ? '10:30 AM' : '—',
        elapsedTime: v.status === 'PDI_IN_PROGRESS' ? '24 mins' : 'Not Started'
      }));
  };

  const fetchPdiQueue = async () => {
    setLoading(true);
    try {
      const orgParam = currentBrand && currentBrand.code !== 'DHOOT-ALL' ? `?organization_id=${currentBrand.orgId}` : '';
      const res = await fetch(getApiUrl(`/api/v1/stock${orgParam}`));
      if (res.ok) {
        const json = await res.json();
        const rows = json.data || [];
        if (rows.length > 0) {
          setPdiSessions(mapPdi(rows));
          setLoading(false);
          return;
        }
      }
      setPdiSessions(mapPdi(getVehiclesForBrand(currentBrand.code)));
    } catch (e) {
    } finally {
      setLoading(false);
    }
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

  const handleExportPdiCSV = () => {
    if (pdiSessions.length === 0) return;
    const headers = [
      'VIN / Chassis',
      'Brand',
      'Model',
      'Variant',
      'Color',
      'Stockyard Location',
      'Assigned Inspector',
      'Status',
      'Inspection Progress',
      'Passed Points',
      'Total Checkpoints'
    ];

    const rows = pdiSessions.map(s => [
      `"${s.vin || ''}"`,
      `"${s.brand || ''}"`,
      `"${s.model || ''}"`,
      `"${s.variant || ''}"`,
      `"${s.color || ''}"`,
      `"${s.yardLocation || 'Central Stockyard'}"`,
      `"${s.inspector || ''}"`,
      `"${s.status || ''}"`,
      `"${s.progress || 0}%"`,
      `"${s.passed || 0}"`,
      `"${s.total || 64}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PDI_Inspection_Queue_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------------------
  // Multi-Selection & Deletion Handlers
  // -------------------------------------------------------------------------
  const handleToggleSelectPdi = (vin: string) => {
    setSelectedPdiVins(prev => {
      const next = new Set(prev);
      if (next.has(vin)) next.delete(vin);
      else next.add(vin);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedPdiVins.size === filteredSessions.length && filteredSessions.length > 0) {
      setSelectedPdiVins(new Set());
    } else {
      setSelectedPdiVins(new Set(filteredSessions.map(s => s.vin).filter(Boolean)));
    }
  };

  const handleClearSelection = () => {
    setSelectedPdiVins(new Set());
  };

  const handleConfirmSingleDelete = async () => {
    if (!canDelete || !singleDeleteTarget) return;
    setIsDeleting(true);
    const vin = singleDeleteTarget.vin;
    try {
      const success = await deleteVehicleRecord(vin);
      if (success) {
        await fetchPdiQueue();
        setSelectedPdiVins(prev => {
          const next = new Set(prev);
          next.delete(vin);
          return next;
        });
        setActionFeedback(`Vehicle ${vin} successfully removed from PDI queue.`);
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (err: any) {
      console.error('Error deleting PDI vehicle:', err);
      setActionFeedback(`Error deleting inspection: ${err.message || 'Operation failed'}`);
    } finally {
      setIsDeleting(false);
      setSingleDeleteTarget(null);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (!canDelete || selectedPdiVins.size === 0) return;
    setIsDeleting(true);
    const vins = Array.from(selectedPdiVins);
    try {
      const count = await deleteMultipleVehicleRecords(vins);
      await fetchPdiQueue();
      setSelectedPdiVins(new Set());
      setActionFeedback(`${count} vehicle inspection sessions permanently removed from queue.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      console.error('Error deleting PDI vehicles:', err);
      setActionFeedback(`Error deleting selected vehicles: ${err.message || 'Operation failed'}`);
    } finally {
      setIsDeleting(false);
      setIsBulkDeleteModalOpen(false);
    }
  };

  const handlePurgePdiQueue = async () => {
    if (!canDelete || pdiSessions.length === 0) return;
    setIsDeleting(true);
    const allVins = pdiSessions.map(s => s.vin);
    try {
      const count = await deleteMultipleVehicleRecords(allVins);
      await fetchPdiQueue();
      setSelectedPdiVins(new Set());
      setActionFeedback(`PDI queue cleared (${count} inspection records removed).`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      console.error('Error clearing PDI queue:', err);
      setActionFeedback(`Error clearing queue: ${err.message || 'Operation failed'}`);
    } finally {
      setIsDeleting(false);
      setIsManagePdiModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* Header Banner */}
      <PageHeader
        title="PDI Inspection Queue"
        subtitle="Manage 64-point vehicle quality checklists, track inspector progress, and approve certifications"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/receiving"
              className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-ink-3" />
              <span>Receive New Car</span>
            </Link>
            <button
              onClick={handleExportPdiCSV}
              className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-ok" />
              <span>Export CSV</span>
            </button>

            {canDelete && (
              <button
                type="button"
                onClick={() => setIsManagePdiModalOpen(true)}
                className="h-8 px-3.5 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Manage and purge PDI queue"
              >
                <Trash2 className="w-3.5 h-3.5 text-danger" />
                <span>Manage Queue</span>
              </button>
            )}
          </div>
        }
      />

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3 bg-accent-soft border border-accent/20 rounded flex items-center justify-between text-xs text-accent">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent" />
            <span className="font-semibold">{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-accent hover:opacity-80 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total In Queue" value={pdiSessions.length} note="Awaiting Certification" />
        <Stat label="In Inspection" value={inProgressCount} note="Engineers Active" tone="accent" />
        <Stat label="Pending Start" value={pendingCount} note="Yard Staged" tone="warn" />
        <Stat label="Defects Flagged" value={0} note="Zero Critical Blockers" tone="ok" />
      </div>

      {/* Main Inspection Table Panel */}
      <Panel
        title="Inspection Roster"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-canvas border border-line rounded p-0.5 text-xs">
              {(['ALL', 'IN_PROGRESS', 'PENDING', 'DEFECTS'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`h-6 px-2.5 rounded-chip text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-surface text-ink border border-line shadow-xs font-semibold'
                      : 'text-ink-3 hover:text-ink-2'
                  }`}
                >
                  {tab === 'ALL' ? 'All Sessions' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search VIN, model, inspector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-7 pl-7 pr-2.5 text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-line-strong"
              />
            </div>
          </div>
        }
      >
        {canDelete && selectedPdiVins.size > 0 && (
          <div className="mb-3 p-3 bg-canvas border border-line rounded flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink">
                <span className="font-mono tnum text-accent">{selectedPdiVins.size}</span> vehicle(s) selected
              </span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-ink-3 hover:text-ink underline text-[11px] cursor-pointer"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="h-7 px-3 rounded bg-danger hover:bg-danger/90 text-white font-medium flex items-center gap-1.5 shadow-xs cursor-pointer text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedPdiVins.size})</span>
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-canvas border-b border-line text-ink font-semibold uppercase tracking-[0.06em] text-xs">
              <tr>
                {canDelete && (
                  <th className="py-2.5 px-3 w-8 text-center whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={filteredSessions.length > 0 && selectedPdiVins.size === filteredSessions.length}
                      onChange={handleToggleSelectAll}
                      className="rounded border-line text-accent focus:ring-accent cursor-pointer"
                      title="Select All"
                    />
                  </th>
                )}
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">VIN / Chassis</th>
                <th className="py-2.5 px-3">Model & Variant</th>
                <th className="py-2.5 px-3">Colour</th>
                <th className="py-2.5 px-3">Assigned Inspector</th>
                <th className="py-2.5 px-3">Stockyard Location</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 w-36">Checklist Progress</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={canDelete ? 11 : 10}>
                    <Empty title="0 Inspection Sessions Found" hint="Receive a carrier trailer at gate or import stock to start inspection." />
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s, idx) => {
                  const isHyundai = s.model.toLowerCase().includes('hyundai') || s.vin.startsWith('MAL');
                  return (
                    <tr key={s.id} className="hover:bg-canvas transition-colors">
                      {canDelete && (
                        <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedPdiVins.has(s.vin)}
                            onChange={() => handleToggleSelectPdi(s.vin)}
                            className="rounded border-line text-accent focus:ring-accent cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-ink">
                        {s.vin}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Badge tone="accent">{isHyundai ? 'Hyundai' : 'Tata'}</Badge>
                          <span className="font-medium text-ink">{s.model}</span>
                        </div>
                        <div className="text-[10px] text-ink-3">{s.variant}</div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-2">
                        {s.color}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2">
                        {s.inspector}
                      </td>
                      <td className="py-2.5 px-3 text-ink">
                        {s.yardLocation}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <Badge tone={s.status === 'PDI_IN_PROGRESS' ? 'accent' : 'warn'}>
                          {s.status === 'PDI_IN_PROGRESS' ? 'In Progress' : 'Pending Start'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="space-y-1 min-w-[90px]">
                          <div className="flex justify-between text-[10px] tnum">
                            <span className="text-ink-3">{s.passed}/{s.total}</span>
                            <span className="font-medium text-ink">{s.progress}%</span>
                          </div>
                          <Bar pct={s.progress} tone={s.progress > 0 ? 'accent' : 'warn'} />
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 tnum text-[11px] whitespace-nowrap">
                        {s.elapsedTime}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {s.progress > 0 ? (
                            <Link
                              to={`/pdi/${s.id}`}
                              className="h-7 px-3 rounded bg-accent text-white hover:bg-accent-600 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
                            >
                              <span>Resume</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <Link
                              to={`/pdi/${s.id}`}
                              className="h-7 px-3 rounded bg-ok text-white hover:bg-ok/90 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
                            >
                              <span>Start PDI</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setSingleDeleteTarget(s)}
                              className="h-7 w-7 rounded bg-surface border border-line hover:border-danger/40 hover:bg-danger/10 hover:text-danger text-ink-3 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                              title="Delete vehicle from PDI queue"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ========================================================================= */}
      {/* MODAL: SINGLE VEHICLE PDI DELETION CONFIRMATION                            */}
      {/* ========================================================================= */}
      {singleDeleteTarget && (
        <div className="fixed inset-0 z-modal bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-surface border border-line rounded-panel p-6 shadow-modal select-none">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center border border-danger/20 shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">Delete Vehicle from PDI Queue?</h3>
                <p className="text-xs text-ink-3">This action will remove the inspection record and vehicle from the active queue.</p>
              </div>
            </div>

            <div className="p-3 bg-canvas border border-line rounded mb-4 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-ink-3 font-sans">VIN / Chassis:</span>
                <span className="font-semibold text-ink tnum">{singleDeleteTarget.vin}</span>
              </div>
              <div className="flex justify-between font-sans">
                <span className="text-ink-3">Model & Variant:</span>
                <span className="text-ink">{singleDeleteTarget.model} {singleDeleteTarget.variant}</span>
              </div>
              <div className="flex justify-between font-sans">
                <span className="text-ink-3">Inspector:</span>
                <span className="text-ink">{singleDeleteTarget.inspector}</span>
              </div>
            </div>

            <p className="text-xs text-danger mb-5">
              Warning: Deleting this vehicle will cancel its current PDI checklist and remove it from local and database storage.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSingleDeleteTarget(null)}
                disabled={isDeleting}
                className="h-8 px-4 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                disabled={isDeleting}
                className="h-8 px-4 rounded bg-danger hover:bg-danger/90 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Vehicle'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BULK DELETE VEHICLES CONFIRMATION                                  */}
      {/* ========================================================================= */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-modal bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-surface border border-line rounded-panel p-6 shadow-modal select-none">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center border border-danger/20 shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">Delete Selected Vehicles?</h3>
                <p className="text-xs text-ink-3">Permanently remove selected inspection sessions from queue.</p>
              </div>
            </div>

            <div className="p-3 bg-canvas border border-line rounded mb-4 text-xs font-medium text-ink">
              You are about to delete <span className="font-mono tnum font-bold text-danger">{selectedPdiVins.size}</span> vehicle(s) from the PDI queue.
            </div>

            <p className="text-xs text-danger mb-5">
              This action cannot be undone. All associated inspection checklists will be removed.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isDeleting}
                className="h-8 px-4 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isDeleting}
                className="h-8 px-4 rounded bg-danger hover:bg-danger/90 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Deleting...' : `Delete ${selectedPdiVins.size} Vehicles`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANAGE PDI QUEUE (PURGE / RE-SYNC)                                 */}
      {/* ========================================================================= */}
      {isManagePdiModalOpen && (
        <div className="fixed inset-0 z-modal bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-surface border border-line rounded-panel p-6 shadow-modal select-none">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-danger/10 text-danger flex items-center justify-center border border-danger/20">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Manage PDI Inspection Queue</h3>
                  <p className="text-xs text-ink-3">Queue administration & supervisory maintenance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManagePdiModalOpen(false)}
                className="text-ink-3 hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="p-3.5 bg-canvas border border-line rounded flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-ink">Purge Entire PDI Queue</h4>
                  <p className="text-[11px] text-ink-3 mt-0.5">
                    Remove all {pdiSessions.length} active vehicle inspection records from queue.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePurgePdiQueue}
                  disabled={isDeleting || pdiSessions.length === 0}
                  className="h-8 px-3 rounded bg-danger hover:bg-danger/90 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Purge Queue</span>
                </button>
              </div>

              <div className="p-3.5 bg-canvas border border-line rounded flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-ink">Reload Demonstration Inventory</h4>
                  <p className="text-[11px] text-ink-3 mt-0.5">
                    Re-sync queue with baseline vehicles from central inventory.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setIsDeleting(true);
                    await fetchPdiQueue();
                    setIsDeleting(false);
                    setIsManagePdiModalOpen(false);
                    setActionFeedback('Queue re-synchronized with central vehicle inventory.');
                    setTimeout(() => setActionFeedback(null), 4000);
                  }}
                  disabled={isDeleting}
                  className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-accent" />
                  <span>Re-sync Queue</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsManagePdiModalOpen(false)}
                className="h-8 px-4 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink cursor-pointer"
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
