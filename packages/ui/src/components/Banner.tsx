import React from 'react';

export interface BannerProps {
  variant?: 'warn' | 'danger' | 'ok' | 'info';
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const bannerStyles = {
  warn: {
    container: 'bg-warn-soft border-warn-line text-warn',
    rail: 'bg-warn',
    icon: (
      <svg className="w-4 h-4 text-warn" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  danger: {
    container: 'bg-danger-soft border-danger-line text-danger',
    rail: 'bg-danger',
    icon: (
      <svg className="w-4 h-4 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  ok: {
    container: 'bg-ok-soft border-ok-line text-ok',
    rail: 'bg-ok',
    icon: (
      <svg className="w-4 h-4 text-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  info: {
    container: 'bg-accent-soft border-accent-line text-accent',
    rail: 'bg-accent',
    icon: (
      <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
};

export const Banner: React.FC<BannerProps> = ({
  variant = 'warn',
  title,
  description,
  action,
  className = '',
}) => {
  const current = bannerStyles[variant];

  return (
    <div
      role="alert"
      className={`relative flex items-center justify-between gap-3 px-4 py-3 rounded border text-xs overflow-hidden ${current.container} ${className}`}
    >
      <span className={`absolute inset-y-0 left-0 w-[3px] ${current.rail}`} aria-hidden="true" />
      <div className="flex items-center gap-2.5 ml-1">
        <span className="shrink-0" aria-hidden="true">
          {current.icon}
        </span>
        <div>
          <span className="font-semibold text-ink">{title}</span>
          {description && <span className="text-ink-2 ml-2">{description}</span>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
