import React from 'react';

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  pageSizeOptions = [20, 50, 100],
  onPageChange,
  onPageSizeChange,
  className = '',
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const totalPages = Math.ceil(totalItems / pageSize);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 px-4 text-xs text-ink-2 select-none ${className}`}
    >
      {/* Rows per page selector */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-ink-3">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-7 px-2 bg-surface border border-line rounded text-xs text-ink font-mono focus:outline-none focus:border-accent"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex-1" />

      {/* Record Range Counter */}
      <span className="font-mono tabular-nums text-ink-3">
        <strong className="font-semibold text-ink">{startItem}–{endItem}</strong> of{' '}
        <strong className="font-semibold text-ink">{totalItems.toLocaleString()}</strong>
      </span>

      {/* Prev / Next Page Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          className="w-7 h-7 rounded border border-line bg-surface hover:bg-canvas disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-ink transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          className="w-7 h-7 rounded border border-line bg-surface hover:bg-canvas disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-ink transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};
