import React from 'react';

export interface KpiTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  delta?: {
    value: string | number;
    baseline: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
}

export const KpiTile: React.FC<KpiTileProps> = ({
  label,
  value,
  delta,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-surface border border-line rounded p-4 flex flex-col justify-between ${className}`}
      {...props}
    >
      <span className="text-[13px] font-medium text-ink-2 leading-tight">{label}</span>
      <div className="mt-2 mb-1">
        <span className="text-[32px] font-semibold text-ink font-mono tabular-nums leading-none tracking-[-0.02em]">
          {value}
        </span>
      </div>
      {delta ? (
        <div className="flex items-center gap-1.5 text-xs text-ink-3 mt-1 leading-none">
          {delta.isNeutral ? null : delta.isPositive ? (
            <svg className="w-3.5 h-3.5 text-ok shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-danger shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
          <span
            className={`font-medium ${
              delta.isNeutral ? 'text-ink-3' : delta.isPositive ? 'text-ok' : 'text-danger'
            }`}
          >
            {delta.value}
          </span>
          <span>{delta.baseline}</span>
        </div>
      ) : (
        <div className="h-4" />
      )}
    </div>
  );
};
