# 01 — Foundations

> **Status:** Locked specification. The single source of truth for design tokens, primitives, semantics, typography, space, elevation, motion, focus, and Yard Mode.

---

## 1. Token Architecture — Three Layers

```
PRIMITIVE                      SEMANTIC                   COMPONENT
--p-b-500 (#1A3A6B)    →    --color-action    →    --btn-primary-bg
(raw color/metric)          (what it means)        (where it's used)
```

You may **only ever reference the semantic layer in feature code**. 
- **Primitives** exist so the palette can be retuned once.
- **Component tokens** exist only where a component needs a value that no semantic token expresses.

### Violation Examples (Rejected in Review)
```css
/* ✗ Primitive / raw hex in component */
.approve-btn { background: #1A3A6B; }

/* ✗ Primitive in feature code */
.approve-btn { background: var(--p-b-500); }

/* ✓ Semantic token in feature code */
.approve-btn { background: var(--color-action); }
```

---

## 2. Colour

### 2.1 Why This Palette
- **Navy `#1A3A6B`** is inherited from the Tata dealer identity and is the only place the brand shows up in interactive UI.
- The **neutral ramp** is cool and slightly blue-shifted (not pure grey) so that navy sits inside the same family instead of floating on top of it. This is what makes the product read as one designed instrument panel rather than a grey template with a blue button dropped in.
- **Backgrounds are near-white (`#FBFCFD`) rather than grey**: in bright sunlight on a mobile phone, grey backgrounds lose their separation from white cards entirely. Separation is carried by borders, which survive glare; fills do not.

### 2.2 Neutrals (Cool Slate)

| Token | Hex | Use |
|---|---|---|
| `--p-n-0` | `#FFFFFF` | Content surfaces, inputs, table body |
| `--p-n-25` | `#FBFCFD` | App background (behind panels) |
| `--p-n-50` | `#F4F6F8` | Table header, hover row, disabled fill |
| `--p-n-100` | `#E9EDF1` | Subtle divider, track, chip background |
| `--p-n-200` | `#D7DEE5` | Default border |
| `--p-n-300` | `#B9C4CF` | Strong border, input border on hover |
| `--p-n-400` | `#8A97A6` | Disabled text, placeholder, closed status |
| `--p-n-500` | `#667487` | Tertiary text, icon default |
| `--p-n-600` | `#4A5766` | Secondary text, labels |
| `--p-n-700` | `#33404E` | Body text on dense tables |
| `--p-n-800` | `#1F2A36` | Headings |
| `--p-n-900` | `#121A23` | Primary text |

### 2.3 Navy (Action)

| Token | Hex | Use |
|---|---|---|
| `--p-b-50` | `#EDF2FA` | Selected row, active nav background |
| `--p-b-100` | `#D6E1F2` | Selected border, info fill |
| `--p-b-300` | `#6E8CBF` | Disabled primary button |
| `--p-b-400` | `#3C63A3` | Focus ring, link hover |
| `--p-b-500` | `#1A3A6B` | Primary action, active nav text |
| `--p-b-600` | `#15305A` | Primary hover |
| `--p-b-700` | `#0F2445` | Primary pressed |
| `--p-b-900` | `#0A1930` | Sidebar background (dark shell variant) |

### 2.4 Brand Red — Restricted
`--p-brand-red: #C8102E`
- **Permitted in:** Logo lockup, certificate PDF header rule, login screen brand mark.
- **Forbidden in:** Buttons, alerts, badges, charts, borders, hover states, anything interactive.
- **Reason:** If the brand colour also means "danger", the eye stops trusting either signal.

### 2.5 Semantic Colors

| Meaning | Text/Icon | Fill | Border |
|---|---|---|---|
| **Success** | `#0F7A46` | `#E8F6EF` | `#A5DCC1` |
| **Warning** | `#8A5A00` | `#FDF4E3` | `#F0CE8A` |
| **Danger** | `#B3261E` | `#FDECEB` | `#F2B5B0` |
| **Info** | `#15558D` | `#EAF1F9` | `#A9C7E6` |

*All four pass WCAG 2.1 AA (≥4.5:1) as text on white and on their own light fill.*

---

## 3. Status & Severity — The Domain Palette

### 3.1 Vehicle Status → Five Families
Thirteen statuses is too many to colour-code individually. They collapse into five families that answer: **"whose move is it?"**. A manager scanning a queue only needs to know who is blocking.

| Family | Colour | Glyph (Lucide) | Statuses |
|---|---|---|---|
| **Intake** — nothing owed yet | `--p-n-600` slate (`#4A5766`) | `Inbox` | `RECEIVED`, `PDI_PENDING` |
| **In progress** — someone is working | `#15558D` blue | `Loader` (static), `Play` | `PDI_IN_PROGRESS`, `REPAIR_IN_PROGRESS`, `REINSPECTION` |
| **Waiting** — queued on another person | `#8A5A00` amber | `Clock` | `REPAIR_PENDING`, `QA_PENDING` |
| **Blocked** — action required now | `#B3261E` red | `OctagonAlert` | `FAILED`, `QA_REJECTED` |
| **Cleared** — moving forward | `#0F7A46` green | `Check` | `REPAIR_COMPLETED`, `PDI_APPROVED`, `DELIVERY_READY` |
| **Closed** — terminal | `--p-n-400` muted (`#8A97A6`) | `Archive` | `DELIVERED` |

- **The Status Rail** (3px leading edge bar) uses the family colour.
- **The Status Chip** shows the family glyph plus the exact status label. Family gives the instant read; label gives the precision.

### 3.2 Severity Ramp (Findings)
Deliberately not a red→yellow→green gradient — severity is a taxonomy, not a temperature.

| Severity | Colour | Glyph | Rule |
|---|---|---|---|
| **CRITICAL** | `#B3261E` | `OctagonAlert` | Photo mandatory · fails the PDI |
| **MAJOR** | `#C2670B` | `TriangleAlert` | Photo mandatory · fails the PDI |
| **MINOR** | `#2F6E75` teal | `CircleAlert` | Photo optional · does not block |
| **OBSERVATION** | `--p-n-500` (`#667487`) | `Eye` | Photo optional · does not block |

*Teal for MINOR (instead of a third warm tone) is intentional: it makes "does this block delivery?" a warm vs cool decision, readable at a glance and in greyscale.*

### 3.3 Repair Ticket & Session States
Reuse the five families above:
- `OPEN` = Waiting
- `IN_PROGRESS` = In progress
- `COMPLETED` = Cleared
- `VERIFIED` = Cleared (with `ShieldCheck` glyph)
- `CANCELLED` = Closed

*Do not invent a sixth colour family for any new state. Map it into an existing one.*

---

## 4. Typography

```css
--font-sans: 'IBM Plex Sans', -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'IBM Plex Mono', ui-monospace, 'SF Mono', Consolas, monospace;
--font-deva: 'IBM Plex Sans Devanagari', var(--font-sans);
```

Load weights **400, 500, 600 only**, `font-display: swap`, subset `latin + latin-ext` (+ `devanagari` on the mobile bundle only).

| Token | Size / Line | Weight | Tracking | Use |
|---|---|---|---|---|
| `--t-display` | 32 / 38px | 600 | −0.02em | KPI figure, certificate number |
| `--t-h1` | 24 / 32px | 600 | −0.015em | Page title |
| `--t-h2` | 19 / 26px | 600 | −0.01em | Section heading |
| `--t-h3` | 16 / 24px | 600 | 0 | Card / panel heading |
| `--t-body-lg` | 16 / 24px | 400 | 0 | Mobile primary text, modal body |
| `--t-body` | 14 / 22px | 400 | 0 | Default body copy |
| `--t-body-sm` | 13 / 20px | 400 | 0 | Dense tables, table body |
| `--t-label` | 13 / 18px | 500 | 0 | Form labels, column headers |
| `--t-caption` | 12 / 18px | 400 | 0 | Helper text, timestamps |
| `--t-micro` | 11 / 16px | 500 | 0.01em | Chip text, badge counts |
| `--t-mono` | 13 / 20px | 400 | 0 | VIN, IDs, numbers (tabular-nums) |
| `--t-mono-lg` | 15 / 22px | 500 | 0 | VIN on detail headers |

### Typography Rules
1. Maximum measure for prose: **72 characters**. Tables are exempt.
2. Column headers are `--t-label` in `--color-text-secondary`, **sentence case, not uppercase**.
3. Never bold a single word inside a sentence for emphasis.
4. Never use type size alone to create hierarchy where weight or position would do it more quietly.
5. Numbers in a comparable column are always **mono + tabular (`tabular-nums`), right-aligned**.

---

## 5. Space

4px base scale. Only these values exist:
`--space-1`: 4px · `--space-2`: 8px · `--space-3`: 12px · `--space-4`: 16px · `--space-5`: 20px · `--space-6`: 24px · `--space-8`: 32px · `--space-10`: 40px · `--space-12`: 48px · `--space-16`: 64px

| Relationship | Gap | Token |
|---|---|---|
| Label → its control | 6px | `--space-1-5` (4 + 2) |
| Two fields in a group | 12px | `--space-3` |
| Two groups in a form | 24px | `--space-6` |
| Card padding (web) | 16px header / 16px body | `--space-4` |
| Card padding (mobile) | 16px | `--space-4` |
| Page sections | 32px | `--space-8` |
| Table cell padding | 12px × 16px (dense: 8px × 12px) | `--space-3` × `--space-4` |
| Icon → its label | 8px | `--space-2` |
| Adjacent buttons | 8px (12px if one is destructive) | `--space-2` / `--space-3` |

---

## 6. Radius

Four values. A fifth is a review failure.

| Token | Value | Applies to |
|---|---|---|
| `--radius-xs` | 3px | Checkbox, chip, tag, progress track |
| `--radius-sm` | 6px | Default — button, input, select, card, panel, table container |
| `--radius-md` | 10px | Modal, bottom sheet, popover, drawer |
| `--radius-full` | 999px | Count badges and avatars only |

**Nesting rule:** An inner element's radius = outer radius − its inset padding, floored at `--radius-xs`.

---

## 7. Border & Elevation

```css
--border-hairline: 1px solid var(--color-border-subtle); /* #E9EDF1 — inside components */
--border-default: 1px solid var(--color-border);        /* #D7DEE5 — component outlines */
--border-strong: 1px solid var(--color-border-strong);   /* #B9C4CF — inputs on hover */
--rail: 3px;                                            /* status rail width */
```

Three shadows exist and each is bound to a z-layer. **Nothing that sits in the document flow gets a shadow.**

| Token | Value | Only for |
|---|---|---|
| `--shadow-popover` | `0 4px 12px -2px rgba(18,26,35,.10), 0 0 0 1px rgba(18,26,35,.05)` | Dropdown, popover, tooltip, combobox |
| `--shadow-modal` | `0 16px 40px -8px rgba(18,26,35,.18), 0 0 0 1px rgba(18,26,35,.06)` | Modal, drawer, bottom sheet |
| `--shadow-sticky` | `0 -2px 8px -2px rgba(18,26,35,.08)` | Sticky mobile action bar (shadow points up) |

**Z-Scale:**
`base: 0` · `raised: 10` · `sticky: 100` · `dropdown: 200` · `overlay: 300` · `modal: 400` · `toast: 500`.

---

## 8. Motion

```css
--dur-micro: 120ms; /* hover, focus, checkbox, chip */
--dur-enter: 180ms; /* dropdown, tooltip, toast in */
--dur-exit:  140ms; /* anything out — exits are always faster */
--dur-sheet: 240ms; /* modal, drawer, bottom sheet */

--ease-out:  cubic-bezier(.2, .8, .2, 1);
--ease-in:   cubic-bezier(.4, 0, 1, 1);
--ease-move: cubic-bezier(.4, 0, .2, 1); /* position changes */
```

### Laws of Motion
1. **Motion must show what changed** — origin, direction, and destination. A menu grows from its trigger, a sheet rises from the bottom edge, a deleted row collapses its own height.
2. **Distance is small:** 4–8px translate on web, 12px on mobile sheets. Never a 40px slide-up.
3. **Never animate on scroll.** Never stagger a list on load. Never loop anything beside data.
4. **Reduced motion law:** Everything inside `@media (prefers-reduced-motion: reduce)` collapses to a 1ms opacity change — including loaders, which become static.

---

## 9. Focus

```css
--focus-ring: 0 0 0 2px var(--color-surface), 0 0 0 4px var(--p-b-400);
```

One ring, everywhere, including inside dark surfaces (the inner white ring flips to the surface colour).
- Never `outline: none` without an immediate replacement.
- Focus order follows DOM order.
- Modals trap focus and restore it to the trigger on close.

---

## 10. Dark Mode & Yard Mode

### Dark Mode
Dark mode is defined but not shipped in v1.0 (ADR-007). Every semantic token has a dark value in `tokens.css` under `[data-theme="dark"]`. Build against semantics and dark mode will cost one line. Do not ship a dark screen until the whole product can flip.

### Yard Mode (Mobile-Only Sunlight/Glove Profile)
Yard Mode is shipped and is the mobile-only sunlight/glove profile. It is not a theme, it is a density + contrast override on the same tokens:
```css
[data-mode="yard"] {
  /* Text bumps one step on the scale */
  /* Minimum touch target 52px */
  /* Borders go from #D7DEE5 to #B9C4CF */
  /* Status rail: 3px → 5px */
  /* All secondary text promoted to --color-text-primary */
  /* Photo thumbnails: 88px (from 64px) */
}
```
Toggle lives in the mobile profile screen and auto-suggests itself when the device reports ambient light above threshold. Details: `references/06-mobile-yard.md`.
