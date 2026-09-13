import React from 'react';
import { Modal } from '@autoprime/ui';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: '/', description: 'Focus global VIN/record search' },
  { key: 'g then v', description: 'Go to Vehicles queue' },
  { key: 'g then q', description: 'Go to QA review queue' },
  { key: 'g then p', description: 'Go to PDI inspections' },
  { key: 'g then d', description: 'Go to Operations dashboard' },
  { key: 'j / k', description: 'Move table row selection up / down' },
  { key: 'Enter', description: 'Open currently selected record' },
  { key: 'Esc', description: 'Close modal or clear active filter' },
  { key: '?', description: 'Open this keyboard shortcuts cheat sheet' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      size="sm"
    >
      <div className="flex flex-col gap-3 py-1">
        <p className="text-xs text-ink-3">
          Power keys for dealership managers and yard supervisors to navigate the platform without mouse travel.
        </p>

        <div className="border border-line rounded divide-y divide-line text-xs">
          {SHORTCUTS.map((sc) => (
            <div key={sc.key} className="flex items-center justify-between px-3 py-2">
              <span className="text-ink">{sc.description}</span>
              <kbd className="px-1.5 py-0.5 bg-canvas border border-line rounded text-[11px] font-mono text-ink-2 font-medium">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
