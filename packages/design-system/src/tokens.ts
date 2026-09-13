/**
 * Autoprime PDI — design tokens for TypeScript consumers.
 * Web should prefer the CSS custom properties in tokens.css.
 * This file exists for React Native (no CSS vars) and for logic that needs
 * to map a domain value (status, severity) to a visual treatment.
 *
 * Never hard-code a colour anywhere else in the codebase.
 */

export const color = {
  bg: '#FBFCFD',
  surface: '#FFFFFF',
  surfaceSunken: '#F4F6F8',
  surfaceHover: '#F4F6F8',
  surfaceSelected: '#EDF2FA',
  backdrop: 'rgba(18,26,35,0.45)',

  textPrimary: '#121A23',
  textSecondary: '#4A5766',
  textTertiary: '#667487',
  textDisabled: '#8A97A6',
  textInverse: '#FFFFFF',

  borderSubtle: '#E9EDF1',
  border: '#D7DEE5',
  borderStrong: '#B9C4CF',
  borderFocus: '#3C63A3',

  action: '#1A3A6B',
  actionHover: '#15305A',
  actionPressed: '#0F2445',
  actionDisabled: '#6E8CBF',
  actionSoft: '#EDF2FA',

  success: '#0F7A46', successSoft: '#E8F6EF', successBorder: '#A5DCC1',
  warning: '#8A5A00', warningSoft: '#FDF4E3', warningBorder: '#F0CE8A',
  danger:  '#B3261E', dangerSoft:  '#FDECEB', dangerBorder:  '#F2B5B0',
  info:    '#15558D', infoSoft:    '#EAF1F9', infoBorder:    '#A9C7E6',

  /** Logo lockup only. Never use in interactive or semantic UI. */
  brandRed: '#C8102E',

  chart: ['#1A3A6B', '#2F6E75', '#C2670B', '#667487'] as const,
} as const;

export const space = {
  0: 0, 1: 4, 1.5: 6, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
} as const;

export const radius = { xs: 3, sm: 6, md: 10, full: 999 } as const;

export const type = {
  display: { size: 32, lh: 38, weight: '600' },
  h1:      { size: 24, lh: 32, weight: '600' },
  h2:      { size: 19, lh: 26, weight: '600' },
  h3:      { size: 16, lh: 24, weight: '600' },
  bodyLg:  { size: 16, lh: 24, weight: '400' },
  body:    { size: 14, lh: 22, weight: '400' },
  bodySm:  { size: 13, lh: 20, weight: '400' },
  label:   { size: 13, lh: 18, weight: '500' },
  caption: { size: 12, lh: 18, weight: '400' },
  micro:   { size: 11, lh: 16, weight: '500' },
  mono:    { size: 13, lh: 20, weight: '400' },
  monoLg:  { size: 15, lh: 22, weight: '500' },
} as const;

export const font = {
  sans: 'IBMPlexSans-Regular',
  sansMedium: 'IBMPlexSans-Medium',
  sansSemiBold: 'IBMPlexSans-SemiBold',
  mono: 'IBMPlexMono-Regular',
} as const;

export const motion = {
  micro: 120, enter: 180, exit: 140, sheet: 240,
  easeOut: [0.2, 0.8, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeMove: [0.4, 0, 0.2, 1],
} as const;

export const size = {
  touchMin: 44,
  touchMinYard: 52,
  controlSm: 28, controlMd: 36, controlLg: 44, controlXl: 52,
  rowH: 44, rowHDense: 36,
  rail: 3, railYard: 5,
  photoThumb: 64, photoThumbYard: 88,
} as const;

/* ------------------------------------------------------------------ */
/* Domain maps — the single place a domain value becomes a visual      */
/* ------------------------------------------------------------------ */

export type StatusFamily = 'intake' | 'active' | 'waiting' | 'blocked' | 'cleared' | 'closed';

export const statusFamily = {
  intake:  { fg: '#4A5766', bg: '#E9EDF1', bd: '#B9C4CF', icon: 'inbox' },
  active:  { fg: '#15558D', bg: '#EAF1F9', bd: '#A9C7E6', icon: 'play' },
  waiting: { fg: '#8A5A00', bg: '#FDF4E3', bd: '#F0CE8A', icon: 'clock' },
  blocked: { fg: '#B3261E', bg: '#FDECEB', bd: '#F2B5B0', icon: 'octagon-alert' },
  cleared: { fg: '#0F7A46', bg: '#E8F6EF', bd: '#A5DCC1', icon: 'check' },
  closed:  { fg: '#8A97A6', bg: '#F4F6F8', bd: '#D7DEE5', icon: 'archive' },
} as const;

export type VehicleStatus =
  | 'RECEIVED' | 'PDI_PENDING' | 'PDI_IN_PROGRESS' | 'FAILED'
  | 'REPAIR_PENDING' | 'REPAIR_IN_PROGRESS' | 'REPAIR_COMPLETED'
  | 'REINSPECTION' | 'QA_PENDING' | 'QA_REJECTED' | 'PDI_APPROVED'
  | 'DELIVERY_READY' | 'DELIVERED';

/** Status → family + the exact label shown to users. Labels are sentence case. */
export const vehicleStatus: Record<VehicleStatus, { family: StatusFamily; label: string }> = {
  RECEIVED:            { family: 'intake',  label: 'Received' },
  PDI_PENDING:         { family: 'intake',  label: 'PDI pending' },
  PDI_IN_PROGRESS:     { family: 'active',  label: 'Inspection in progress' },
  FAILED:              { family: 'blocked', label: 'Failed' },
  REPAIR_PENDING:      { family: 'waiting', label: 'Repair pending' },
  REPAIR_IN_PROGRESS:  { family: 'active',  label: 'Repair in progress' },
  REPAIR_COMPLETED:    { family: 'cleared', label: 'Repair completed' },
  REINSPECTION:        { family: 'active',  label: 'Reinspection' },
  QA_PENDING:          { family: 'waiting', label: 'QA pending' },
  QA_REJECTED:         { family: 'blocked', label: 'QA rejected' },
  PDI_APPROVED:        { family: 'cleared', label: 'Approved' },
  DELIVERY_READY:      { family: 'cleared', label: 'Ready for delivery' },
  DELIVERED:           { family: 'closed',  label: 'Delivered' },
};

export type Severity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'OBSERVATION';

export const severity: Record<Severity, {
  fg: string; bg: string; bd: string; icon: string; label: string;
  blocksDelivery: boolean; photoRequired: boolean;
}> = {
  CRITICAL:    { fg: '#B3261E', bg: '#FDECEB', bd: '#F2B5B0', icon: 'octagon-alert',  label: 'Critical',    blocksDelivery: true,  photoRequired: true },
  MAJOR:       { fg: '#C2670B', bg: '#FDF1E4', bd: '#F2CBA0', icon: 'triangle-alert', label: 'Major',       blocksDelivery: true,  photoRequired: true },
  MINOR:       { fg: '#2F6E75', bg: '#E8F3F4', bd: '#A8D2D6', icon: 'circle-alert',   label: 'Minor',       blocksDelivery: false, photoRequired: false },
  OBSERVATION: { fg: '#667487', bg: '#F1F3F6', bd: '#CBD3DC', icon: 'eye',            label: 'Observation', blocksDelivery: false, photoRequired: false },
};

/** Severity display order — always CRITICAL first. Never sort alphabetically. */
export const severityOrder: Severity[] = ['CRITICAL', 'MAJOR', 'MINOR', 'OBSERVATION'];

// Compatibility aliases
export const colors = color;
export const spaceScale = space;
export const spacing = space;
export const radii = radius;
export const typography = type;
