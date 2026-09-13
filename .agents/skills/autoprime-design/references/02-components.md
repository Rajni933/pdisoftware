# Autoprime PDI — Component Specifications

> **Rule R8:** Consistency beats cleverness. Build strictly from these component blueprints. Never invent alternative button styles, card shadows, or ad-hoc table layouts.

---

## 1. The Status Rail (Signature Element)

The **Status Rail** is a 3px colored vertical bar affixed to the leading edge of vehicle cards, inspection rows, and drawer headers. It provides instantaneous state recognition across the entire shop floor without cluttering the layout.

```html
<!-- Table Row with Status Rail -->
<tr class="relative hover:bg-surface-hover transition-colors">
  <td class="relative p-0">
    <!-- 3px Status Rail -->
    <span class="absolute left-0 top-0 bottom-0 w-[3px] bg-ok" aria-hidden="true"></span>
  </td>
  <td class="cell ident font-medium text-ink">MAT628472P12891</td>
  <!-- ... -->
</tr>
```

### Rail Color Mappings
- **Passed / Delivered / Ready:** `bg-ok` (`#0B7355`)
- **Inspection In-Progress / Pending QA:** `bg-warn` (`#A65A00`)
- **Failed / Major Defect / Rejected:** `bg-danger` (`#B3253C`)
- **Awaiting Inspection / Draft:** `bg-line-strong` (`#D7DBE0`)

---

## 2. Buttons

Buttons represent actions. All buttons must have an explicit accessible text label. Never use `→` or trailing arrows glued to button text.

### 2.1 Variants
- **Primary:** High-intent actions (`Save Inspection`, `Approve PDI`, `Generate Certificate`).
  - Background: `var(--accent)` (`#1A3A6B`), Text: `#FFFFFF`, Hover: `var(--accent-hover)` (`#254B85`).
- **Secondary / Default:** Standard actions (`Filter`, `Export CSV`, `Cancel`).
  - Background: `var(--surface)` (`#FFFFFF`), Border: `1px solid var(--line)`, Text: `var(--ink)`, Hover: `var(--surface-hover)`.
- **Tertiary / Ghost:** Inline or low-emphasis actions (`View History`, `Clear`).
  - Background: `transparent`, Text: `var(--ink-2)`, Hover: `var(--canvas)`.
- **Destructive:** Irreversible or negative actions (`Reject Vehicle`, `Delete Draft`).
  - Background: `var(--danger)` (`#B3253C`), Text: `#FFFFFF`, Hover: `#9B1E32`.
- **Destructive Ghost:**
  - Background: `transparent`, Text: `var(--danger)`, Hover: `var(--danger-soft)`.

### 2.2 Sizing & Touch Targets
- **Web Desktop Standard:** `height: 32px` (2rem), `padding: 0 12px`, `font-size: 13px (text-sm)`, `border-radius: 6px`.
- **Mobile Standard:** `min-height: 44px`, `padding: 0 16px`, `font-size: 14px (text-base)`.
- **Stockyard Mode (Yard Mode):** `min-height: 52px`, `padding: 0 20px`, `font-size: 15px`, bold touch targets for gloved hands.

---

## 3. Data Tables

Data tables are the core operational workspace for managers and controllers.

### 3.1 Rules
- **Height:** Row height is strictly `44px` on desktop.
- **Zebra striping is BANNED:** Every row has a white background separated by a `1px solid var(--line)` bottom border.
- **Hover:** Row hover is `var(--surface-hover)` (`#F7F8F9`).
- **Header:** Background is `var(--accent-soft)` (`#EEF2F8`) or `var(--canvas)` (`#FAFAFA`), text is `11px uppercase font-semibold text-accent` with tracking `0.06em`.
- **Alignment:**
  - Text columns: **Left-aligned**.
  - Identifiers (VIN, Chassis): **Left-aligned**, `font-family: IBM Plex Mono`.
  - Numeric columns (Counts, Durations, Cost): **Right-aligned**, `font-variant-numeric: tabular-nums`.
  - Status column: **Center or Left-aligned** with glyph + label.

```html
<div class="panel overflow-hidden">
  <table class="w-full text-left border-collapse tnum">
    <thead>
      <tr class="border-b border-line bg-canvas">
        <th class="cell-head w-8"></th>
        <th class="cell-head">VIN / Chassis</th>
        <th class="cell-head">Model & Variant</th>
        <th class="cell-head">Location</th>
        <th class="cell-head">PDI Status</th>
        <th class="cell-head text-right">Defects</th>
        <th class="cell-head text-right">Actions</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-line text-sm">
      <tr class="hover:bg-surface-hover group transition-colors">
        <td class="relative p-0 w-2">
          <span class="absolute inset-y-0 left-0 w-[3px] bg-ok"></span>
        </td>
        <td class="cell ident font-medium text-ink">MAT628472P12891</td>
        <td class="cell font-normal text-ink-2">Harrier Fearless+ Dark MT</td>
        <td class="cell text-ink-2">Bay 04 (Jodhpur)</td>
        <td class="cell">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-chip text-xs font-medium bg-ok-soft text-ok border border-ok-line">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Passed
          </span>
        </td>
        <td class="cell text-right font-mono text-ink-2">0</td>
        <td class="cell text-right">
          <button class="h-7 px-2 text-xs font-medium text-ink-2 hover:text-ink hover:bg-canvas rounded">View</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 4. Status Chips & Badges

Status chips convey state. By **Rule R2**, a status chip must **never** rely on color alone. Every badge has an icon/glyph and text.

```html
<!-- Passed / OK -->
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-chip text-xs font-medium bg-ok-soft text-ok border border-ok-line">
  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
  Passed
</span>

<!-- Warning / In Progress -->
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-chip text-xs font-medium bg-warn-soft text-warn border border-warn-line">
  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  In Progress
</span>

<!-- Danger / Failed -->
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-chip text-xs font-medium bg-danger-soft text-danger border border-danger-line">
  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
  Failed
</span>
```

---

## 5. Form Inputs

Operational forms must be rapid, keyboard-navigable, and accessible.

- **Label:** Always a visible `<label>` element placed above the control. Distance: `6px` (`space-3`).
- **Placeholder:** Subdued hint (`var(--ink-3)`), never a replacement for a label.
- **Height:** 36px on web, 44px on mobile.
- **Focus Ring:** `outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 3px;`.
- **Validation Errors:** Displayed immediately below the field with an alert icon, red text (`var(--danger)`), and specific recovery instruction.

```html
<div class="flex flex-col gap-1.5">
  <label for="vin-input" class="text-xs font-medium text-ink">Vehicle Identification Number (VIN)</label>
  <input 
    id="vin-input" 
    type="text" 
    placeholder="e.g. MAT628472P12891"
    class="h-9 px-3 text-sm font-mono bg-surface border border-line-strong rounded focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
  />
  <span class="text-xs text-danger flex items-center gap-1">
    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    VIN must contain exactly 17 alphanumeric characters.
  </span>
</div>
```

---

## 6. Panels & Containers

All cards and panels are structural content containers:
- `background: var(--surface)` (`#FFFFFF`)
- `border: 1px solid var(--line)` (`#E8EAED`)
- `border-radius: var(--radius-panel)` (`10px`)
- `box-shadow: none` (Zero shadow — separation comes from border and canvas contrast).
- Panel Header: `height: 44px`, `border-bottom: 1px solid var(--line)`, `padding: 0 16px`.

---

## 7. Modals & Dialogs

Floating overlays are among the only elements permitted to use `--shadow-pop`.

- **Backdrop:** `background: rgba(14, 17, 22, 0.45); backdrop-filter: none;` (no blur).
- **Surface:** `background: #FFFFFF`, `border: 1px solid var(--line)`, `border-radius: 10px`, `box-shadow: var(--shadow-pop)`.
- **Header:** Title in `17px font-semibold text-ink`, dismiss button (`✕`) top right.
- **Actions:** Bottom action bar with secondary action on the left/cancel and primary action on the right. Spacing between destructive and safe actions ≥ 12px.
