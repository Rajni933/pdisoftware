import React from 'react';

export interface ToastProps {
  variant?: 'ok' | 'warn' | 'danger' | 'info';
  title: string;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles = {
  ok: {
    icon: (
      <svg className="w-4 h-4 text-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    rail: 'bg-ok',
  },
  warn: {
    icon: (
      <svg className="w-4 h-4 text-warn" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    rail: 'bg-warn',
  },
  danger: {
    icon: (
      <svg className="w-4 h-4 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    rail: 'bg-danger',
  },
  info: {
    icon: (
      <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    rail: 'bg-accent',
  },
};

export const Toast: React.FC<ToastProps> = ({
  variant = 'ok',
  title,
  message,
  onDismiss,
  className = '',
}) => {
  const current = variantStyles[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative flex items-start gap-3 p-3.5 bg-surface border border-line rounded-panel shadow-pop min-w-[320px] max-w-md transition-all overflow-hidden ${className}`}
    >
      <span className={`absolute inset-y-0 left-0 w-[3px] ${current.rail}`} aria-hidden="true" />
      <div className="shrink-0 pt-0.5 ml-1" aria-hidden="true">
        {current.icon}
      </div>
      <div className="flex-1 pr-2">
        <h4 className="text-xs font-semibold text-ink leading-tight">{title}</h4>
        {message && <p className="text-xs text-ink-2 mt-1 leading-snug">{message}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="text-ink-3 hover:text-ink p-1 rounded hover:bg-canvas transition-colors shrink-0"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};
