import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto my-6 ${className}`}
    >
      {icon ? (
        <div className="w-10 h-10 rounded bg-canvas border border-line flex items-center justify-center text-ink-3 mb-3 shrink-0">
          {icon}
        </div>
      ) : (
        <div className="w-10 h-10 rounded bg-canvas border border-line flex items-center justify-center text-ink-3 mb-3 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </div>
      )}
      <h3 className="text-sm font-semibold text-ink leading-snug">{title}</h3>
      <p className="text-xs text-ink-2 mt-1 leading-normal max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
