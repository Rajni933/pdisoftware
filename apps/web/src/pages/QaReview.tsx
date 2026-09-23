import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, ArrowLeft,
  X, Check, AlertOctagon, TriangleAlert,
  CircleAlert, Eye, Camera, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { fetchVehicles, approveQaInspection } from '../services/dataService';
import {
  Button, Panel, SeverityTag, Chip, Modal,
  Banner, StatusRail
} from '@autoprime/ui';

interface Finding {
  id: string;
  itemId: string;
  itemTitle: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'OBSERVATION';
  notes: string;
  photos: string[];
}

interface InspectionCategory {
  id: string;
  title: string;
  completed: number;
  total: number;
  findings: Finding[];
}

const QUICK_REASONS = [
  'Defect photo blurry / unreadable',
  'Damage severity understated',
  'Missing battery health check',
  'Odometer / chassis discrepancy',
  'Panel gap measurement omitted',
];

export const QaReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<InspectionCategory[]>([
    { id: 'exterior', title: 'Exterior & Paint Finish', completed: 12, total: 12, findings: [] },
    { id: 'interior', title: 'Interior, Dashboard & Seats', completed: 10, total: 10, findings: [] },
    { id: 'electrical', title: 'Electrical, Lamps & Infotainment', completed: 8, total: 8, findings: [] },
    { id: 'mechanical', title: 'Underbody, Tyres & Suspension', completed: 10, total: 10, findings: [] },
    { id: 'documentation', title: 'Documentation, Keys & Manuals', completed: 6, total: 6, findings: [] },
  ]);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  // Modal decision states
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const cleanId = (id || '').trim();
        // 1. Fetch vehicle from Supabase
        let targetVehicle: any = null;
        const { data: dbData } = await supabase
          .from('vehicles')
          .select('*')
          .or(`id.eq.${cleanId},vin.eq.${cleanId}`);
        if (dbData && dbData.length > 0) {
          targetVehicle = dbData[0];
        } else {
          const allVehicles = await fetchVehicles();
          targetVehicle = allVehicles.find(v => v.id === cleanId || v.vin === cleanId || (v.vin && cleanId.endsWith(v.vin.slice(-6)))) || null;
        }

        if (targetVehicle && isMounted) {
          setVehicle(targetVehicle);

          // 2. Query repair_tickets or inspection findings for this vehicle
          const { data: tickets } = await supabase
            .from('repair_tickets')
            .select('*')
            .eq('vin', targetVehicle.vin);

          const initialCats: InspectionCategory[] = [
            { id: 'exterior', title: 'Exterior & Paint Finish', completed: 12, total: 12, findings: [] },
            { id: 'interior', title: 'Interior, Dashboard & Seats', completed: 10, total: 10, findings: [] },
            { id: 'electrical', title: 'Electrical, Lamps & Infotainment', completed: 8, total: 8, findings: [] },
            { id: 'mechanical', title: 'Underbody, Tyres & Suspension', completed: 10, total: 10, findings: [] },
            { id: 'documentation', title: 'Documentation, Keys & Manuals', completed: 6, total: 6, findings: [] },
          ];

          if (tickets && tickets.length > 0) {
            tickets.forEach((t: any, idx: number) => {
              const area = (t.area || '').toLowerCase();
              let catId = 'exterior';
              if (area.includes('interior') || area.includes('seat') || area.includes('dash')) catId = 'interior';
              else if (area.includes('electric') || area.includes('lamp') || area.includes('light') || area.includes('battery')) catId = 'electrical';
              else if (area.includes('tyre') || area.includes('suspension') || area.includes('underbody') || area.includes('brake')) catId = 'mechanical';
              else if (area.includes('doc') || area.includes('manual') || area.includes('key')) catId = 'documentation';

              const cat = initialCats.find(c => c.id === catId);
              if (cat) {
                cat.findings.push({
                  id: t.id || `f-${idx + 1}`,
                  itemId: `item-${idx + 1}`,
                  itemTitle: t.area || 'Inspection Defect',
                  severity: (t.severity || 'MINOR').toUpperCase() as any,
                  notes: t.description || 'Defect flagged during quality audit.',
                  photos: t.photos || []
                });
              }
            });
          }

          setCategories(initialCats);
          const initOpen: Record<string, boolean> = {};
          initialCats.forEach(c => {
            initOpen[c.id] = c.findings.length > 0;
          });
          setOpenCategories(initOpen);
        }
      } catch (e) {
        console.warn('Error loading QA review data:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleCategory = (catId: string) => {
    setOpenCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const vin = vehicle?.vin || id || 'VIN-PENDING';
  const model = vehicle?.model || 'OEM Vehicle';
  const variant = vehicle?.variant || 'Standard';
  const inspectorName = vehicle?.inspector_name || 'Senior PDI Inspector';
  const inspectorId = vehicle?.inspector_id || 'ENG-042';
  const submittedTime = vehicle?.pdi_date 
    ? new Date(vehicle.pdi_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Recent Quality Submission';

  // Separation of duties rule (05-screen-blueprints §D)
  const isSameUser = user?.employeeId === inspectorId || user?.userName === inspectorName;

  // Counts
  const totalCompleted = categories.reduce((acc, c) => acc + c.completed, 0);
  const totalItems = categories.reduce((acc, c) => acc + c.total, 0);
  const allFindings = categories.flatMap((c) => c.findings);
  const criticalCount = allFindings.filter((f) => f.severity === 'CRITICAL').length;
  const majorCount = allFindings.filter((f) => f.severity === 'MAJOR').length;
  const minorCount = allFindings.filter((f) => f.severity === 'MINOR').length;

  const handleConfirmApprove = async () => {
    setIsSubmitting(true);
    try {
      const targetVin = vehicle?.vin || id;
      await approveQaInspection(targetVin);

      try {
        await supabase.from('qa_reviews').insert({
          vehicle_id: vehicle?.id || id,
          vin: targetVin,
          decision: 'APPROVED',
          reviewer_id: user?.employeeId || user?.userName || 'QA_MANAGER',
          notes: 'QA Sign-off complete. Vehicle certified delivery ready.'
        });
      } catch (e) {}

      window.dispatchEvent(new Event('stock-updated'));
      setApproveModalOpen(false);
      navigate('/qa');
    } catch (e) {
      console.error('Error approving QA review:', e);
      navigate('/qa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (rejectionReason.trim().length < 10) return;
    setIsSubmitting(true);
    try {
      const targetVin = vehicle?.vin || id;
      await supabase
        .from('vehicles')
        .update({ status: 'FAILED' })
        .eq('vin', targetVin);

      await supabase.from('repair_tickets').insert({
        vehicle_id: vehicle?.id || id,
        vin: targetVin,
        model: vehicle?.model || 'Vehicle',
        area: 'QA Manager Inspection Rejection',
        severity: 'CRITICAL',
        description: rejectionReason.trim(),
        status: 'OPEN',
        assigned_to: 'Senior Workshop Technician',
        bay: vehicle?.location || 'Bay 1'
      });

      window.dispatchEvent(new Event('stock-updated'));
      setRejectModalOpen(false);
      navigate('/qa');
    } catch (e) {
      console.error('Error rejecting QA review:', e);
      navigate('/qa');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto py-8 animate-pulse select-none">
        <div className="h-6 w-32 bg-canvas rounded" />
        <Panel className="p-8 h-80 flex items-center justify-center">
          <div className="text-xs text-ink-3">Loading QA inspection docket from database...</div>
        </Panel>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-md mx-auto my-12 bg-surface border border-line rounded-panel p-8 text-center space-y-4 select-none">
        <div className="w-12 h-12 bg-warn/10 text-warn rounded-full flex items-center justify-center mx-auto border border-warn/20">
          <AlertOctagon className="w-6 h-6 stroke-[2]" />
        </div>
        <h2 className="text-base font-semibold text-ink">Inspection Record Not Found</h2>
        <p className="text-xs text-ink-3">
          No matching vehicle or PDI docket was located for ID <span className="font-mono font-medium">{id}</span>.
        </p>
        <div className="pt-2">
          <Link
            to="/qa"
            className="h-8 px-4 bg-accent hover:bg-accent-600 text-white text-xs font-semibold rounded inline-flex items-center justify-center transition-colors cursor-pointer"
          >
            Return to QA Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Top Breadcrumb & Record Header */}
      <div className="flex flex-col gap-2">
        <Link
          to="/qa"
          className="inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-ink font-medium w-fit transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to QA Queue
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold font-mono text-ink tracking-tight">{vin}</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-warn-soft text-warn border border-warn-line rounded-chip">
                QA Review Pending
              </span>
            </div>
            <span className="text-xs text-ink-3 mt-0.5">
              {model} · {variant} · Submitted by <strong className="text-ink font-medium">{inspectorName}</strong> ({submittedTime})
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column High-Stakes Review Grid (05-screen-blueprints §D) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: 2fr Evidence (Scrollable) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Inspection Evidence & Findings</span>
            <span className="text-xs text-ink-3">
              {categories.length} sections · {allFindings.length} findings
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {categories.map((cat) => {
              const isOpen = !!openCategories[cat.id];
              const hasFindings = cat.findings.length > 0;

              return (
                <Panel key={cat.id} noPadding className="overflow-hidden">
                  {/* Category Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-surface hover:bg-canvas text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-ink-3 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-ink-3 shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-ink truncate">{cat.title}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono tabular-nums text-ink-3">
                        {cat.completed} of {cat.total}
                      </span>
                      {hasFindings && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-chip text-xs font-semibold bg-danger-soft text-danger border border-danger-line">
                          <AlertOctagon className="w-3 h-3" />
                          {cat.findings.length}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Category Contents: Checkpoints & Findings */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-line divide-y divide-line">
                      {cat.findings.length === 0 ? (
                        <div className="py-3 text-xs text-ink-3 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-ok" />
                          <span>All {cat.total} checklist items passed without defects.</span>
                        </div>
                      ) : (
                        cat.findings.map((finding) => (
                          <div key={finding.id} className="py-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-ink">
                                {finding.itemTitle}
                              </span>
                              <SeverityTag level={finding.severity} />
                            </div>

                            <p className="text-xs text-ink-2 bg-canvas p-2.5 rounded border border-line">
                              {finding.notes}
                            </p>

                            {/* Photo thumbnails */}
                            {finding.photos.length > 0 && (
                              <div className="flex items-center gap-2 mt-1">
                                {finding.photos.map((ph, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActivePhoto(ph)}
                                    className="w-16 h-16 rounded border border-line overflow-hidden relative group cursor-pointer bg-neutral-100 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                    title="Click to inspect photo full-screen"
                                  >
                                    <div className="flex flex-col items-center gap-1 text-ink-3 group-hover:text-ink">
                                      <Camera className="w-4 h-4" />
                                      <span className="text-[10px] font-mono">Photo {idx + 1}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </Panel>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: 1fr Sticky Decision Panel (05-screen-blueprints §D) */}
        <div className="lg:sticky lg:top-6 flex flex-col gap-4 self-start">
          <Panel title="QA Decision" className="relative">
            <StatusRail status={criticalCount > 0 ? 'danger' : majorCount > 0 ? 'warn' : 'ok'} />

            <div className="flex flex-col gap-4">
              {/* Inspection completion ratio */}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-line">
                <span className="text-ink-3">Checklist Status</span>
                <span className="font-mono font-semibold text-ink">
                  {totalCompleted} of {totalItems} completed
                </span>
              </div>

              {/* Severity Summary Stack */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-wider text-ink-3 font-mono">
                  Recorded Findings
                </span>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <SeverityTag level="CRITICAL" />
                    <span className="text-xs font-mono font-semibold text-danger">
                      {criticalCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <SeverityTag level="MAJOR" />
                    <span className="text-xs font-mono font-semibold text-warn">
                      {majorCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <SeverityTag level="MINOR" />
                    <span className="text-xs font-mono font-semibold text-minor">
                      {minorCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="py-2 border-t border-line text-xs text-ink-3">
                <span>Decision under review · 3 min</span>
              </div>

              {/* Separation of Duties Rule Check */}
              {isSameUser ? (
                <Banner
                  tone="warn"
                  title="Separation of Duties Required"
                  message="You submitted this PDI inspection. Dealership compliance requires another QA Manager to sign off or reject."
                />
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-line">
                  {/* Reject sits ABOVE approve to prevent accidental reflex tap */}
                  <Button
                    variant="destructive"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => setRejectModalOpen(true)}
                  >
                    Reject inspection
                  </Button>

                  {/* Approve is primary but sits below */}
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => setApproveModalOpen(true)}
                  >
                    Approve inspection
                  </Button>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* Reject Confirmation Modal (10-char min + Quick Reason Chips) */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Inspection"
        size="md"
      >
        <div className="flex flex-col gap-4 py-1">
          <p className="text-xs text-ink-3">
            Rejection sends this vehicle to the repair workshop queue. You must state the exact reason (minimum 10 characters).
          </p>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink">Quick reasons:</span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRejectionReason((prev) => (prev ? `${prev}; ${r}` : r))}
                  className="px-2 py-1 bg-canvas hover:bg-neutral-100 border border-line rounded text-[11px] text-ink-2 font-medium transition-colors"
                >
                  + {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="reject-reason" className="text-xs font-medium text-ink">
              Specific Rejection Reason *
            </label>
            <textarea
              id="reject-reason"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Detail the failure reasons and required corrective actions…"
              className="w-full p-2.5 bg-surface border border-line rounded text-xs text-ink focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger"
            />
            <span className="text-[11px] text-ink-3 text-right tabular-nums font-mono">
              {rejectionReason.trim().length} / 10 characters minimum
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={rejectionReason.trim().length < 10}
              isLoading={isSubmitting}
              loadingText="Rejecting…"
              onClick={handleConfirmReject}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Approve PDI Inspection"
        size="sm"
      >
        <div className="flex flex-col gap-4 py-1">
          <p className="text-xs text-ink">
            Are you sure you want to approve inspection for VIN <strong className="font-mono">{vin}</strong>?
          </p>
          <p className="text-xs text-ink-3">
            Approving locks the inspection record, marks the vehicle as <strong>DELIVERY_READY</strong>, and issues the official digital PDI certificate.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setApproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              loadingText="Approving…"
              onClick={handleConfirmApprove}
            >
              Confirm & Issue Certificate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Photo Viewer Full-screen Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-modal bg-ink/80 flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-surface rounded-panel p-4 flex flex-col gap-3 shadow-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Defect Evidence Inspection</span>
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="p-1 rounded text-ink-3 hover:text-ink hover:bg-canvas"
                aria-label="Close photo preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-[4/3] bg-neutral-100 rounded border border-line flex flex-col items-center justify-center text-ink-3">
              <Camera className="w-12 h-12 stroke-[1.5] mb-2" />
              <span className="text-xs font-mono font-medium text-ink-2">High Resolution Photo Evidence</span>
              <span className="text-[11px] text-ink-3">Shot on OEM Stockyard Inspection App · 13 Sep 2026</span>
            </div>
            <div className="flex items-center justify-between text-xs text-ink-3 pt-1">
              <span>Use Esc or click outside to dismiss</span>
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="text-accent hover:underline font-medium"
              >
                Close viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
