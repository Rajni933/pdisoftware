import React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  max?: number;
  label?: string;
  countLabel?: string;
  detailLabel?: string; // e.g. "4 of 11 photos · 2.1 MB of 5.8 MB"
  isIndeterminate?: boolean;
  variant?: 'accent' | 'ok' | 'danger';
  onCancel?: () => void;
  onContinueInBackground?: () => void;
}

const variantColors = {
  accent: 'bg-accent',
  ok: 'bg-ok',
  danger: 'bg-danger',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  max = 100,
  label,
  countLabel,
  detailLabel,
  isIndeterminate = false,
  variant = 'accent',
  onCancel,
  onContinueInBackground,
  className = '',
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`} {...props}>
      {(label || countLabel) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-ink">{label}</span>}
          {countLabel ? (
            <span className="text-ink-3 tabular-nums font-mono">{countLabel}</span>
          ) : (
            !isIndeterminate && (
              <span className="text-ink-3 tabular-nums font-mono">{Math.round(percentage)}%</span>
            )
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full h-1.5 bg-neutral-100 rounded-xs overflow-hidden"
      >
        {isIndeterminate ? (
          <div className={`h-full w-1/3 ${variantColors[variant]} animate-[indeterminate_1.4s_infinite_cubic-bezier(0.4,0,0.2,1)] rounded-xs`} />
        ) : (
          <div
            className={`h-full ${variantColors[variant]} transition-all duration-180 ease-out rounded-xs`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>

      {/* Explanatory detail line or cancel / continue affordances */}
      {(detailLabel || onCancel || onContinueInBackground) && (
        <div className="flex items-center justify-between text-xs text-ink-3 mt-0.5">
          {detailLabel && <span>{detailLabel}</span>}
          <div className="flex items-center gap-2 ml-auto">
            {onContinueInBackground && (
              <button
                type="button"
                onClick={onContinueInBackground}
                className="text-xs text-accent hover:underline font-medium focus:outline-none"
              >
                Continue in background
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-ink-3 hover:text-danger hover:underline focus:outline-none"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const TopProgressBar: React.FC<{ isVisible: boolean; className?: string }> = ({
  isVisible,
  className = '',
}) => {
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isVisible) {
      // 200ms delay law: flash of spinner is worse than a beat of stillness
      timeout = setTimeout(() => setShouldRender(true), 200);
    } else {
      setShouldRender(false);
    }
    return () => clearTimeout(timeout);
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-sticky h-0.5 bg-accent/20 overflow-hidden pointer-events-none transition-opacity duration-140 ${className}`}
      role="progressbar"
      aria-label="Loading page content"
    >
      <div className="h-full w-1/3 bg-accent animate-[indeterminate_1.2s_infinite_cubic-bezier(0.4,0,0.2,1)]" />
    </div>
  );
};

