import React from 'react';
import { OctagonAlert, TriangleAlert, CircleAlert, Eye } from 'lucide-react';

export type SeverityLevel = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'OBSERVATION';

export interface SeverityTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: SeverityLevel;
  count?: number;
}

const severityConfig: Record<SeverityLevel, { label: string; icon: React.ReactNode; classes: string }> = {
  CRITICAL: {
    label: 'Critical',
    classes: 'bg-danger-soft text-danger border-danger-line',
    icon: <OctagonAlert className="w-3.5 h-3.5" strokeWidth={1.5} />,
  },
  MAJOR: {
    label: 'Major',
    classes: 'bg-warn-soft text-warn border-warn-line',
    icon: <TriangleAlert className="w-3.5 h-3.5" strokeWidth={1.5} />,
  },
  MINOR: {
    label: 'Minor',
    classes: 'bg-minor-soft text-minor border-minor-line',
    icon: <CircleAlert className="w-3.5 h-3.5" strokeWidth={1.5} />,
  },
  OBSERVATION: {
    label: 'Observation',
    classes: 'bg-canvas text-ink-3 border-line',
    icon: <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />,
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
