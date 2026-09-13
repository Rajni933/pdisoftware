/**
 * Autoprime Tata PDI Management Platform
 * Design Tokens — TypeScript Constants & Types
 * 
 * Single Source of Truth for frontend applications (Web, Mobile, Admin, UI Primitives).
 */

export const colors = {
  canvas: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceHover: '#F7F8F9',
  surfaceActive: '#F0F2F5',

  line: '#E8EAED',
  lineStrong: '#D7DBE0',
  lineSubtle: '#F1F3F5',

  ink: '#0E1116',
  ink2: '#4A5159',
  ink3: '#858C95',
  inkDisabled: '#B0B7C0',

  accent: {
    DEFAULT: '#1A3A6B',
    hover: '#254B85',
    soft: '#EEF2F8',
    line: '#C9D6E8',
    600: '#254B85',
    400: '#5B7CAE',
    300: '#8AA3C6',
    200: '#B6C5DA',
  },

  semantic: {
    ok: {
      DEFAULT: '#0B7355',
      soft: '#E8F5E9',
      line: '#A3D9C9',
    },
    warn: {
      DEFAULT: '#A65A00',
      soft: '#FFF8E1',
      line: '#FFE082',
    },
    danger: {
      DEFAULT: '#B3253C',
      soft: '#FFEBEE',
      line: '#FFCDD2',
    },
  },

  /** Tata Red — ONLY for brand logo lockup, NEVER in product UI */
  brandTata: '#C8102E',
} as const;

export const color = colors;

export const typography = {
  fonts: {
    sans: '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
  sizes: {
    label: { size: '0.6875rem', lineHeight: '1rem', letterSpacing: '0.06em' },   // 11px
    xs: { size: '0.75rem', lineHeight: '1.125rem' },                               // 12px
    sm: { size: '0.8125rem', lineHeight: '1.25rem' },                              // 13px
    base: { size: '0.875rem', lineHeight: '1.375rem' },                            // 14px
    lg: { size: '1.0625rem', lineHeight: '1.5rem', letterSpacing: '-0.011em' },     // 17px
    num: { size: '1.625rem', lineHeight: '1.875rem', letterSpacing: '-0.02em' },    // 26px
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    // Note: 700+ is strictly banned in this design system
  },
} as const;

export const type = typography;

export const spacing = {
  1: '0.125rem', // 2px
  2: '0.25rem',  // 4px
  3: '0.375rem', // 6px (label to control)
  4: '0.5rem',   // 8px
  6: '0.75rem',  // 12px (related fields)
  8: '1rem',     // 16px (groups)
  10: '1.25rem', // 20px
  12: '1.5rem',  // 24px (gutters)
  16: '2rem',    // 32px (major sections)
  24: '3rem',    // 48px
  32: '4rem',    // 64px
} as const;

export const space = spacing;

export const radii = {
  chip: '4px',
  default: '6px',
  panel: '10px',
} as const;

export const radius = radii;

export const shadows = {
  none: 'none',
  // Exactly one elevation, reserved only for floating layers (modals, dropdowns, popovers, toasts)
  pop: '0 8px 28px -6px rgba(14,17,22,0.16), 0 2px 6px -2px rgba(14,17,22,0.08)',
} as const;

export const shadow = shadows;

export const statusFamily = {
  ok: {
    label: 'Passed',
    color: colors.semantic.ok.DEFAULT,
    background: colors.semantic.ok.soft,
    border: colors.semantic.ok.line,
  },
  inProgress: {
    label: 'In Progress',
    color: colors.semantic.warn.DEFAULT,
    background: colors.semantic.warn.soft,
    border: colors.semantic.warn.line,
  },
  pending: {
    label: 'Pending',
    color: colors.ink2,
    background: colors.canvas,
    border: colors.lineStrong,
  },
  failed: {
    label: 'Failed',
    color: colors.semantic.danger.DEFAULT,
    background: colors.semantic.danger.soft,
    border: colors.semantic.danger.line,
  },
  rejected: {
    label: 'Rejected',
    color: colors.semantic.danger.DEFAULT,
    background: colors.semantic.danger.soft,
    border: colors.semantic.danger.line,
  },
} as const;

export const severity = {
  minor: {
    label: 'Minor',
    color: colors.semantic.warn.DEFAULT,
    background: colors.semantic.warn.soft,
    border: colors.semantic.warn.line,
  },
  major: {
    label: 'Major',
    color: colors.semantic.danger.DEFAULT,
    background: colors.semantic.danger.soft,
    border: colors.semantic.danger.line,
  },
  critical: {
    label: 'Critical',
    color: colors.semantic.danger.DEFAULT,
    background: colors.semantic.danger.soft,
    border: colors.semantic.danger.line,
  },
} as const;

export const statusRail = {
  width: '3px',
  colors: {
    passed: colors.semantic.ok.DEFAULT,
    inProgress: colors.semantic.warn.DEFAULT,
    failed: colors.semantic.danger.DEFAULT,
    pending: colors.lineStrong,
  },
} as const;

export const dimensions = {
  tableRowHeight: 44,
  topBarHeight: 56,
  sidebarWidth: 240,
  sidebarCollapsedWidth: 64,
  touchTargetMinWeb: 32,
  touchTargetMinMobile: 44,
  touchTargetMinYard: 52,
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
  base: '200ms cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

export type ColorToken = typeof colors;
export type TypographyToken = typeof typography;
export type SpacingToken = typeof spacing;
export type RadiiToken = typeof radii;
export type ShadowsToken = typeof shadows;
export type StatusFamily = typeof statusFamily;
export type Severity = typeof severity;
