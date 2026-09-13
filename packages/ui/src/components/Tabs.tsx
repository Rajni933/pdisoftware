import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <nav
      role="tablist"
      aria-label="Tabs"
      className={`flex items-center gap-4 border-b border-line overflow-x-auto select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 h-10 px-1 text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
              isActive
                ? 'text-accent border-b-2 border-accent font-semibold -mb-px'
                : 'text-ink-2 hover:text-ink'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-mono tabular-nums leading-none ${
                  isActive ? 'bg-accent-soft text-accent' : 'bg-canvas text-ink-3'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
