import React from 'react';

export interface FilterChip {
  id: string;
  label: string;
  value: string;
}

export interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  activeFilters?: FilterChip[];
  onRemoveFilter?: (id: string) => void;
  onClearAllFilters?: () => void;
  filtersSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchPlaceholder = 'Search VIN, chassis, or booking…',
  searchValue,
  onSearchChange,
  activeFilters = [],
  onRemoveFilter,
  onClearAllFilters,
  filtersSlot,
  actionsSlot,
  className = '',
}) => {
  return (
    <div className={`flex flex-col border-b border-line bg-canvas ${className}`}>
      {/* Primary 48px Control Row */}
      <div className="flex items-center gap-3 px-4 h-12">
        {/* Search Input (Grows) */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-ink-3">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-8 pl-8 pr-3 text-xs bg-surface border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* Dropdown Filters Slot */}
        {filtersSlot && <div className="flex items-center gap-2">{filtersSlot}</div>}

        <div className="flex-1" />

        {/* Right Actions Slot */}
        {actionsSlot && <div className="flex items-center gap-2">{actionsSlot}</div>}
      </div>

      {/* Active Filter Chips Sub-row */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 border-t border-line bg-surface flex-wrap text-xs">
          <span className="text-ink-3 font-medium">Active:</span>
          {activeFilters.map((filter) => (
            <span
              key={filter.id}
              className="inline-flex items-center gap-1.5 h-6 pl-2 pr-1.5 rounded-chip bg-canvas border border-line text-ink-2"
            >
              <span>{filter.label}:</span>
              <span className="font-semibold text-ink">{filter.value}</span>
              {onRemoveFilter && (
                <button
                  type="button"
                  onClick={() => onRemoveFilter(filter.id)}
                  className="w-4 h-4 rounded hover:bg-line flex items-center justify-center text-ink-3 hover:text-ink"
                  aria-label={`Remove filter ${filter.label}`}
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </span>
          ))}
          {onClearAllFilters && (
            <button
              type="button"
              onClick={onClearAllFilters}
              className="text-accent hover:underline font-medium ml-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
};
