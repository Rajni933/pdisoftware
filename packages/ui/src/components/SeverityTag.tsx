import React from 'react';

export type SeverityLevel = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'OBSERVATION';

export interface SeverityTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: SeverityLevel;
  count?: number;
}

const severityConfig: Record<SeverityLevel, { label: string; icon: React.ReactNode; classes: string }> = {
  CRITICAL: {
    label: 'Critical',
    classes: 'bg-danger-soft text-danger border-danger-line',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  MAJOR: {
    label: 'Major',
    classes: 'bg-warn-soft text-warn border-warn-line',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  MINOR: {
    label: 'Minor',
    classes: 'bg-minor-soft text-minor border-minor-line',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  OBSERVATION: {
    label: 'Observation',
    classes: 'bg-canvas text-ink-3 border-line',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
};

export const SeverityTag: React.FC<SeverityTagProps> = ({
  level,
  count,
  className = '',
  ...props
}) => {
  const current = severityConfig[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-[22px] px-2 rounded-chip text-[11px] font-medium border select-none leading-none ${current.classes} ${className}`}
      {...props}
    >
      <span className="shrink-0" aria-hidden="true">
        {current.icon}
      </span>
      <span>{current.label}</span>
      {typeof count === 'number' && (
        <span className="ml-1 px-1 py-0.5 rounded-full text-[10px] font-mono tabular-nums bg-surface/60 leading-none">
          {count}
        </span>
      )}
    </span>
  );
};
