import React, { useEffect, useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';

export interface RingProgressProps {
  progress?: number; // 0 to 100
  status?: 'uploading' | 'success' | 'error';
  onRetry?: () => void;
  className?: string;
}

export const RingProgress: React.FC<RingProgressProps> = ({
  progress = 0,
  status = 'uploading',
  onRetry,
  className = '',
}) => {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (status === 'success') {
      setShowCheck(true);
      const timer = setTimeout(() => {
        setShowCheck(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const size = 28;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const offset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center w-7 h-7 ${className}`}
      role="progressbar"
      aria-valuenow={status === 'uploading' ? Math.round(normalizedProgress) : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={status === 'error' ? 'Upload failed' : status === 'success' ? 'Upload complete' : 'Uploading photo'}
    >
      {status === 'error' ? (
        <button
          type="button"
          onClick={onRetry}
          className="w-7 h-7 rounded-full bg-danger text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          title="Retry upload"
          aria-label="Retry photo upload"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      ) : status === 'success' && showCheck ? (
        <div className="w-7 h-7 rounded-full bg-ok text-white flex items-center justify-center animate-[scaleIn_180ms_cubic-bezier(0.2,0.8,0.2,1)]">
          <Check className="w-4 h-4 stroke-[2.5]" />
        </div>
      ) : (
        <svg className="w-7 h-7 -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth={strokeWidth}
          />
          {/* Progress fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="white"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-150 ease-out"
          />
        </svg>
      )}
    </div>
  );
};
