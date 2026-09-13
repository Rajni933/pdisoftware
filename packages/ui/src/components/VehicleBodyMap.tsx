import React from 'react';

export type VehiclePanelId =
  | 'front_bumper'
  | 'hood'
  | 'windshield'
  | 'roof'
  | 'rear_windshield'
  | 'trunk'
  | 'rear_bumper'
  | 'fender_fl'
  | 'door_fl'
  | 'door_rl'
  | 'quarter_rl'
  | 'fender_fr'
  | 'door_fr'
  | 'door_rr'
  | 'quarter_rr'
  | 'wheel_fl'
  | 'wheel_fr'
  | 'wheel_rl'
  | 'wheel_rr';

export interface VehicleBodyMapProps {
  findings?: Partial<Record<VehiclePanelId, number>>;
  selectedPanel?: VehiclePanelId | null;
  onSelectPanel?: (panelId: VehiclePanelId) => void;
  className?: string;
  readOnly?: boolean;
}

interface PanelDefinition {
  id: VehiclePanelId;
  name: string;
  path: string;
  badgePos: { x: number; y: number };
  hitArea: { x: number; y: number; width: number; height: number };
}

const PANELS: PanelDefinition[] = [
  {
    id: 'front_bumper',
    name: 'Front Bumper',
    path: 'M 75 35 C 100 20 160 20 185 35 C 190 45 185 55 180 58 C 150 50 110 50 80 58 C 75 55 70 45 75 35 Z',
    badgePos: { x: 130, y: 38 },
    hitArea: { x: 108, y: 16, width: 44, height: 44 },
  },
  {
    id: 'hood',
    name: 'Bonnet / Hood',
    path: 'M 78 60 C 110 52 150 52 182 60 L 186 130 C 150 125 110 125 74 130 Z',
    badgePos: { x: 130, y: 92 },
    hitArea: { x: 108, y: 70, width: 44, height: 44 },
  },
  {
    id: 'windshield',
    name: 'Front Windshield',
    path: 'M 75 132 C 110 127 150 127 185 132 L 180 175 C 150 170 110 170 80 175 Z',
    badgePos: { x: 130, y: 152 },
    hitArea: { x: 108, y: 130, width: 44, height: 44 },
  },
  {
    id: 'roof',
    name: 'Roof Panel',
    path: 'M 80 177 C 110 172 150 172 180 177 L 180 275 C 150 278 110 278 80 275 Z',
    badgePos: { x: 130, y: 226 },
    hitArea: { x: 108, y: 204, width: 44, height: 44 },
  },
  {
    id: 'rear_windshield',
    name: 'Rear Glass',
    path: 'M 80 277 C 110 280 150 280 180 277 L 183 318 C 150 322 110 322 77 318 Z',
    badgePos: { x: 130, y: 298 },
    hitArea: { x: 108, y: 276, width: 44, height: 44 },
  },
  {
    id: 'trunk',
    name: 'Boot / Tailgate',
    path: 'M 76 320 C 110 324 150 324 184 320 L 186 385 C 150 390 110 390 74 385 Z',
    badgePos: { x: 130, y: 352 },
    hitArea: { x: 108, y: 330, width: 44, height: 44 },
  },
  {
    id: 'rear_bumper',
    name: 'Rear Bumper',
    path: 'M 74 387 C 110 392 150 392 186 387 C 189 398 185 412 178 418 C 150 423 110 423 82 418 C 75 412 71 398 74 387 Z',
    badgePos: { x: 130, y: 403 },
    hitArea: { x: 108, y: 381, width: 44, height: 44 },
  },
  // Left Side Panels
  {
    id: 'fender_fl',
    name: 'Front Left Fender',
    path: 'M 74 58 L 76 130 L 52 130 C 50 110 50 80 54 60 Z',
    badgePos: { x: 62, y: 92 },
    hitArea: { x: 40, y: 70, width: 44, height: 44 },
  },
  {
    id: 'door_fl',
    name: 'Front Left Door',
    path: 'M 77 132 L 79 205 L 52 205 L 52 132 Z',
    badgePos: { x: 64, y: 168 },
    hitArea: { x: 42, y: 146, width: 44, height: 44 },
  },
  {
    id: 'door_rl',
    name: 'Rear Left Door',
    path: 'M 79 207 L 80 276 L 52 276 L 52 207 Z',
    badgePos: { x: 64, y: 241 },
    hitArea: { x: 42, y: 219, width: 44, height: 44 },
  },
  {
    id: 'quarter_rl',
    name: 'Rear Left Quarter',
    path: 'M 80 278 L 74 385 L 53 385 C 50 350 50 310 52 278 Z',
    badgePos: { x: 63, y: 331 },
    hitArea: { x: 41, y: 309, width: 44, height: 44 },
  },
  // Right Side Panels
  {
    id: 'fender_fr',
    name: 'Front Right Fender',
    path: 'M 184 58 L 186 130 L 208 130 C 210 110 210 80 206 60 Z',
    badgePos: { x: 198, y: 92 },
    hitArea: { x: 176, y: 70, width: 44, height: 44 },
  },
  {
    id: 'door_fr',
    name: 'Front Right Door',
    path: 'M 183 132 L 181 205 L 208 205 L 208 132 Z',
    badgePos: { x: 196, y: 168 },
    hitArea: { x: 174, y: 146, width: 44, height: 44 },
  },
  {
    id: 'door_rr',
    name: 'Rear Right Door',
    path: 'M 181 207 L 180 276 L 208 276 L 208 207 Z',
    badgePos: { x: 196, y: 241 },
    hitArea: { x: 174, y: 219, width: 44, height: 44 },
  },
  {
    id: 'quarter_rr',
    name: 'Rear Right Quarter',
    path: 'M 180 278 L 186 385 L 207 385 C 210 350 210 310 208 278 Z',
    badgePos: { x: 197, y: 331 },
    hitArea: { x: 175, y: 309, width: 44, height: 44 },
  },
  // Wheels
  {
    id: 'wheel_fl',
    name: 'Front Left Wheel',
    path: 'M 36 78 L 48 78 L 48 116 L 36 116 Z',
    badgePos: { x: 42, y: 97 },
    hitArea: { x: 20, y: 75, width: 44, height: 44 },
  },
  {
    id: 'wheel_fr',
    name: 'Front Right Wheel',
    path: 'M 212 78 L 224 78 L 224 116 L 212 116 Z',
    badgePos: { x: 218, y: 97 },
    hitArea: { x: 196, y: 75, width: 44, height: 44 },
  },
  {
    id: 'wheel_rl',
    name: 'Rear Left Wheel',
    path: 'M 36 328 L 48 328 L 48 366 L 36 366 Z',
    badgePos: { x: 42, y: 347 },
    hitArea: { x: 20, y: 325, width: 44, height: 44 },
  },
  {
    id: 'wheel_rr',
    name: 'Rear Right Wheel',
    path: 'M 212 328 L 224 328 L 224 366 L 212 366 Z',
    badgePos: { x: 218, y: 347 },
    hitArea: { x: 196, y: 325, width: 44, height: 44 },
  },
];

export const VehicleBodyMap: React.FC<VehicleBodyMapProps> = ({
  findings = {},
  selectedPanel = null,
  onSelectPanel,
  className = '',
  readOnly = false,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center p-2 ${className}`}>
      <svg
        viewBox="0 0 260 440"
        className="w-full max-w-[260px] h-auto select-none overflow-visible"
        aria-label="Vehicle body inspection map"
      >
        {/* Outer vehicle chassis baseline */}
        <path
          d="M 75 35 C 100 20 160 20 185 35 C 210 55 212 100 208 140 L 208 360 C 212 390 200 415 178 418 C 150 423 110 423 82 418 C 60 415 48 390 52 360 L 52 140 C 48 100 50 55 75 35 Z"
          fill="none"
          stroke="var(--color-border-subtle)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Tappable Panel Regions */}
        {PANELS.map((panel) => {
          const findingCount = findings[panel.id] || 0;
          const hasFinding = findingCount > 0;
          const isSelected = selectedPanel === panel.id;

          // Compute styling strictly per 04-icons-motion §2
          const fillColor = hasFinding
            ? 'var(--color-danger-soft)'
            : isSelected
            ? 'var(--p-b-50)'
            : 'var(--color-surface)';

          const strokeColor = hasFinding
            ? 'var(--color-danger)'
            : isSelected
            ? 'var(--color-action)'
            : 'var(--color-border)';

          const strokeWidth = isSelected ? 2 : 1.5;

          return (
            <g
              key={panel.id}
              role={readOnly ? 'img' : 'button'}
              tabIndex={readOnly ? -1 : 0}
              aria-label={`${panel.name}${hasFinding ? ` (${findingCount} defect${findingCount > 1 ? 's' : ''})` : ''}`}
              aria-pressed={isSelected}
              onClick={() => !readOnly && onSelectPanel?.(panel.id)}
              onKeyDown={(e) => {
                if (!readOnly && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectPanel?.(panel.id);
                }
              }}
              className={`transition-colors duration-140 ${
                readOnly ? 'cursor-default' : 'cursor-pointer group'
              } focus:outline-none`}
            >
              {/* Visible Panel Path: 1.5px stroke matching icon system */}
              <path
                d={panel.path}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                className={`transition-all duration-140 ${
                  !readOnly && !hasFinding && !isSelected ? 'group-hover:fill-neutral-50' : ''
                }`}
              />

              {/* Finding Indicator Badge if issues logged */}
              {hasFinding && (
                <g transform={`translate(${panel.badgePos.x}, ${panel.badgePos.y})`}>
                  <circle r="8" fill="var(--color-danger)" />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--color-surface)"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fontWeight="600"
                  >
                    {findingCount}
                  </text>
                </g>
              )}

              {/* 44x44 Touch Hit-Area Overlay for gloves and Yard Mode */}
              {!readOnly && (
                <rect
                  x={panel.hitArea.x}
                  y={panel.hitArea.y}
                  width={panel.hitArea.width}
                  height={panel.hitArea.height}
                  fill="transparent"
                  className="pointer-events-auto"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
