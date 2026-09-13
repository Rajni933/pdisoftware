import React from 'react';

export interface PhotoTileProps {
  src?: string;
  alt?: string;
  slotLabel?: string;
  isUploading?: boolean;
  uploadProgress?: number; // 0 to 100
  isQueuedOffline?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export const PhotoTile: React.FC<PhotoTileProps> = ({
  src,
  alt = 'Inspection photo',
  slotLabel,
  isUploading = false,
  uploadProgress = 0,
  isQueuedOffline = false,
  onRemove,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`relative aspect-square w-full bg-canvas border border-line rounded-chip overflow-hidden group select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-ink-disabled p-2">
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="text-[10px] text-center font-medium leading-tight">No photo</span>
        </div>
      )}

      {/* Top Left Slot Label */}
      {slotLabel && (
        <div className="absolute top-1.5 left-1.5">
          <span className="inline-block px-1.5 py-0.5 rounded-chip text-[10px] font-medium bg-surface/90 text-ink border border-line backdrop-blur-none shadow-sm leading-none">
            {slotLabel}
          </span>
        </div>
      )}

      {/* Top Right Remove Button */}
      {onRemove && (
        <button
          type="button"
          aria-label="Remove photo"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-chip bg-surface/90 text-danger hover:bg-danger hover:text-white border border-line flex items-center justify-center transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* Bottom Upload / Offline Status */}
      {isUploading ? (
        <div className="absolute inset-x-0 bottom-0 bg-surface/95 border-t border-line px-2 py-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-accent animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
          </svg>
          <span className="text-[10px] font-mono font-medium text-ink-2 tabular-nums">
            {Math.round(uploadProgress)}%
          </span>
        </div>
      ) : isQueuedOffline ? (
        <div className="absolute inset-x-0 bottom-0 bg-surface/95 border-t border-line px-2 py-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-warn" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          </svg>
          <span className="text-[10px] font-medium text-warn">Queued</span>
        </div>
      ) : null}
    </div>
  );
};
