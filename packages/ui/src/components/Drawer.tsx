import React, { useEffect } from 'react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'w-[420px]',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-ink/45 select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`h-full max-w-full bg-surface border-l border-line shadow-modal flex flex-col overflow-hidden animate-in slide-in-from-right duration-240 ${width}`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
          <div>
            <h2 id="drawer-title" className="text-base font-semibold text-ink leading-tight">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-ink-3 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="w-8 h-8 rounded flex items-center justify-center text-ink-3 hover:text-ink hover:bg-canvas transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-5 overflow-y-auto select-text text-sm text-ink-2">
          {children}
        </div>

        {/* Drawer Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 h-16 border-t border-line bg-canvas shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
