import React, { useState } from 'react';
import {
  X, Camera, Plus, OctagonAlert,
  TriangleAlert, CircleAlert, Eye
} from 'lucide-react';
import { SeverityLevel } from './SeverityTag';
import { VehicleBodyMap, VehiclePanelId } from './VehicleBodyMap';
import { Button } from './Button';

export interface FindingData {
  severity: SeverityLevel;
  panelId: VehiclePanelId | null;
  panelName: string;
  defectType: string;
  notes: string;
  photos: string[];
}

export interface FindingCaptureSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (finding: FindingData) => void;
  categoryName?: string;
  checkpointTitle?: string;
  initialData?: Partial<FindingData>;
  className?: string;
}

const SEVERITY_OPTIONS: {
  level: SeverityLevel;
  label: string;
  icon: React.ReactNode;
  consequence: string;
}[] = [
  {
    level: 'CRITICAL',
    label: 'Critical',
    icon: <OctagonAlert className="w-4 h-4 text-danger stroke-[1.5]" />,
    consequence: 'Critical findings immediately fail the inspection, immobilize the vehicle, and require mandatory photo proof.',
  },
  {
    level: 'MAJOR',
    label: 'Major',
    icon: <TriangleAlert className="w-4 h-4 text-warn stroke-[1.5]" />,
    consequence: 'Major findings fail the inspection and automatically generate a workshop repair ticket for panel repaint or parts.',
  },
  {
    level: 'MINOR',
    label: 'Minor',
    icon: <CircleAlert className="w-4 h-4 text-minor stroke-[1.5]" />,
    consequence: 'Minor cosmetic flaws do not fail the inspection. They can be buffed or touched up at branch delivery.',
  },
  {
    level: 'OBSERVATION',
    label: 'Observation',
    icon: <Eye className="w-4 h-4 text-ink-3 stroke-[1.5]" />,
    consequence: 'Notes and observations logged for customer handover transparency without blocking delivery.',
  },
];

const DEFECT_TYPES = [
  'Paint scratch',
  'Dent / ding',
  'Misalignment / panel gap',
  'Paint chip / swirl',
  'Glass chip / crack',
  'Trim loose / damaged',
  'Fluid stain / leak',
  'Electrical malfunction',
  'Missing accessory / tool',
];

export const FindingCaptureSheet: React.FC<FindingCaptureSheetProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryName = 'Exterior',
  checkpointTitle = 'Headlamp alignment and function',
  initialData,
  className = '',
}) => {
  const [severity, setSeverity] = useState<SeverityLevel>(initialData?.severity || 'MAJOR');
  const [panelId, setPanelId] = useState<VehiclePanelId | null>(initialData?.panelId || 'front_bumper');
  const [defectType, setDefectType] = useState(initialData?.defectType || DEFECT_TYPES[0]);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || ['mock-photo-1.jpg']);

  if (!isOpen) return null;

  const currentOption = SEVERITY_OPTIONS.find((o) => o.level === severity)!;

  // Validation rules (06-mobile-yard §5):
  // Photos required for CRITICAL severity. Notes required. Panel required.
  const isPhotoRequired = severity === 'CRITICAL';
  const hasPhotos = photos.length > 0;
  const hasNotes = notes.trim().length >= 5;
  const hasPanel = panelId !== null;

  let disableReason = '';
  if (!hasPanel) disableReason = 'Select vehicle panel on body map';
  else if (!hasNotes) disableReason = 'Enter at least 5 characters of description';
  else if (isPhotoRequired && !hasPhotos) disableReason = 'Photo evidence is mandatory for critical defects';

  const canSave = disableReason === '';

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      severity,
      panelId,
      panelName: panelId ? panelId.replace(/_/g, ' ') : 'General',
      defectType,
      notes,
      photos,
    });
  };

  const addPhotoMock = () => {
    setPhotos((prev) => [...prev, `defect-photo-${prev.length + 1}.jpg`]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className="fixed inset-0 z-modal bg-ink/60 flex flex-col justify-end select-none"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg mx-auto bg-surface rounded-t-panel border-t border-line shadow-modal max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-240 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="w-full flex items-center justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-line">
          <div className="flex flex-col">
            <h2 className="text-base font-semibold text-ink leading-tight">Add Finding</h2>
            <span className="text-xs text-ink-3 truncate max-w-[280px]">
              {categoryName} · {checkpointTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center text-ink-3 hover:text-ink hover:bg-canvas"
            aria-label="Close finding sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          {/* 1. Severity First (Segmented, 52px touch floor in Yard Mode) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink">Severity *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-canvas border border-line rounded">
              {SEVERITY_OPTIONS.map((opt) => {
                const isSelected = severity === opt.level;
                return (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => setSeverity(opt.level)}
                    className={`h-[52px] px-2 rounded flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-surface text-ink shadow-xs border border-line ring-1 ring-accent'
                        : 'text-ink-3 hover:text-ink hover:bg-surface/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {opt.icon}
                      <span>{opt.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Live Consequence Explanation */}
            <p className="text-xs text-ink-2 bg-neutral-50 p-2 rounded border border-line mt-0.5 leading-relaxed">
              {currentOption.consequence}
            </p>
          </div>

          {/* 2. Where (Interactive Vehicle Body Map Panel Selector) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink">Where on Vehicle *</label>
              {panelId && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-danger-soft text-danger border border-danger-line rounded-chip text-xs font-medium capitalize">
                  {panelId.replace(/_/g, ' ')}
                  <button
                    type="button"
                    onClick={() => setPanelId(null)}
                    className="hover:opacity-75 focus:outline-none ml-1"
                    aria-label="Deselect panel"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex justify-center p-2 bg-canvas border border-line rounded">
              <VehicleBodyMap
                selectedPanel={panelId}
                onSelectPanel={(p) => setPanelId(p)}
                findings={panelId ? { [panelId]: 1 } : {}}
              />
            </div>
          </div>

          {/* 3. What You Saw */}
          <div className="flex flex-col gap-2">
            <label htmlFor="defect-type" className="text-xs font-semibold text-ink">
              What You Observed *
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                id="defect-type"
                value={defectType}
                onChange={(e) => setDefectType(e.target.value)}
                className="h-10 px-3 bg-surface border border-line rounded text-xs text-ink focus:outline-none focus:border-accent"
              >
                {DEFECT_TYPES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 8 cm, lower edge, below the fog lamp"
                className="flex-1 h-10 px-3 bg-surface border border-line rounded text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* 4. Evidence Photos */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink">
                Defect Photos {isPhotoRequired ? '*' : '(optional)'}
              </label>
              {isPhotoRequired && (
                <span className="text-[11px] text-danger font-medium font-mono">
                  Mandatory for critical
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {/* Add Photo Action Button */}
              <button
                type="button"
                onClick={addPhotoMock}
                className="w-16 h-16 shrink-0 rounded border-2 border-dashed border-line-strong hover:border-accent flex flex-col items-center justify-center gap-1 text-ink-3 hover:text-accent transition-colors bg-canvas focus:outline-none"
                aria-label="Add defect photo"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px] font-medium">+ Photo</span>
              </button>

              {/* Photos Strip */}
              {photos.map((ph, idx) => (
                <div
                  key={idx}
                  className="w-16 h-16 shrink-0 rounded border border-line relative overflow-hidden bg-neutral-100 flex items-center justify-center"
                >
                  <span className="text-[10px] font-mono text-ink-3">Photo {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ink/70 text-white flex items-center justify-center hover:bg-danger transition-colors"
                    aria-label="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions (Sticky 52px buttons) */}
        <div className="p-4 border-t border-line bg-surface flex flex-col gap-2 shrink-0">
          {disableReason && (
            <span className="text-[11px] text-danger font-medium text-center">
              {disableReason}
            </span>
          )}
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 justify-center h-[52px]"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1 justify-center h-[52px]"
              disabled={!canSave}
              onClick={handleSave}
            >
              Save Finding
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
