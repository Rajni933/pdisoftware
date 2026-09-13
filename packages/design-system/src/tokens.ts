/**
 * Autoprime Tata PDI Management Platform
 * Design Tokens — TypeScript Constants & Types
 * 
 * 01 — Foundations Single Source of Truth
 */

export const primitives = {
  neutrals: {
    n0:   '#FFFFFF',
    n25:  '#FBFCFD',
    n50:  '#F4F6F8',
    n100: '#E9EDF1',
    n200: '#D7DEE5',
    n300: '#B9C4CF',
    n400: '#8A97A6',
    n500: '#667487',
    n600: '#4A5766',
    n700: '#33404E',
    n800: '#1F2A36',
    n900: '#121A23',
  },
  navy: {
    b50:  '#EDF2FA',
    b100: '#D6E1F2',
    b300: '#6E8CBF',
    b400: '#3C63A3',
    b500: '#1A3A6B',
    b600: '#15305A',
    b700: '#0F2445',
    b900: '#0A1930',
  },
  brandRed: '#C8102E',
  semantic: {
    green500: '#0F7A46',
    green50:  '#E8F6EF',
    green200: '#A5DCC1',

    amber500: '#8A5A00',
    amber50:  '#FDF4E3',
    amber200: '#F0CE8A',
    amber600: '#C2670B',

    red500:   '#B3261E',
    red50:    '#FDECEB',
    red200:   '#F2B5B0',

    blue500:  '#15558D',
    blue50:   '#EAF1F9',
    blue200:  '#A9C7E6',

    teal500:  '#2F6E75',
  },
} as const;

export const colors = {
  // Surfaces & Backgrounds
  canvas:        primitives.neutrals.n25,
  surface:       primitives.neutrals.n0,
  surfaceHover:  primitives.neutrals.n50,
  surfaceActive: primitives.neutrals.n100,

  // Borders
  lineSubtle:    primitives.neutrals.n100,
  line:          primitives.neutrals.n200,
  lineStrong:    primitives.neutrals.n300,

  // Inks / Text
  ink:           primitives.neutrals.n900,
  inkHeading:    primitives.neutrals.n800,
  inkBody:       primitives.neutrals.n700,
  ink2:          primitives.neutrals.n600,
  ink3:          primitives.neutrals.n500,
  inkDisabled:   primitives.neutrals.n400,

  // Action / Navy
  accent: {
    DEFAULT:  primitives.navy.b500,
    hover:    primitives.navy.b600,
    pressed:  primitives.navy.b700,
    disabled: primitives.navy.b300,
    soft:     primitives.navy.b50,
    line:     primitives.navy.b100,
    focus:    primitives.navy.b400,
  },

  // Semantic
  semantic: {
    ok: {
      DEFAULT: primitives.semantic.green500,
      soft:    primitives.semantic.green50,
      line:    primitives.semantic.green200,
    },
    warn: {
      DEFAULT: primitives.semantic.amber500,
      soft:    primitives.semantic.amber50,
      line:    primitives.semantic.amber200,
    },
    danger: {
      DEFAULT: primitives.semantic.red500,
      soft:    primitives.semantic.red50,
      line:    primitives.semantic.red200,
    },
    info: {
      DEFAULT: primitives.semantic.blue500,
      soft:    primitives.semantic.blue50,
      line:    primitives.semantic.blue200,
    },
  },

  brandTata: primitives.brandRed,
} as const;

export const color = colors;

export const statusFamily = {
  intake: {
    label: 'Intake',
    color: primitives.neutrals.n600,
    glyph: 'Inbox',
    statuses: ['RECEIVED', 'PDI_PENDING'],
  },
  inProgress: {
    label: 'In progress',
    color: primitives.semantic.blue500,
    glyph: 'Loader',
    statuses: ['PDI_IN_PROGRESS', 'REPAIR_IN_PROGRESS', 'REINSPECTION'],
  },
  waiting: {
    label: 'Waiting',
    color: primitives.semantic.amber500,
    glyph: 'Clock',
    statuses: ['REPAIR_PENDING', 'QA_PENDING'],
  },
  blocked: {
    label: 'Blocked',
    color: primitives.semantic.red500,
    glyph: 'OctagonAlert',
    statuses: ['FAILED', 'QA_REJECTED'],
  },
  cleared: {
    label: 'Cleared',
    color: primitives.semantic.green500,
    glyph: 'Check',
    statuses: ['REPAIR_COMPLETED', 'PDI_APPROVED', 'DELIVERY_READY'],
  },
  closed: {
    label: 'Closed',
    color: primitives.neutrals.n400,
    glyph: 'Archive',
    statuses: ['DELIVERED'],
  },
} as const;

export const severity = {
  CRITICAL: {
    label: 'Critical',
    color: primitives.semantic.red500,
    glyph: 'OctagonAlert',
    rule: 'Photo mandatory · fails the PDI',
  },
  MAJOR: {
    label: 'Major',
    color: primitives.semantic.amber600,
    glyph: 'TriangleAlert',
    rule: 'Photo mandatory · fails the PDI',
  },
  MINOR: {
    label: 'Minor',
    color: primitives.semantic.teal500,
    glyph: 'CircleAlert',
    rule: 'Photo optional · does not block',
  },
  OBSERVATION: {
    label: 'Observation',
    color: primitives.neutrals.n500,
    glyph: 'Eye',
    rule: 'Photo optional · does not block',
  },
} as const;

export const typography = {
  fonts: {
    sans: "'IBM Plex Sans', -apple-system, 'Segoe UI', Roboto, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, 'SF Mono', Consolas, monospace",
    deva: "'IBM Plex Sans Devanagari', 'IBM Plex Sans', sans-serif",
  },
  scale: {
    tDisplay: { size: '2rem', lineHeight: '2.375rem', weight: 600, tracking: '-0.02em' },   // 32/38
    tH1:      { size: '1.5rem', lineHeight: '2rem', weight: 600, tracking: '-0.015em' },      // 24/32
    tH2:      { size: '1.1875rem', lineHeight: '1.625rem', weight: 600, tracking: '-0.01em' }, // 19/26
    tH3:      { size: '1rem', lineHeight: '1.5rem', weight: 600, tracking: '0' },             // 16/24
    tBodyLg:  { size: '1rem', lineHeight: '1.5rem', weight: 400, tracking: '0' },             // 16/24
    tBody:    { size: '0.875rem', lineHeight: '1.375rem', weight: 400, tracking: '0' },      // 14/22
    tBodySm:  { size: '0.8125rem', lineHeight: '1.25rem', weight: 400, tracking: '0' },      // 13/20
    tLabel:   { size: '0.8125rem', lineHeight: '1.125rem', weight: 500, tracking: '0' },     // 13/18
    tCaption: { size: '0.75rem', lineHeight: '1.125rem', weight: 400, tracking: '0' },        // 12/18
    tMicro:   { size: '0.6875rem', lineHeight: '1rem', weight: 500, tracking: '0.01em' },     // 11/16
    tMono:    { size: '0.8125rem', lineHeight: '1.25rem', weight: 400, tracking: '0' },      // 13/20
    tMonoLg:  { size: '0.9375rem', lineHeight: '1.375rem', weight: 500, tracking: '0' },     // 15/22
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
  },
} as const;

export const type = typography;

export const spacing = {
  1:   '0.25rem',  // 4px
  1.5: '0.375rem', // 6px (label to control)
  2:   '0.5rem',   // 8px
  3:   '0.75rem',  // 12px
  4:   '1rem',     // 16px
  5:   '1.25rem',  // 20px
  6:   '1.5rem',   // 24px
  8:   '2rem',     // 32px
  10:  '2.5rem',   // 40px
  12:  '3rem',     // 48px
  16:  '4rem',     // 64px
} as const;

export const space = spacing;

export const radii = {
  xs:   '3px',
  sm:   '6px',
  md:   '10px',
  full: '999px',
  // Aliases
  chip:    '3px',
  default: '6px',
  panel:   '10px',
} as const;

export const radius = radii;

export const shadows = {
  none:    'none',
  popover: '0 4px 12px -2px rgba(18,26,35,.10), 0 0 0 1px rgba(18,26,35,.05)',
  modal:   '0 16px 40px -8px rgba(18,26,35,.18), 0 0 0 1px rgba(18,26,35,.06)',
  sticky:  '0 -2px 8px -2px rgba(18,26,35,.08)',
  pop:     '0 16px 40px -8px rgba(18,26,35,.18), 0 0 0 1px rgba(18,26,35,.06)',
} as const;

export const shadow = shadows;

export const zIndex = {
  base:     0,
  raised:   10,
  sticky:   100,
  dropdown: 200,
  overlay:  300,
  modal:    400,
  toast:    500,
} as const;

export const motion = {
  duration: {
    micro: '120ms',
    enter: '180ms',
    exit:  '140ms',
    sheet: '240ms',
  },
  easing: {
    out:  'cubic-bezier(0.2, 0.8, 0.2, 1)',
    in:   'cubic-bezier(0.4, 0, 1, 1)',
    move: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const focus = {
  ring: '0 0 0 2px var(--color-surface), 0 0 0 4px var(--p-b-400)',
} as const;

export const yardMode = {
  minTouchTarget: 52,
  railWidth: 5,
  thumbnailSize: 88,
  borderColor: primitives.neutrals.n300,
} as const;

export const statusRail = {
  width: '3px',
  yardWidth: '5px',
  colors: {
    passed:     primitives.semantic.green500,
    inProgress: primitives.semantic.blue500,
    waiting:    primitives.semantic.amber500,
    failed:     primitives.semantic.red500,
    pending:    primitives.neutrals.n300,
  },
} as const;

export const charts = {
  palette: [
    primitives.navy.b500,        // #1A3A6B
    primitives.semantic.teal500,  // #2F6E75
    primitives.semantic.amber600, // #C2670B
    primitives.neutrals.n500,     // #667487
  ],
  series1: primitives.navy.b500,
  series2: primitives.semantic.teal500,
  series3: primitives.semantic.amber600,
  series4: primitives.neutrals.n500,
  grid: primitives.neutrals.n100,
} as const;

export const icons = {
  strokeWidth: 1.5,
  sizes: {
    table: 16,
    default: 20,
    mobile: 24,
    yard: 28,
  },
} as const;

export type Primitives = typeof primitives;
export type ColorToken = typeof colors;
export type TypographyToken = typeof typography;
export type SpacingToken = typeof spacing;
export type RadiiToken = typeof radii;
export type ShadowsToken = typeof shadows;
export type StatusFamily = typeof statusFamily;
export type Severity = typeof severity;
export type MotionToken = typeof motion;
export type ChartsToken = typeof charts;
export type IconsToken = typeof icons;

