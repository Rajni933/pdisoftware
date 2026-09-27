import React, { useState, useEffect } from 'react';
import { 
  Check, Search, Download, CheckCircle2, Wrench, X, AlertTriangle, FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchRepairs, updateRepairStatus } from '../services/dataService';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';

export const RepairsPage: React.FC = () => {
  const { currentBrand, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Rectification Modal State
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [techName, setTechName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRepairs();
  }, [currentBrand?.code]);

  const loadRepairs = async () => {
    setLoading(true);
    try {
      const data = await fetchRepairs(currentBrand?.code);
      setTickets(data);
    } catch (e) {
      console.error("Repairs fetch err", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRectifyModal = (ticket: any) => {
    setActiveTicket(ticket);
    setActionNotes(ticket.actionTaken || '');
    setPartsUsed(ticket.partsUsed || '');
    setTechName(ticket.assignedTo || user?.userName || 'Senior Workshop Technician');
  };

  const handleConfirmRectify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;
    setIsSubmitting(true);
    try {
      await updateRepairStatus(
        activeTicket.id,
        activeTicket.vin,
        'COMPLETED',
        actionNotes.trim() || 'Defect rectified per OEM standard procedure. Vehicle cleared for QA re-inspection.',
        partsUsed.trim() || 'None / Consumables Only',
        techName.trim()
      );
      setActiveTicket(null);
      await loadRepairs();
    } catch (err) {
      console.error('Failed to update repair status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real CSV Export
  const handleExportRepairsCSV = () => {
    if (tickets.length === 0) return;
    const headers = [
      'Ticket ID',
      'VIN / Chassis',
      'Brand',
      'Model',
      'Defect Area',
      'Severity',
      'Description',
      'Assigned Technician',
      'Stockyard Location',
      'Status',
      'Action Taken / Rectification',
      'Parts Used',
      'Created Date'
    ];

    const rows = tickets.map(t => [
      `"${t.id || ''}"`,
      `"${t.vin || ''}"`,
      `"${t.brand || ''}"`,
      `"${t.model || ''}"`,
      `"${t.defectArea || t.area || ''}"`,
      `"${t.severity || ''}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.assignedTo || ''}"`,
      `"${t.location || 'Stockyard Workshop'}"`,
      `"${t.status || ''}"`,
      `"${(t.actionTaken || '').replace(/"/g, '""')}"`,
      `"${(t.partsUsed || '').replace(/"/g, '""')}"`,
      `"${t.createdAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Workshop_Repairs_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* Header Banner */}
      <PageHeader
        title="Defect Repairs & Workshop"
        subtitle="Manage job cards, log technician rectifications for inspection defects, and clear vehicles for QA re-inspection"
        action={
          <button
            onClick={handleExportRepairsCSV}
            className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-ok" />
            <span>Export CSV</span>
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total Job Cards" value={tickets.length} note="Logged from Inspections" />
        <Stat label="In Workshop" value={openCount} note="Under Rectification" tone={openCount > 0 ? 'warn' : 'default'} />
        <Stat label="Completed" value={completedCount} note="QA Clearance Ready" tone="ok" />
        <Stat label="Avg Turnaround" value="1.4h" note="Within Service SLA" />
      </div>

      {/* Main Repair Ledger Panel */}
      <Panel
        title="Repair Tickets Ledger"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-canvas border border-line rounded p-0.5 text-xs">
              {(['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`h-6 px-2.5 rounded-chip text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-surface text-ink border border-line shadow-xs font-semibold'
                      : 'text-ink-3 hover:text-ink-2'
                  }`}
                >
                  {tab === 'ALL' ? 'All Tickets' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search VIN, Model, Defect, Tech..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-7 pl-7 pr-2.5 text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-line-strong"
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-canvas border-b border-line text-ink font-semibold uppercase tracking-[0.06em] text-xs">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">VIN / Chassis</th>
                <th className="py-2.5 px-3">Brand & Model</th>
                <th className="py-2.5 px-3">Defect Area</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Issue Description</th>
                <th className="py-2.5 px-3">Assigned Tech</th>
                <th className="py-2.5 px-3">Stockyard Location</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-ink-3">
                    Loading repair job cards from database...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <Empty title="0 Active Repair Tickets Found" hint="All vehicle inspections have passed without defects requiring workshop repair." />
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t, idx) => {
                  const isHyundai = (t.brand || '').toLowerCase().includes('hyundai') || (t.model || '').toLowerCase().includes('hyundai') || (t.vin || '').startsWith('MAL');
                  return (
                    <tr key={t.id} className="hover:bg-canvas transition-colors">
                      <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-ink">
                        {t.id}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-ink">
                        {t.vin}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Badge tone="accent">{isHyundai ? 'Hyundai' : 'Tata'}</Badge>
                          <span className="font-medium text-ink">{t.model}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-2">
                        {t.defectArea || t.area || 'General'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tone={t.severity === 'CRITICAL' ? 'danger' : t.severity === 'MAJOR' ? 'warn' : 'neutral'}>
                          {t.severity}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 max-w-xs truncate" title={t.description}>
                        {t.description}
                      </td>
                      <td className="py-2.5 px-3 text-ink">
                        {t.assignedTo || 'Senior Bodyshop Tech'}
                      </td>
                      <td className="py-2.5 px-3 text-ink">
                        {t.location || 'Central Stockyard Workshop'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tone={t.status === 'COMPLETED' ? 'ok' : 'warn'}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {t.status !== 'COMPLETED' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenRectifyModal(t)}
                            className="h-7 px-2.5 rounded bg-ok text-white text-xs font-semibold transition-colors inline-flex items-center gap-1 whitespace-nowrap shadow-xs cursor-pointer hover:bg-ok-hover"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Mark Repaired</span>
                          </button>
                        ) : (
                          <span className="text-xs text-ok font-semibold inline-flex items-center gap-1 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Cleared
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
      </Panel>

      {/* Rectification Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-modal bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-surface border border-line rounded-panel p-6 shadow-modal select-none">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-warn/10 text-warn flex items-center justify-center border border-warn/20">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Defect Rectification Sign-Off</h3>
                  <p className="text-xs text-ink-3">Job Card #{activeTicket.id} • {activeTicket.vin}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="p-1 rounded text-ink-3 hover:text-ink hover:bg-canvas"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRectify} className="mt-4 space-y-4">
              <div className="p-3 bg-canvas border border-line rounded text-xs space-y-1">
                <span className="text-ink-3 block font-semibold uppercase">Flagged Defect</span>
                <p className="text-ink font-medium">{activeTicket.defectArea}: {activeTicket.description}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Action Taken / Rectification Details <span className="text-danger">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="e.g., Scratch rubbed down with 2000 grit, OEM touchup paint applied, clear coated, infrared baked and buffed to 100% gloss."
                  className="w-full text-xs p-2.5 bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-line-strong"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Parts / Consumables Used
                </label>
                <input
                  type="text"
                  value={partsUsed}
                  onChange={(e) => setPartsUsed(e.target.value)}
                  placeholder="e.g., 50ml Touchup paint (Oberon Black), Polish compound"
                  className="w-full h-8 px-2.5 text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-line-strong"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Technician In-Charge
                </label>
                <input
                  type="text"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-canvas border border-line rounded text-ink focus:outline-none focus:border-line-strong"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="h-8 px-3 rounded bg-canvas border border-line text-xs font-semibold text-ink hover:bg-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-8 px-4 rounded bg-ok hover:bg-ok-hover text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isSubmitting ? 'Recording...' : 'Confirm Rectification & Route to QA'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
