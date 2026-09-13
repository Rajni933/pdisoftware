import React from 'react';

export type StatusFamilyVariant = 'intake' | 'inProgress' | 'waiting' | 'blocked' | 'cleared' | 'closed';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  family?: StatusFamilyVariant;
  icon?: React.ReactNode;
  label: string;
  isMobile?: boolean;
}

const defaultIcons: Record<StatusFamilyVariant, React.ReactNode> = {
  intake: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  inProgress: (
    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
    </svg>
  ),
  waiting: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  blocked: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  cleared: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  closed: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  ),
};

const familyClasses: Record<StatusFamilyVariant, string> = {
  intake:     'bg-canvas text-ink-2 border-line-strong',
  inProgress: 'bg-accent-soft text-accent border-accent-line',
  waiting:    'bg-warn-soft text-warn border-warn-line',
  blocked:    'bg-danger-soft text-danger border-danger-line',
  cleared:    'bg-ok-soft text-ok border-ok-line',
  closed:     'bg-canvas text-ink-3 border-line',
};

export const Chip: React.FC<ChipProps> = ({
  family = 'intake',
  icon,
  label,
  isMobile = false,
  className = '',
  ...props
}) => {
  const renderedIcon = icon || defaultIcons[family];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 rounded-chip text-[11px] font-medium border select-none leading-none ${
        isMobile ? 'h-[26px]' : 'h-[22px]'
      } ${familyClasses[family]} ${className}`}
      {...props}
    >
      <span className="shrink-0" aria-hidden="true">
        {renderedIcon}
      </span>
      <span>{label}</span>
    </span>
  );
};

export interface CountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number | string;
  isBlocked?: boolean;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  isBlocked = false,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-mono tabular-nums leading-none select-none ${
        isBlocked
          ? 'bg-danger text-white'
          : 'bg-canvas text-ink-2 border border-line'
      } ${className}`}
      {...props}
    >
      {count}
    </span>
  );
};
