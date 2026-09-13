import React from 'react';
import { StatusFamilyVariant } from './Chip';

export interface TimelineEntry {
  id: string;
  actor: string;
  role?: string;
  action: string;
  timestamp: string;
  fromState?: string;
  toState?: string;
  family?: StatusFamilyVariant;
  notes?: string;
}

export interface TimelineGroup {
  dateLabel: string;
  entries: TimelineEntry[];
}

export interface TimelineProps {
  groups: TimelineGroup[];
  className?: string;
}

const dotColors: Record<StatusFamilyVariant, string> = {
  intake:     'bg-ink-2',
  inProgress: 'bg-accent',
  waiting:    'bg-warn',
  blocked:    'bg-danger',
  cleared:    'bg-ok',
  closed:     'bg-ink-3',
};

export const Timeline: React.FC<TimelineProps> = ({ groups, className = '' }) => {
  return (
    <div className={`space-y-6 select-text ${className}`}>
      {groups.map((group) => (
        <div key={group.dateLabel} className="relative">
          {/* Sticky Day Label */}
          <div className="sticky top-0 z-10 bg-canvas/90 py-1 mb-3">
            <span className="text-xs font-semibold text-ink-2 uppercase tracking-wider bg-surface px-2 py-0.5 rounded border border-line">
              {group.dateLabel}
            </span>
          </div>

          {/* Timeline Items */}
          <div className="relative pl-6 space-y-5 border-l border-line ml-2.5">
            {group.entries.map((entry) => {
              const dotClass = dotColors[entry.family || 'intake'];
              return (
                <div key={entry.id} className="relative group">
                  {/* 8px Dot Node */}
                  <span
                    className={`absolute -left-[29px] top-1 w-2 h-2 rounded-full ring-4 ring-surface ${dotClass}`}
                    aria-hidden="true"
                  />

                  {/* Header: Actor & Timestamp */}
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-ink">{entry.actor}</span>
                      {entry.role && <span className="text-ink-3">({entry.role})</span>}
                      <span className="text-ink-3">•</span>
                      <span className="text-ink-2">{entry.action}</span>
                    </div>
                    <span className="font-mono text-ink-3 tabular-nums text-[11px] shrink-0">
                      {entry.timestamp}
                    </span>
                  </div>

                  {/* State Transition Chips (From → To) */}
                  {entry.fromState && entry.toState && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                      <span className="px-1.5 py-0.5 rounded-chip text-[11px] bg-canvas border border-line text-ink-2">
                        {entry.fromState}
                      </span>
                      <span className="text-ink-3">→</span>
                      <span className="px-1.5 py-0.5 rounded-chip text-[11px] bg-accent-soft border border-accent-line text-accent font-medium">
                        {entry.toState}
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {entry.notes && (
                    <p className="text-xs text-ink-2 bg-canvas p-2.5 rounded border border-line mt-2 leading-relaxed">
                      {entry.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
