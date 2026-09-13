# Autoprime PDI — Design Foundations

> **Status:** Locked specification. Do not introduce arbitrary colors, sizes, or font weights.

This document defines the physical foundations of the Autoprime Tata PDI Management Platform interface: color, typography, spacing, border radii, elevation, and motion.

---

## 1. Color System

The color system is built for an operations console: calm, high-contrast, dense, and unambiguous.

### 1.1 Canvas & Surface
- `--canvas` (`#FAFAFA`): The background tone of the application window. Provides subtle contrast against pure white cards without feeling dark or dirty.
- `--surface` (`#FFFFFF`): The background for all content containers (panels, tables, modal bodies, cards).
- `--surface-hover` (`#F7F8F9`): Interactive hover state for table rows, menu items, and clickable list rows.
- `--surface-active` (`#F0F2F5`): Active/pressed state for surfaces.

### 1.2 Lines & Borders
Information separation is achieved primarily through hairlines (1px), never through drop shadows.
- `--line` (`#E8EAED`): The universal structural divider. Used for table cell borders, card outlines, sidebar dividers, header bottom borders.
- `--line-strong` (`#D7DBE0`): Input borders, active table row dividers, high-contrast boundaries.
- `--line-subtle` (`#F1F3F5`): Low-priority internal separators inside dense components.

### 1.3 Ink (Typography Hierarchy)
- `--ink` (`#0E1116`): High-contrast primary text (headings, primary labels, table data, active values). WCAG AAA compliance against `#FFFFFF`.
- `--ink-2` (`#4A5159`): Secondary text, descriptive metadata, body text, table secondary columns, inactive navigation items.
- `--ink-3` (`#858C95`): Muted labels, timestamps, counter hints, form field placeholders, helper text.
- `--ink-disabled` (`#B0B7C0`): Disabled button labels, inactive checkboxes, unselected tab text.

### 1.4 Primary Accent (Operations Navy)
- `--accent` (`#1A3A6B`): The core interactive brand tone. Used for primary buttons, active navigation item pills, active checkboxes, focus rings.
- `--accent-hover` (`#254B85`): Hover state for primary buttons and interactive accents.
- `--accent-soft` (`#EEF2F8`): Soft tint background for active navigation items, selected row highlights, and info badges.
- `--accent-line` (`#C9D6E8`): Border for accent containers, badges, and active inputs.

### 1.5 Semantic Status Colors
Every status is rendered with **glyph + label** (Rule R2).
- **OK / Pass / Synced:**
  - `--ok` (`#0B7355`): Deep emerald green. Used for pass status badges, checkmarks, completion indicators.
  - `--ok-soft` (`#E8F5E9`): Background tint for pass badges.
  - `--ok-line` (`#A3D9C9`): Border for pass badges.
- **Warn / Pending / In-Progress:**
  - `--warn` (`#A65A00`): Amber ochre. Used for in-progress items, inspection pending, warnings.
  - `--warn-soft` (`#FFF8E1`): Background tint for warning badges.
  - `--warn-line` (`#FFE082`): Border for warning badges.
- **Danger / Fail / Defect / Error:**
  - `--danger` (`#B3253C`): Critical ruby red. Used for failed checkpoints, major defects, destructive action buttons.
  - `--danger-soft` (`#FFEBEE`): Background tint for failure badges.
  - `--danger-line` (`#FFCDD2`): Border for failure badges.

### 1.6 The Tata Red Rule
`#C8102E` (Tata brand red) is reserved **exclusively** for the official Tata brand logo mark in the header lockup. It is **BANNED** from being used as an alert, button, badge, or error color anywhere in the application interface. Brand ≠ Alarm.

---

## 2. Typography

Two font families are loaded via Google Fonts / local fallback:
1. **IBM Plex Sans**: All UI text, table labels, headers, form inputs, buttons.
2. **IBM Plex Mono**: VINs, chassis numbers, engine numbers, certificate IDs, timestamps, numeric counters (`font-variant-numeric: tabular-nums`).

### 2.1 Scale & Metrics

| Token | Size | Line Height | Letter Spacing | Purpose |
|---|---|---|---|---|
| `text-label` | 0.6875rem (11px) | 1rem (16px) | `0.06em` | Eyebrow labels, table headers, uppercase badges |
| `text-xs` | 0.75rem (12px) | 1.125rem (18px) | `0` | Secondary metadata, helper text, timestamps |
| `text-sm` | 0.8125rem (13px) | 1.25rem (20px) | `0` | Standard table cell data, body text, form inputs |
| `text-base` | 0.875rem (14px) | 1.375rem (22px) | `0` | Primary navigation, card titles, button labels |
| `text-lg` | 1.0625rem (17px) | 1.5rem (24px) | `-0.011em` | Panel titles, modal headers, page headers |
| `text-num` | 1.625rem (26px) | 1.875rem (30px) | `-0.02em` | KPI metrics, large counter totals |

### 2.2 Weight Constraints
- **400 (Normal)**: Body copy, table cells, secondary text.
- **500 (Medium)**: Form labels, table headers, button labels, badge text.
- **600 (Semibold)**: Page titles, section headings, KPI values.
- **700+ (Bold/Black) is BANNED**: Bold weights create heavy, shouting visual clutter in dense operational tables.

---

## 3. Spacing Rhythm

A strict 4px/8px modular scale is used. No arbitrary pixel margins or paddings:

- `space-1` (2px): Micro offsets, border compensations.
- `space-2` (4px): Chip padding, compact icon-to-text spacing.
- `space-3` (6px): Label-to-input gap.
- `space-4` (8px): Standard component internal padding, compact list item gap.
- `space-6` (12px): Gap between related form fields, button-to-button gap.
- `space-8` (16px): Gap between form groups, table cell horizontal padding, mobile page gutter.
- `space-12` (24px): Desktop page gutters, major container padding.
- `space-16` (32px): Separation between major logical sections on a page.

---

## 4. Border Radii

- `radius-chip` (`4px`): Badges, status chips, segmented controls, small buttons.
- `radius-default` (`6px`): Standard buttons, form text inputs, select dropdowns.
- `radius-panel` (`10px`): Main content panels, table wrappers, dialogs, modals.
- Circular (`rounded-full`) is permitted **only** for user initials avatars or status indicator dots. Banned for buttons or cards.

---

## 5. Elevation: The Separation Law

**Borders separate, shadows elevate.**
- All content containers (panels, tables, cards, stat widgets) have `1px solid var(--line)` and **zero** shadow (`box-shadow: none`).
- Shadow is reserved **strictly** for surfaces that float on the Z-axis above the document plane:
  - Dropdown menus
  - Modals / Dialogs
  - Popovers / Tooltips
  - Toast notifications
  - Mobile Floating Action Bar / Yard Mode quick shutter

```css
--shadow-pop: 0 8px 28px -6px rgba(14, 17, 22, 0.16), 0 2px 6px -2px rgba(14, 17, 22, 0.08);
```

---

## 6. Motion & Transitions

- Transitions are fast and functional:
  - `--transition-fast`: `150ms cubic-bezier(0.16, 1, 0.3, 1)` for hover, focus, and state flips.
  - `--transition-base`: `200ms cubic-bezier(0.16, 1, 0.3, 1)` for drawer slide, modal fade.
- **Prohibited:**
  - Decorative entrance animations on scroll.
  - Infinite bouncing or spinning badges (except loading indicators).
  - Parallax or 3D perspective transforms.
- **Accessibility:**
  - All transitions and animations must be neutralized under `@media (prefers-reduced-motion: reduce)`.
