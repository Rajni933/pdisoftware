import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  isTitleMono?: boolean;
  statusChip?: React.ReactNode;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumbs,
  title,
  isTitleMono = false,
  statusChip,
  metadata,
  actions,
  className = '',
}) => {
  return (
    <header className={`sticky top-0 z-20 bg-canvas border-b border-line pb-4 pt-1 mb-6 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-3 mb-1.5">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <span className="text-ink-disabled">/</span>}
                {isLast || (!crumb.href && !crumb.onClick) ? (
                  <span className="text-ink-2 font-medium">{crumb.label}</span>
                ) : (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="hover:text-accent transition-colors underline-offset-2 hover:underline"
                  >
                    {crumb.label}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Bar: Title + Chip + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1
            className={`text-xl sm:text-2xl font-semibold text-ink tracking-tight leading-tight ${
              isTitleMono ? 'font-mono' : 'font-sans'
            }`}
          >
            {title}
          </h1>
          {statusChip && <div className="shrink-0">{statusChip}</div>}
        </div>

        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>

      {/* Metadata Sub-line */}
      {metadata && <div className="text-xs text-ink-3 mt-1.5">{metadata}</div>}
    </header>
  );
};
