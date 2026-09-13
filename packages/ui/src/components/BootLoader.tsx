import React, { useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';

export interface BootLoaderProps {
  timeoutMs?: number; // default 6000 (6s)
  onRetry?: () => void;
  className?: string;
}

export const BootLoader: React.FC<BootLoaderProps> = ({
  timeoutMs = 6000,
  onRetry,
  className = '',
}) => {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs]);

  const handleRetry = () => {
    setTimedOut(false);
    if (onRetry) onRetry();
  };

  return (
    <div
      role="status"
      aria-label={timedOut ? 'Connecting delayed' : 'Starting application'}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas p-4 select-none ${className}`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* 40px Centered Autoprime Mark */}
        <div className="w-10 h-10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-brand"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Autoprime Tata"
          >
            <rect width="40" height="40" rx="8" fill="currentColor" />
            <path
              d="M12 26L20 12L28 26H23.5L20 19.5L16.5 26H12Z"
              fill="white"
            />
            <path
              d="M15 22.5H25"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Indeterminate hairline bar OR 6s Timeout State */}
        {!timedOut ? (
          <div
            className="w-[120px] h-[2px] bg-neutral-200 rounded-full overflow-hidden relative"
            role="progressbar"
            aria-label="Bootstrapping"
          >
            <div className="absolute inset-y-0 w-1/3 bg-accent rounded-full animate-[indeterminate_1.4s_infinite_cubic-bezier(0.4,0,0.2,1)]" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center animate-[fadeIn_180ms_ease-out]">
            <span className="text-xs text-ink-3">
              Still connecting… check your network
            </span>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink bg-surface border border-line rounded shadow-none hover:bg-neutral-50 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <RotateCw className="w-3 h-3 text-ink-2" />
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
