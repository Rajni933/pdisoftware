# 02 — Components

> **Status:** Locked specification. Every component here is the only approved implementation of that pattern. Do not build a variant without adding it to this file in the same PR.

---

## 1. Button

Five variants. Never more.

| Variant | Fill | Text | Border | Use |
|---|---|---|---|---|
| **primary** | `var(--color-action)` | `#FFFFFF` | none | The one main action on the screen region |
| **secondary** | `var(--color-surface)` | `var(--color-text-primary)` | `var(--border-default)` | Everything else |
| **destructive** | `var(--color-danger)` | `#FFFFFF` | none | Reject, revoke, void. Always behind a confirmation dialog |
| **ghost** | `transparent` | `var(--color-text-secondary)` | none | Toolbar, table row actions, cancel |
| **link** | `transparent` | `var(--color-action)` | none | Inline in prose only |

### Sizes & Padding
- **sm (28px)**: Table rows (`padding: 0 12px; font-size: var(--t-micro); gap: 6px; border-radius: var(--radius-sm);`)
- **md (36px)**: Default desktop controls (`padding: 0 16px; font-size: var(--t-body-sm); gap: 8px; border-radius: var(--radius-sm);`)
- **lg (44px)**: Mobile touch / primary CTA (`padding: 0 20px; font-size: var(--t-body); gap: 8px; border-radius: var(--radius-sm);`)
- **xl (52px)**: Yard Mode (`padding: 0 20px; font-size: var(--t-body-lg); gap: 10px; border-radius: var(--radius-sm);`)
- **Icon-only buttons:** Square at the same height (`sm`: 28×28px, `md`: 36×36px, `lg`: 44×44px, `xl`: 52×52px).

```html
<button class="btn btn--primary btn--md" type="button">
  <svg class="btn__icon" aria-hidden="true"><!-- lucide check --></svg>
  Approve inspection
</button>
```

### Button Rules
1. **One primary per screen region.** Two primaries side by side is a review failure.
2. **Label is verb + object:** "Approve inspection", not "Approve" or "Submit".
3. **On press, the button enters its own loading state:** Width does not change, label is replaced by spinner + present-progressive verb ("Approving…").
4. **Disabled buttons must state why:** Accompanied by a tooltip or helper text explaining what is missing. A dead button with no explanation is a bug.
5. **Never an icon-only button for a destructive action.**

---

## 2. Status Rail & Status Chip (The Signature Pattern)

### 2.1 The Status Rail
A 3px (5px in Yard Mode) full-height vertical bar on the leading edge of any element representing a vehicle: table row, list card, detail header, kanban card.
- **Colour:** Bound strictly to the status family from `01-foundations.md §3`:
  - `Intake`: `--status-family-intake` (`#4A5766` slate)
  - `In progress`: `--status-family-in-progress` (`#15558D` blue)
  - `Waiting`: `--status-family-waiting` (`#8A5A00` amber)
  - `Blocked`: `--status-family-blocked` (`#B3261E` red)
  - `Cleared`: `--status-family-cleared` (`#0F7A46` green)
  - `Closed`: `--status-family-closed` (`#8A97A6` muted)

```css
.row {
  position: relative;
  padding-left: calc(var(--space-4) + var(--rail));
}
.row::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--rail);
  background: var(--status-family-color);
}
```

### 2.2 The Status Chip
```html
<span class="chip chip--waiting">
  <svg aria-hidden="true"><!-- lucide clock --></svg>
  QA pending
</span>
```
- **Height:** 22px on web, 26px on mobile.
- **Radius:** `--radius-xs` (3px).
- **Typography:** `--t-micro` (11px, weight 500).
- **Border & Fill:** 1px border in the family border colour, fill in the family light fill, text in the family text colour.
- **Rule:** Always **glyph + label**. Never a bare coloured dot. Never colour alone.
- The label is the exact status, not the family: chip says "QA pending", rail colour says "waiting".

### 2.3 Count Badge
- `--radius-full` (999px), 18px min-width, `--t-micro`.
- `--p-n-100` fill (`#E9EDF1`) with `--color-text-secondary` (`#4A5766`) text.
- Turns `--color-danger` (`#B3261E`) fill + white text **only** for "blocked" counts (failed inspections, sync errors).

---

## 3. Severity Tag (Findings)

Same structural construction as the status chip, but with a left glyph and an optional count badge:

```html
<span class="sev sev--critical">
  <svg aria-hidden="true"><!-- lucide octagon-alert --></svg>
  Critical
  <span class="sev__n">2</span>
</span>
```

### Severity Colors & Rules
- **CRITICAL** (`#B3261E`): `OctagonAlert` · Photo mandatory · Fails PDI
- **MAJOR** (`#C2670B`): `TriangleAlert` · Photo mandatory · Fails PDI
- **MINOR** (`#2F6E75` teal): `CircleAlert` · Photo optional · Does not block
- **OBSERVATION** (`#667487` slate): `Eye` · Photo optional · Does not block

*In a findings list, severity tags are sorted `CRITICAL → MAJOR → MINOR → OBSERVATION` and never collapsed into "2 issues". The engineer needs the complete breakdown.*

---

## 4. Input & Form

```
Label                 ← --t-label, --color-text-secondary, 6px above control
[ control ]           ← 36px (44px mobile), --radius-sm, --border-default, 12px padding-x
Helper text or error  ← --t-caption, 6px below control
```

### States
- **default:** `--border-default` (`#D7DEE5`), `--color-surface` fill.
- **hover:** `--border-strong` (`#B9C4CF`).
- **focus:** `--focus-ring` (`0 0 0 2px var(--color-surface), 0 0 0 4px var(--p-b-400)`).
- **filled:** Text `--color-text-primary`.
- **disabled:** `--p-n-50` fill, `--p-n-400` text, cursor not-allowed.
- **readonly:** No border, `--p-n-50` fill.
- **invalid:** `--color-danger` border (`#B3261E`) + 1px inner glow.
- **loading:** Inline shimmer inside the control.

### Form Rules
1. **Label above, always.** Placeholders are format examples (e.g. `MAT1234ABC…`), never labels.
2. **Required** fields marked with `*` and `aria-required`. Optional fields are marked "(optional)" when the form is mostly required. Pick one convention per form, never both.
3. **Error messages:** State what happened + what to do: *"VIN must be 17 characters. This one has 15."*
4. **Validation timing:** Validate on blur, re-validate on change once an error is showing. Never validate on every keystroke.
5. **Numeric and VIN inputs:** Use `--font-mono` and mobile `inputMode="text"` / `inputMode="numeric"`.
6. Field groups use `<fieldset>` + `<legend>`; the legend is `--t-h3`.
7. Server errors map to fields. A form-level error banner appears only for errors that do not correlate to a specific field.

---

## 5. Select / Combobox

- **Mobile:** Native `<select>` for platform picker ergonomics.
- **Web:** Custom accessible listbox:
  - Container: `--shadow-popover`, `--radius-sm`, max-height 320px, 8px padding.
  - Option items: 32px height, checkmark on selected item, hover highlight.
  - Keyboard: Type-ahead, arrow-key navigation, `Esc` to close, returns focus to trigger button.
  - **Multi-select:** Renders chosen values as removable chips inside the control, overflowing to `+3` after two chips.

---

## 6. Table

*The most critical operational component in the product.*

```
┌──────────────────────────────────────────────────────────────────┐
│ Filter bar: search · status · branch · date ·           [Export] │
├─┬──────────────┬─────────┬────────────┬──────────┬───────────────┤
│▌│ VIN          │ Model   │ Status     │ Engineer │ Age ⋯         │ ← header, --t-label
├─┼──────────────┼─────────┼────────────┼──────────┼───────────────┤
│▌│ MAT…4521     │ Nexon   │ ● QA pend. │ R. Meena │ 2d 4h ⋯       │ ← 44px row
└─┴──────────────┴─────────┴────────────┴──────────┴───────────────┘
```

- **Container:** `--radius-sm`, `--border-default`, zero shadow, `overflow: hidden`.
- **Header:** `--p-n-50` fill, sticky on scroll, `--t-label`, sentence case. Sortable columns show a chevron on hover or when active.
- **Row:** 44px height (36px in dense mode), `--border-hairline` divider between rows, hover `--p-n-50`, selected `--p-b-50` fill with `--p-b-100` rail.
- **Leading status rail column:** Exactly 3px wide, no header text.
- **Numeric/date columns:** Right-aligned, `--font-mono`, tabular numbers.
- **Row click:** Navigates to vehicle record. The explicit action menu (`MoreVertical`, ghost button) is the last column and stops click propagation.
- **Bulk selection:** Checkbox column appears only when table supports bulk operations. Selecting any row replaces the filter bar with a sticky selection bar (*"3 selected · Assign · Export · Clear"*).
- **Four explicit states:** Empty, Loading, Error, and Filtered-Empty are four distinct views (see `03-loaders-states.md`).
- **Desktop responsive:** Never horizontal-scroll on desktop. Drop secondary columns at breakpoints and surface them in the expanded row drawer.
- **Mobile responsive:** Table transforms into a stacked card list, not an overflow scroll table.

---

## 7. Card / Panel

```html
<section class="panel">
  <header class="panel__head">
    <h3 class="panel__title">Findings</h3>
    <button class="btn btn--ghost btn--sm">Add finding</button>
  </header>
  <div class="panel__body">…</div>
</section>
```
- **Styling:** `--radius-sm` (6px), `--border-default` (`#D7DEE5`), pure white background, **zero shadow**.
- **Header:** 48px height with a hairline bottom border (`#E9EDF1`).
- **Body:** 16px padding (`--space-4`).
- **Interaction rule:** Cards do not have hover effects unless the entire card is a link, in which case the border transitions to `--color-border-strong` (`#B9C4CF`) — **never a lift, never a shadow**.

---

## 8. KPI Tile

```
Vehicles in yard    ← --t-label, secondary
142                 ← --t-display, mono, tabular
▲ 12 vs last week   ← --t-caption; ▲/▼ glyph + colour + text
```
- **Rules:**
  - No sparklines unless the trend is the sole point.
  - No decorative icons in the corner.
  - No background gradients.
  - Delta uses `TrendingUp` / `TrendingDown` glyphs with semantic colour and explicitly states the baseline period (*"vs last week"*). A delta without a baseline is noise.
- **Grid:** 4-up grid on desktop with 16px gaps, separated by hairlines/borders, not shadows.

---

## 9. Tabs

- **Underline tabs only:** 2px bottom border on active tab (`var(--color-action)`).
- **Height & Type:** 40px tall, `--t-body` with weight 500, 16px gap between tabs.
- **Scope rule:** Tabs change the view of the *same* object; they never navigate to a different entity.
- If more than 6 tabs are needed, use a sidebar sub-navigation instead.
- **URL state:** Tab selection is synchronized with URL query params.

---

## 10. Modal

- **Widths:** `sm` 400px · `md` 560px · `lg` 720px.
- **Surfaces:** `--radius-md` (10px), `--shadow-modal`, backdrop `rgba(18,26,35,.45)` with no blur.
- **Structure:**
  - 56px header with title and close button (`X`).
  - Scrollable body (max `60vh`).
  - 64px footer with right-aligned actions (secondary first, primary last, gap ≥ 12px).
- **Motion:** Enter: fade + 8px scale-from-0.98 over `--dur-sheet` (240ms).
- **Keyboard:** `Esc` closes unless form is dirty (in which case it asks confirmation). Focus is trapped inside and restored to trigger on close.
- **Destructive confirmation:** Must explicitly state consequence and object:
  *"Reject this inspection? Vehicle MAT…4521 will return to the engineer. A rejection reason is required and is permanently recorded."*
  Confirm button repeats the verb: `[Reject inspection]`, never `[Yes]` or `[OK]`.

---

## 11. Drawer

- **Position & Width:** Right-side flyout, 420px on web.
- **Use case:** Contextual detail — inspecting a finding, a repair ticket, or an audit entry while preserving list context.
- **Chrome:** Same header and footer as modal, slides in from right over `--dur-sheet`.
- If the user needs the full entity record, navigate to a standalone page instead.

---

## 12. Toast

- **Placement:** Bottom-left on web, top on mobile.
- **Stacking:** Maximum 2 visible toasts, newest on top.
- **Styling:** `--radius-sm`, `--shadow-popover`, 4px leading rail in semantic color, glyph + one line of text + optional single action (*"Undo"*, *"View"*).
- **Timing:** 5 seconds for success, 8 seconds for error.
- **Data loss rule:** Never auto-dismiss an error that resulted in lost user input — that becomes a persistent Banner instead.
- **Copy rule:** Toast text directly mirrors the button that triggered it:
  *"Approve inspection"* → *"Inspection approved"*.

---

## 13. Banner (Inline Alert)

- **Placement:** Full-width inside the content region (not fixed to viewport).
- **Styling:** `--radius-sm`, semantic light fill + border, glyph, title, one line of body, optional trailing action button.
- **Persistence:** Persistent until resolved. Used for offline state, stale data warning, sync failures, blocked submissions, or revoked device permissions. Never used for transient confirmations.

---

## 14. Photo Tile (Defect & Inspection Evidence)

- **Aspect Ratio:** Fixed 1:1 square, `--radius-xs`, `--border-default`, `object-fit: cover`.
- **Overlays:**
  - Top-left: Slot label chip (*"Front exterior"*) when it is a required checklist slot.
  - Top-right: Remove button (ghost, accessible only before final submission).
  - Bottom: Ring progress while uploading, or `CloudOff` glyph + *"Queued"* while offline.
- **Interaction:** Tap opens a full-screen image viewer with pinch-zoom, swipe between photos, capture timestamp, and inspector metadata.
- **Loading:** Blur-up placeholder while presigned R2 URL resolves — never a popping grey box.

---

## 15. Checklist Item (Mobile Core Workflow)

```
┌───────────────────────────────────────────┐
│ Exterior lighting            Item 5 of 12 │ ← category + position, --t-caption
│ Headlamp alignment and function           │ ← --t-body-lg, 500
│ ⌄ How to check                            │ ← collapsed instructions, tap to expand
│                                           │
│ ┌────────┐   ┌────────┐   ┌─────────────┐ │
│ │  N/A   │   │  Fail  │   │    Pass     │ │ ← 52px, Pass widest & rightmost
│ └────────┘   └────────┘   └─────────────┘ │
│                               Saved 14:32 │ ← autosave confirmation, --t-caption
└───────────────────────────────────────────┘
```
1. **Pass target:** The largest button (widest target) anchored on the right under the technician's thumb.
2. **Fail target:** Distinct by glyph + label + border colour, **never by fill alone** (red fill next to green fill causes catastrophic mis-taps in field sunlight).
3. **N/A target:** Opens a mandatory reason sheet; item is incomplete until reason is recorded.
4. **Photo-required items:** Keep `Pass` disabled until an evidence photo is captured, with the requirement stated inline.
5. **Autosave feedback:** Every interaction writes to local SQLite/WatermelonDB first and renders *"Saved HH:MM"*.

---

## 16. Timeline (Vehicle History & Audit Trail)

- **Structure:** Single vertical hairline with 8px circular dot nodes in the status family color.
- **Entry format:** `Actor` · `Action` · `Timestamp (mono tabular)`, with from → to states rendered as two small chips joined by an arrow glyph (`→`).
- **Grouping:** Grouped by date with a sticky day label.
- **Integrity rule:** This is an immutable audit record — never truncate, never paraphrase, never hide a rejection or rollback.

---

## 17. Filter Bar

- **Height:** 48px height, sits directly above the table inside the same outer border, `--p-n-25` fill.
- **Order:** Search input (flex-grows) · up to 4 filter dropdowns · date range picker · right-aligned export action.
- **Active filters:** Render as removable chips on a second line with a *"Clear all"* ghost button.
- **URL synchronization:** Filter state is written to URL query params so managers can share exact queue views.

---

## 18. Pagination

- **Placement:** Right-aligned below the table.
- **Format:** `Rows per page [20 ▾]   1–20 of 1,284   ‹ ›`.
- **Typography:** Record counts and page numbers are monospaced tabular figures.
- **Feeds:** Cursor-based feeds (audit history, activity log) use an explicit `[Load more]` button, never infinite scroll — an auditor must always be able to reach the footer.

---

## 19. Sidebar Navigation

- **Width:** 240px desktop (collapses to 64px icon rail on small desktop, overlay drawer on tablet).
- **Surface:** `--color-surface` with `--border-default` right border.
- **Items:** 36px height, `--t-body`, 8px icon gap, `--radius-sm`.
- **Active item:** `--p-b-50` fill + `--p-b-500` text with a 2px leading blue bar.
- **Grouping:** Sections separated by a hairline divider and a sentence-case `--t-caption` group label.
- **Badges:** Right-aligned count badges for active queues.
- **Role-awareness:** Unauthorised navigation items are omitted completely, not disabled.
- **Footer region:** Branch switcher, sync/connectivity status indicator, user profile menu.

---

## 20. Page Header

```
Vehicles / MAT…4521                                    ← breadcrumb, --t-caption
MAT621AB1234567890   ● QA pending                      ← --t-mono-lg + status chip, one line
Nexon XZ+ · Silver · Received 11 Sep                   ← --t-caption, secondary
                                [Secondary] [Primary]  ← action buttons
```
- **Sticky behavior:** Sticky on scroll, collapsing to a 48px bar with just the VIN, status chip, and primary action.
- **Breadcrumb:** True interactive navigation — every ancestral segment is clickable.
