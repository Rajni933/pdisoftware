import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, ArrowLeft,
  X, Check, AlertOctagon, TriangleAlert,
  CircleAlert, Eye, Camera, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

  const [vin] = useState('MAT621AB1234567890');
  const [model] = useState('Nexon EV Empowered+');
  const [variant] = useState('Long Range Dual Tone');
  const [inspectorName] = useState('R. Meena');
  const [inspectorId] = useState('ENG-042');
  const [submittedTime] = useState('Today, 14:02 (12 min ago)');

  // Categories mock: Rule in Blueprint D: Categories with findings auto-expand
  const [categories, setCategories] = useState<InspectionCategory[]>([
    {
      id: 'exterior',
      title: 'Exterior & Paint Finish',
      completed: 12,
      total: 12,
      findings: [
        {
          id: 'f-1',
          itemId: 'ext-bumper',
          itemTitle: 'Front bumper alignment and finish',
          severity: 'CRITICAL',
          notes: '8cm scratch with primer exposure on lower bumper lip, left side.',
          photos: [
            '/mock-photo-1.jpg',
            '/mock-photo-2.jpg',
          ],
        },
      ],
    },
    {
      id: 'interior',
      title: 'Interior, Dashboard & Seats',
      completed: 10,
      total: 10,
      findings: [],
    },
    {
      id: 'electrical',
      title: 'Electrical, Lamps & Infotainment',
      completed: 8,
      total: 8,
      findings: [
        {
          id: 'f-2',
          itemId: 'elec-drl',
          itemTitle: 'Right DRL illumination and level',
          severity: 'MAJOR',
          notes: 'Flicker observed on right daytime running lamp strip during high beam cycle.',
          photos: ['/mock-photo-3.jpg'],
        },
      ],
    },
    {
      id: 'mechanical',
      title: 'Underbody, Tyres & Suspension',
      completed: 10,
      total: 10,
      findings: [
        {
          id: 'f-3',
          itemId: 'mech-tyre-fl',
          itemTitle: 'Front-left tyre tread and sidewall',
          severity: 'MINOR',
          notes: 'Mild surface scuff on sidewall lettering, no cord or structural damage.',
          photos: ['/mock-photo-4.jpg'],
        },
      ],
    },
    {
      id: 'documentation',
      title: 'Documentation, Keys & Manuals',
      completed: 6,
      total: 6,
      findings: [],
    },
  ]);

  // Collapsed state: collapsed by default EXCEPT any containing a finding (05-screen-blueprints §D)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    categories.forEach((cat) => {
      init[cat.id] = cat.findings.length > 0;
    });
    return init;
  });

  const toggleCategory = (catId: string) => {
    setOpenCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Full-screen photo gallery state with keyboard arrow support
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modal decision states
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Separation of duties rule (05-screen-blueprints §D):
  // If the submitting engineer is the current user, both buttons are absent and a banner explains why
  const isSameUser = user?.employeeId === inspectorId || user?.userName === inspectorName;

  // Counts
  const totalCompleted = categories.reduce((acc, c) => acc + c.completed, 0);
  const totalItems = categories.reduce((acc, c) => acc + c.total, 0);
  const allFindings = categories.flatMap((c) => c.findings);
  const criticalCount = allFindings.filter((f) => f.severity === 'CRITICAL').length;
  const majorCount = allFindings.filter((f) => f.severity === 'MAJOR').length;
  const minorCount = allFindings.filter((f) => f.severity === 'MINOR').length;

  const handleConfirmApprove = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setApproveModalOpen(false);
      navigate('/qa');
    }, 800);
  };

  const handleConfirmReject = () => {
    if (rejectionReason.trim().length < 10) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setRejectModalOpen(false);
      navigate('/qa');
    }, 800);
  };

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
