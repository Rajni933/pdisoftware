import React, { useState } from 'react';

export type CheckStatus = 'PASS' | 'FAIL' | 'NA' | 'UNCHECKED';

export interface ChecklistItemProps {
  category: string;
  positionLabel: string; // e.g. "Item 5 of 12"
  title: string;
  instructions?: string;
  status: CheckStatus;
  isPhotoRequired?: boolean;
  hasPhoto?: boolean;
  savedTimestamp?: string; // e.g. "Saved 14:32"
  onPass: () => void;
  onFail: () => void;
  onNa: () => void;
  onAddPhoto?: () => void;
  className?: string;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  category,
  positionLabel,
  title,
  instructions,
  status,
  isPhotoRequired = false,
  hasPhoto = false,
  savedTimestamp,
  onPass,
  onFail,
  onNa,
  onAddPhoto,
  className = '',
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const isPassDisabled = isPhotoRequired && !hasPhoto;

  return (
    <div
      className={`bg-surface border border-line rounded p-4 flex flex-col gap-3 transition-colors ${className}`}
    >
      {/* Category & Position */}
      <div className="flex items-center justify-between text-xs text-ink-3">
        <span className="uppercase tracking-wider font-semibold">{category}</span>
        <span className="font-mono tabular-nums">{positionLabel}</span>
      </div>

      {/* Item Title */}
      <div>
        <h4 className="text-base font-medium text-ink leading-snug">{title}</h4>
        {instructions && (
          <div className="mt-1.5">
            <button
              type="button"
              onClick={() => setShowInstructions((prev) => !prev)}
              className="text-xs text-ink-3 hover:text-ink flex items-center gap-1 focus:outline-none"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform ${showInstructions ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span>{showInstructions ? 'Hide instructions' : 'How to check'}</span>
            </button>
            {showInstructions && (
              <p className="text-xs text-ink-2 bg-canvas p-2.5 rounded border border-line mt-2 leading-relaxed">
                {instructions}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Photo Requirement Callout */}
      {isPhotoRequired && !hasPhoto && (
        <div className="flex items-center justify-between p-2 rounded bg-warn-soft border border-warn-line text-xs text-warn">
          <span className="flex items-center gap-1.5 font-medium">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Photo required to pass
          </span>
          {onAddPhoto && (
            <button
              type="button"
              onClick={onAddPhoto}
              className="font-semibold underline hover:text-ink ml-2"
            >
              Add Photo
            </button>
          )}
        </div>
      )}

      {/* Actions: 52px Touch Targets in Yard Ergonomics */}
      <div className="grid grid-cols-12 gap-2 mt-1">
        {/* N/A (2 cols) */}
        <button
          type="button"
          onClick={onNa}
          className={`col-span-3 h-[52px] rounded font-medium text-sm flex items-center justify-center border transition-colors ${
            status === 'NA'
              ? 'bg-canvas border-line-strong text-ink'
              : 'bg-surface border-line text-ink-3 hover:text-ink hover:bg-canvas'
          }`}
        >
          N/A
        </button>

        {/* Fail (3 cols) — Distinct by glyph + label + border, never fill alone */}
        <button
          type="button"
          onClick={onFail}
          className={`col-span-4 h-[52px] rounded font-medium text-sm flex items-center justify-center gap-1.5 border transition-colors ${
            status === 'FAIL'
              ? 'bg-danger-soft border-danger text-danger font-semibold'
              : 'bg-surface border-line text-ink-2 hover:border-danger hover:text-danger'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span>Fail</span>
        </button>

        {/* Pass (5 cols) — Largest target, rightmost under the thumb */}
        <button
          type="button"
          disabled={isPassDisabled}
          onClick={onPass}
          className={`col-span-5 h-[52px] rounded font-semibold text-base flex items-center justify-center gap-2 border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            status === 'PASS'
              ? 'bg-ok text-white border-ok'
              : 'bg-ok-soft text-ok border-ok-line hover:bg-ok hover:text-white'
          }`}
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Pass</span>
        </button>
      </div>

      {/* Autosave Confirmation Footer */}
      {savedTimestamp && (
        <div className="flex justify-end text-[11px] text-ink-3 font-mono">
          <span>{savedTimestamp}</span>
        </div>
      )}
    </div>
  );
};
