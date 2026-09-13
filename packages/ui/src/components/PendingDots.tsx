import React from 'react';
import { CloudOff } from 'lucide-react';

export interface PendingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  count?: number;
  showIcon?: boolean;
  className?: string;
}

export const PendingDots: React.FC<PendingDotsProps> = ({
  label = 'Queued',
  count,
  showIcon = true,
  className = '',
  ...props
}) => {
  return (
    <div
      role="status"
      aria-label={`${label}${count ? ` (${count})` : ''} - saved locally offline`}
      className={`inline-flex items-center gap-1.5 text-xs text-ink-3 font-medium select-none ${className}`}
      {...props}
    >
      {showIcon && <CloudOff className="w-3.5 h-3.5 shrink-0 text-ink-3" aria-hidden="true" />}
      <span>{count !== undefined ? `${label} (${count})` : label}</span>
      <div className="inline-flex items-center gap-0.5 ml-0.5" aria-hidden="true">
        <span
          className="w-[3px] h-[3px] rounded-full bg-ink-3 animate-pulse"
          style={{ animationDuration: '1.2s', animationDelay: '0ms' }}
        />
        <span
          className="w-[3px] h-[3px] rounded-full bg-ink-3 animate-pulse"
          style={{ animationDuration: '1.2s', animationDelay: '250ms' }}
        />
        <span
          className="w-[3px] h-[3px] rounded-full bg-ink-3 animate-pulse"
          style={{ animationDuration: '1.2s', animationDelay: '500ms' }}
        />
      </div>
    </div>
  );
};
