import React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  max?: number;
  label?: string;
  countLabel?: string;
  isIndeterminate?: boolean;
  variant?: 'accent' | 'ok' | 'danger';
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
  isIndeterminate = false,
  variant = 'accent',
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
        className="w-full h-1.5 bg-line rounded-full overflow-hidden"
      >
        {isIndeterminate ? (
          <div className={`h-full w-1/3 ${variantColors[variant]} animate-[indeterminate_1.5s_infinite_ease-in-out] rounded-full`} />
        ) : (
          <div
            className={`h-full ${variantColors[variant]} transition-all duration-200 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};

export const TopProgressBar: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-accent/20 overflow-hidden pointer-events-none">
      <div className="h-full w-1/3 bg-accent animate-[indeterminate_1.2s_infinite_ease-in-out]" />
    </div>
  );
};
