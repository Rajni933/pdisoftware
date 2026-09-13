# 04 — Icons & Micro-Interactions

---

## 1. Icon System

**Library:** Lucide, and only Lucide. `lucide-react` (web) · `lucide-react-native` (mobile).
No Font Awesome, no Material Icons, no Heroicons, no mixed sets, no custom SVGs except the brand
mark and the vehicle body map.

| Property | Value |
|---|---|
| **Stroke** | **1.5px** (Lucide default is 2 — override it globally; 1.5 is what makes it read as an instrument, not a toy) |
| **Sizes** | 16 (dense/table) · **20 (default)** · 24 (mobile touch) · 28 (Yard Mode) |
| **Colour** | `currentColor`, always. Never a hard-coded icon colour |
| **Fill** | Never. No solid icons, no duotone, no gradient |
| **Alignment** | Optical centre with text baseline; 8px gap to its label |
| **Accessibility** | `aria-hidden="true"` when beside a label; `aria-label` when alone |

### Hard Rules
- **No decorative icons.** An icon appears only when it speeds recognition of an action or a state.
  An icon beside a page heading is decoration — remove it.
- **No icon-only buttons** except in this closed list: close (`x`), row actions
  (`ellipsis-vertical`), back (`arrow-left`), search toggle on mobile (`search`), and photo remove
  (`x`). Everything else carries a label.
- **One glyph, one meaning, product-wide.** `check` always means "passed/approved" — never "select",
  never "done loading". Use `circle-check` for selection.

### Domain → Icon Map (Authoritative)

| Concept | Lucide Icon |
|---|---|
| Vehicle | `car` |
| VIN / scan | `scan-line` (scanner), `hash` (manual VIN entry) |
| Stockyard / branch | `warehouse` (yard), `building-2` (branch) |
| Received into yard | `inbox` |
| Inspection / PDI | `clipboard-check` |
| Checklist item pass | `check` |
| Checklist item fail | `x` |
| Not applicable | `minus` |
| Finding / damage | `triangle-alert` |
| Severity: critical | `octagon-alert` |
| Severity: major | `triangle-alert` |
| Severity: minor | `circle-alert` |
| Severity: observation | `eye` |
| Body map / panel | `car-front` |
| Photo capture | `camera` |
| Photo gallery | `images` |
| Photo failed | `image-off` |
| Repair ticket | `wrench` |
| Workshop / bay | `hard-hat` |
| Parts used | `package` |
| Technician | `user-cog` |
| QA review | `shield-check` |
| Approved | `circle-check` |
| Rejected | `circle-x` |
| Certificate | `award` (mark), `file-badge` (document) |
| QR verification | `qr-code` |
| Delivery ready | `truck` |
| Delivered | `archive` |
| Waiting on someone | `clock` |
| In progress | `play` |
| Assignment | `user-plus` |
| Reassign | `repeat-2` |
| Notifications | `bell` |
| Audit log | `scroll-text` |
| Reports | `file-chart-column` |
| Dashboard | `layout-dashboard` |
| Analytics | `chart-line` |
| Users | `users` |
| Roles / permissions | `key-round` |
| Device | `smartphone` |
| Device revoked | `smartphone-nfc` + danger colour, or `ban` |
| Settings | `settings` |
| Template editor | `list-checks` |
| Online | `wifi` |
| Offline | `cloud-off` |
| Syncing | `refresh-cw` |
| Synced | `cloud-check` |
| Sync failed | `cloud-alert` |
| Upload | `upload` |
| Download / export | `download` |
| Filter | `sliders-horizontal` |
| Search | `search` |
| Sort | `arrow-up-down` |
| Date range | `calendar` |
| Row actions | `ellipsis-vertical` |
| Expand / collapse | `chevron-down` |
| External link | `arrow-up-right` |
| Lock / app lock | `lock` |
| Biometric | `fingerprint` (Android), `scan-face` (iOS) |
| Sign out | `log-out` |

If a concept is missing, pick the most literal Lucide name, add it to this table in the same PR, and
never use a second icon for the same concept afterwards.

---

## 2. Illustration & Imagery Policy

- **No illustrations.** No spot art, no empty-state characters, no 3D renders, no isometric
  warehouses, no stock photography of smiling people. Empty states use a single 24px Lucide glyph in
  `--p-n-400` and a sentence.
- The only imagery in the product is **the photos engineers take** and **the vehicle body map**.
- The body map is a single flat line-art SVG top-down vehicle silhouette, 1.5px stroke matching the
  icon set, with tappable panel regions that fill `--color-danger-soft` when a finding exists.
  Panels carry a hit-area of at least 44×44 even when the visual region is smaller.
- Charts use no more than four series. Palette for series:
  `#1A3A6B · #2F6E75 · #C2670B · #667487`. Grid lines `--p-n-100`, axis labels `--t-caption`.
  No gradients under area charts, no 3D, no donut with a number in the middle unless that number is
  the point.

---

## 3. Micro-Interaction Catalogue

Only these. Each one reports a state change the user caused.

| Interaction | Behaviour |
|---|---|
| **Button hover** | Background one step darker over `--dur-micro`. No lift, no scale, no shadow |
| **Button press** | Background two steps darker + `transform: translateY(1px)` |
| **Row hover** | `--p-n-50` fill, `--dur-micro`, no border change |
| **Row select** | `--p-b-50` fill + rail turns `--p-b-500`, instant |
| **Checkbox** | Box fills, tick draws via `stroke-dashoffset` over 140ms |
| **Chip remove** | Chip collapses width to 0 over 120ms, list reflows over `--dur-move` |
| **Dropdown open** | Fade + 4px translate-from-trigger over `--dur-enter`, `--ease-out`; transform-origin at the trigger edge |
| **Modal open** | Backdrop fade 140ms; panel fade + scale .98→1 over `--dur-sheet` |
| **Bottom sheet** | Translate from bottom edge over `--dur-sheet`, drag-to-dismiss with rubber-band |
| **Toast in** | Slide 8px + fade over `--dur-enter`; out is fade only over `--dur-exit` |
| **Row delete** | Row collapses its own height over 180ms, then the list closes the gap |
| **Accordion** | Height auto-transition over 180ms `--ease-move`, chevron rotates 180° in sync |
| **Tab change** | Underline slides horizontally over 180ms; panel cross-fades 120ms |
| **Autosave** | "Saved 14:32" fades in over 120ms, holds 2s, fades to 60% opacity and stays |
| **Pull to refresh (mobile)** | Native platform behaviour, no custom animation |
| **Photo captured** | Thumbnail scales .9→1 over 160ms as it enters the strip |
| **Status change** | The status rail cross-fades colour over 240ms — the only colour transition allowed |

### Forbidden Motion
Scroll-triggered reveals · staggered list entrances on load · parallax · hover lift/scale on cards ·
looping pulses next to data · bouncing easings · page transition slides · animated number
count-ups · typewriter text · anything over 300ms except the sheet.

---

## 4. Sound & Haptics (Mobile Only)

No sound, ever. Haptics only on: photo captured (light), checklist item failed (medium — it is a
consequential action), submission accepted (success), sync failure (warning). Respect the system
haptic setting.
