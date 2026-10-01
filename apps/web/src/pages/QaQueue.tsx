import { formatDate } from '../utils/dateUtils';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Search, Check, Download,
  Trash2, AlertOctagon, AlertTriangle, Loader2, X, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand } from '../data/seedData';
import { deleteVehicleRecord, deleteMultipleVehicleRecords } from '../services/dataService';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';

export const QaQueuePage: React.FC = () => {
  const { currentBrand, canDelete } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('PENDING');
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Deletion & Multi-selection State
  const [selectedQaVins, setSelectedQaVins] = useState<Set<string>>(new Set());
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<any | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isManageQaModalOpen, setIsManageQaModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchQaQueue();
    const handleStockUpdated = () => fetchQaQueue();
    window.addEventListener('stock-updated', handleStockUpdated);
    return () => window.removeEventListener('stock-updated', handleStockUpdated);
  }, [currentBrand?.code]);

  const mapQa = (rows: any[]) => {
    return rows
      .filter((v: any) => v.status === 'PDI_APPROVED' || v.status === 'QA_PENDING' || v.status === 'DELIVERY_READY')
      .map((v: any) => ({
        id: v.id || v.vin,
        vin: v.vin,
        model: v.model || 'OEM Vehicle',
        variant: v.variant || 'Standard',
        color: v.color || 'Standard',
        inspector: v.inspector_name || 'Senior PDI Inspector',
        passed: 42,
        failed: 0,
        submittedAt: 'Today, 11:30 AM',
        status: v.status === 'PDI_APPROVED' || v.status === 'DELIVERY_READY' ? 'APPROVED' : 'PENDING',
        certId: `CERT-${(v.vin || '').slice(-6)}`
      }));
  };

  const fetchQaQueue = async () => {
    setLoading(true);
    try {
      // 1. Check Supabase DB first
      const { supabase } = await import('../lib/supabase');
      let query = supabase.from('vehicles').select('*');
      if (currentBrand && currentBrand.code !== 'DHOOT-ALL' && currentBrand.orgId && currentBrand.orgId !== 'ALL') {
        query = query.eq('organization_id', currentBrand.orgId);
      }
      const { data: dbData } = await query;
      if (dbData && Array.isArray(dbData) && dbData.length > 0) {
        setQueue(mapQa(dbData));
        setLoading(false);
        return;
      }

      // 2. Fallback to API worker
      const orgParam = currentBrand && currentBrand.code !== 'DHOOT-ALL' ? `?organization_id=${currentBrand.orgId}` : '';
      const res = await fetch(getApiUrl(`/api/v1/stock${orgParam}`));
      if (res.ok) {
        const json = await res.json();
        const rows = json.data || [];
        if (rows.length > 0) {
          setQueue(mapQa(rows));
          setLoading(false);
          return;
        }
      }
      setQueue(mapQa(getVehiclesForBrand(currentBrand.code)));
    } catch (e) {
      setQueue(mapQa(getVehiclesForBrand(currentBrand.code)));
    } finally {
      setLoading(false);
    }
  };

  const filteredQueue = queue.filter(item => {
    const vin = (item.vin || '').toLowerCase();
    const model = (item.model || '').toLowerCase();
    const inspector = (item.inspector || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = vin.includes(search) || model.includes(search) || inspector.includes(search);
    const isApproved = item.status === 'APPROVED';
    if (statusFilter === 'PENDING') return matchesSearch && !isApproved;
    if (statusFilter === 'APPROVED') return matchesSearch && isApproved;
    return matchesSearch;
  });

  const pendingCount = queue.filter(item => item.status !== 'APPROVED').length;
  const approvedCount = queue.filter(item => item.status === 'APPROVED').length;

  const handleExportQaCSV = () => {
    if (queue.length === 0) return;
    const headers = [
      'VIN / Chassis',
      'Model & Variant',
      'Assigned Inspector',
      'Passed Checkpoints',
      'Defects Found',
      'QA Status',
      'Certificate Number',
      'Submission Timestamp'
    ];

    const rows = queue.map(item => [
      `"${item.vin || ''}"`,
      `"${item.model || ''} ${item.variant || ''}"`,
      `"${item.inspector || ''}"`,
      `"${item.passed || 64}"`,
      `"${item.failed || 0}"`,
      `"${item.status || ''}"`,
      `"${item.certId || 'N/A'}"`,
      `"${item.submittedAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `QA_Approvals_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------------------
  // Multi-Selection & Deletion Handlers
  // -------------------------------------------------------------------------
  const handleToggleSelectQa = (vin: string) => {
    setSelectedQaVins(prev => {
      const next = new Set(prev);
      if (next.has(vin)) next.delete(vin);
      else next.add(vin);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedQaVins.size === filteredQueue.length && filteredQueue.length > 0) {
      setSelectedQaVins(new Set());
    } else {
      setSelectedQaVins(new Set(filteredQueue.map(item => item.vin).filter(Boolean)));
    }
  };

  const handleClearSelection = () => {
    setSelectedQaVins(new Set());
  };

  const handleConfirmSingleDelete = async () => {
    if (!canDelete || !singleDeleteTarget) return;
    setIsDeleting(true);
    const vin = singleDeleteTarget.vin;
    try {
      const success = await deleteVehicleRecord(vin);
      if (success) {
        await fetchQaQueue();
        setSelectedQaVins(prev => {
          const next = new Set(prev);
          next.delete(vin);
          return next;
        });
        setActionFeedback(`Inspection for VIN ${vin} removed from QA approvals queue.`);
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (err: any) {
      console.error('Error deleting QA inspection:', err);
      setActionFeedback(`Error deleting inspection: ${err.message || 'Operation failed'}`);
    } finally {
      setIsDeleting(false);
      setSingleDeleteTarget(null);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (!canDelete || selectedQaVins.size === 0) return;
    setIsDeleting(true);
    const vins = Array.from(selectedQaVins);
    try {
      const count = await deleteMultipleVehicleRecords(vins);
      await fetchQaQueue();
      setSelectedQaVins(new Set());
      setActionFeedback(`${count} vehicle inspection records removed from QA approvals queue.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      console.error('Error deleting QA inspections:', err);
      setActionFeedback(`Error deleting selected inspections: ${err.message || 'Operation failed'}`);
    } finally {
      setIsDeleting(false);
      setIsBulkDeleteModalOpen(false);
    }
  };

  const handlePurgeQaQueue = async () => {
    if (!canDelete || queue.length === 0) return;
    setIsDeleting(true);
    const allVins = queue.map(item => item.vin);
    try {
      const count = await deleteMultipleVehicleRecords(allVins);
      await fetchQaQueue();
      setSelectedQaVins(new Set());
      setActionFeedback(`QA approvals queue cleared (${count} inspection records removed).`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      console.error('Error clearing QA queue:', err);
      setActionFeedback(`Error clearing QA queue: ${err.message || 'Operation failed'}`);
    } finally {
      setIsDeleting(false);
      setIsManageQaModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* Header */}
      <PageHeader
        title="QA Manager Approvals"
        subtitle="Review completed inspections, sign off quality dockets, and issue digital PDI certificates"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportQaCSV}
              className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-ok" />
              <span>Export CSV</span>
            </button>

            {canDelete && (
              <button
                type="button"
                onClick={() => setIsManageQaModalOpen(true)}
                className="h-8 px-3.5 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Manage and purge QA queue"
              >
                <Trash2 className="w-3.5 h-3.5 text-danger" />
                <span>Manage QA Queue</span>
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
        <Stat label="Total Submissions" value={queue.length} note="Inspection Reports" />
        <Stat label="Pending Review" value={pendingCount} note="Sign-off Required" tone={pendingCount > 0 ? 'warn' : 'default'} />
        <Stat label="Certified & Approved" value={approvedCount} note="Ready for Gatepass" tone="ok" />
        <Stat label="First-Pass Yield" value="98.2%" note="Zero Defect Ratio" />
      </div>

      {/* Main Table Panel */}
      <Panel
        title="QA Sign-Off Queue"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-canvas border border-line rounded p-0.5 text-xs">
              {(['ALL', 'PENDING', 'APPROVED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`h-6 px-2.5 rounded-chip text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-surface text-ink border border-line shadow-xs font-semibold'
                      : 'text-ink-3 hover:text-ink-2'
                  }`}
                >
                  {tab}
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
        {canDelete && selectedQaVins.size > 0 && (
          <div className="mb-3 p-3 bg-canvas border border-line rounded flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink">
                <span className="font-mono tnum text-accent">{selectedQaVins.size}</span> inspection(s) selected
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
                <span>Delete Selected ({selectedQaVins.size})</span>
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
                      checked={filteredQueue.length > 0 && selectedQaVins.size === filteredQueue.length}
                      onChange={handleToggleSelectAll}
                      className="rounded border-line text-accent focus:ring-accent cursor-pointer"
                      title="Select All"
                    />
                  </th>
                )}
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">VIN / Chassis</th>
                <th className="py-2.5 px-3">Brand & Model</th>
                <th className="py-2.5 px-3">Colour</th>
                <th className="py-2.5 px-3">Inspector</th>
                <th className="py-2.5 px-3">Checklist Score</th>
                <th className="py-2.5 px-3">Submitted Time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">QA Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={canDelete ? 10 : 9}>
                    <Empty title="0 QA Submissions Found" hint="Inspections submitted by engineers will appear here for final QA sign-off." />
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item, idx) => {
                  const isApproved = item.status === 'APPROVED';
                  const isHyundai = item.model.toLowerCase().includes('hyundai') || item.vin.startsWith('MAL');
                  return (
                    <tr key={item.id} className="hover:bg-canvas transition-colors">
                      {canDelete && (
                        <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedQaVins.has(item.vin)}
                            onChange={() => handleToggleSelectQa(item.vin)}
                            className="rounded border-line text-accent focus:ring-accent cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-ink">
                        {item.vin}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Badge tone="accent">{isHyundai ? 'Hyundai' : 'Tata'}</Badge>
                          <span className="font-medium text-ink">{item.model}</span>
                        </div>
                        <div className="text-[10px] text-ink-3">{item.variant}</div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-2">
                        {item.color}
                      </td>
                      <td className="py-2.5 px-3 text-ink">
                        {item.inspector}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-ok tnum">
                        {item.passed} / 42 (100% Pass)
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 tnum text-[10px]">
                        {item.submittedAt}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tone={isApproved ? 'ok' : 'warn'}>
                          {isApproved ? 'Approved & Certified' : 'QA Review Pending'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          {!isApproved ? (
                            <Link to={`/qa/review/${item.id}`} className="h-7 px-2.5 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1 whitespace-nowrap shadow-xs cursor-pointer"><span>Review & Decide</span></Link>
                          ) : (
                            <Link
                              to={`/certificates/${item.certId}`}
                              className="h-7 px-2.5 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors inline-flex items-center gap-1 whitespace-nowrap shadow-xs"
                            >
                              <FileText className="w-3.5 h-3.5 text-ok" />
                              <span>Certificate</span>
                            </Link>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setSingleDeleteTarget(item)}
                              className="h-7 w-7 rounded bg-surface border border-line hover:border-danger/40 hover:bg-danger/10 hover:text-danger text-ink-3 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                              title="Delete inspection from QA queue"
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
      {/* MODAL: SINGLE QA INSPECTION DELETION CONFIRMATION                         */}
      {/* ========================================================================= */}
      {singleDeleteTarget && (
        <div className="fixed inset-0 z-modal bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-surface border border-line rounded-panel p-6 shadow-modal select-none">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center border border-danger/20 shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">Delete Inspection from QA Queue?</h3>
                <p className="text-xs text-ink-3">Remove QA submission and vehicle from active register.</p>
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
              Warning: Deleting this item removes the inspection record from both local memory and central database.
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
                <span>{isDeleting ? 'Deleting...' : 'Delete Inspection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BULK DELETE QA INSPECTIONS CONFIRMATION                            */}
      {/* ========================================================================= */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-modal bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-surface border border-line rounded-panel p-6 shadow-modal select-none">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center border border-danger/20 shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">Delete Selected QA Submissions?</h3>
                <p className="text-xs text-ink-3">Permanently remove selected inspection sessions from queue.</p>
              </div>
            </div>

            <div className="p-3 bg-canvas border border-line rounded mb-4 text-xs font-medium text-ink">
              You are about to delete <span className="font-mono tnum font-bold text-danger">{selectedQaVins.size}</span> inspection(s) from the QA queue.
            </div>

            <p className="text-xs text-danger mb-5">
              This action cannot be undone. All selected quality approval records will be removed.
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
                <span>{isDeleting ? 'Deleting...' : `Delete ${selectedQaVins.size} Inspections`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANAGE QA QUEUE (PURGE / RE-SYNC)                                  */}
      {/* ========================================================================= */}
      {isManageQaModalOpen && (
        <div className="fixed inset-0 z-modal bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-surface border border-line rounded-panel p-6 shadow-modal select-none">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-danger/10 text-danger flex items-center justify-center border border-danger/20">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Manage QA Approvals Queue</h3>
                  <p className="text-xs text-ink-3">QA supervisor queue maintenance & purge</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManageQaModalOpen(false)}
                className="text-ink-3 hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="p-3.5 bg-canvas border border-line rounded flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-ink">Purge Entire QA Queue</h4>
                  <p className="text-[11px] text-ink-3 mt-0.5">
                    Remove all {queue.length} inspection submissions from QA approvals register.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePurgeQaQueue}
                  disabled={isDeleting || queue.length === 0}
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
                    await fetchQaQueue();
                    setIsDeleting(false);
                    setIsManageQaModalOpen(false);
                    setActionFeedback('QA queue re-synchronized with central inventory.');
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
                onClick={() => setIsManageQaModalOpen(false)}
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

