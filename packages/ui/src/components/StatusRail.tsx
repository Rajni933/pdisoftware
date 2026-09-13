import React from 'react';

export type StatusRailVariant = 'ok' | 'warn' | 'danger' | 'pending';

export interface StatusRailProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusRailVariant;
  className?: string;
}

const statusColors: Record<StatusRailVariant, string> = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
  pending: 'bg-line-strong',
};

export const StatusRail: React.FC<StatusRailProps> = ({
  status,
  className = '',
  ...props
}) => {
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-y-0 left-0 w-[var(--rail,3px)] transition-colors duration-[240ms] ease-out ${statusColors[status]} ${className}`}
      {...props}
    />
  );
};
