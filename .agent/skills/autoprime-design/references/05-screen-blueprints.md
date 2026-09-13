# 05 — Screen Blueprints & Layout Archetypes

Six archetypes cover every screen in the product. Pick one, then read the specific blueprint.

| Archetype | Screens |
|---|---|
| **List** | Vehicles, PDI queue, Repair queue, QA queue, Users, Audit log |
| **Detail** | Vehicle, Inspection, Repair ticket, Certificate, User |
| **Workflow step** | Checklist category, Item response, Finding capture, Photo capture |
| **Form** | Login, Create vehicle, Assign PDI, Template editor, Settings |
| **Dashboard** | HO overview, Branch overview, Engineer home, Workshop board |
| **Review** | QA review (its own archetype — decision under evidence) |

---

## A. App Shell (Web)

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ ◧ Autoprime │ Vehicles                                    ⌕  ⚙  🔔 3   RM ▾ │ 56px top bar
│  Jodhpur ▾ ├──────────────────────────────────────────────────────────────────┤
│          │                                                                  │
│ Overview │   ← content region, 24px padding, max-width 1440                 │
│ Vehicles │                                                                  │
│  Queue 12│                                                                  │
│ PDI      │                                                                  │
│ Repairs 4│                                                                  │
│ QA     7 │                                                                  │
│ ───────  │                                                                  │
│ Reports  │                                                                  │
│ Users    │                                                                  │
│ Audit    │                                                                  │
│          │                                                                  │
│ ───────  │                                                                  │
│ ⛅ Synced │  ← connection + last sync, always visible                        │
│ R. Meena │                                                                  │
└──────────┴──────────────────────────────────────────────────────────────────┘
   240px
```

- Top bar holds: current page title (not a logo), global search (`/` focuses it), settings,
  notifications, user menu. Branch switcher lives in the sidebar head, not the top bar — it scopes
  the *data*, so it belongs with navigation.
- Notification count uses the count badge; danger fill only when something is blocked.
- Keyboard: `/` search · `g then v` vehicles · `g then q` QA queue · `j/k` move row selection ·
  `Enter` open · `Esc` close. Show a `?` shortcut sheet. This is what makes a manager fast.

---

## B. List Archetype

```
Page header ──────────────────────────────────────────────
Vehicles                                        [ Add vehicle ]
1,284 vehicles · 12 awaiting assignment
───────────────────────────────────────────────────────────
┌ Filter bar ─────────────────────────────────────────────┐
│ ⌕ VIN, model or engineer   [Status ▾][Branch ▾][Date ▾]  │
│ Status: QA pending ✕   Branch: Basni ✕        Clear all  │
├─┬─────────────┬────────┬──────────────┬─────────┬────────┤
│▌│ VIN         │ Model  │ Status       │ Engineer│ Age  ⋯ │
├─┼─────────────┼────────┼──────────────┼─────────┼────────┤
│▌│ MAT…4521    │ Nexon  │ ⏱ QA pending │ R.Meena │ 2d 4h ⋯│
│▌│ MAT…4522    │ Punch  │ ⛔ Failed    │ S.Joshi │ 6h    ⋯│
└─┴─────────────┴────────┴──────────────┴─────────┴────────┘
                         Rows [20 ▾]  1–20 of 1,284   ‹ ›
```

### Rules
- Subtitle under the title is the count plus the one number that matters for this role. Not a
  paragraph.
- Default sort is *age descending within blocked status* — the oldest problem is always on top.
  Never default to "recently created".
- Age is computed and rendered in mono (`2d 4h`), and turns `--color-warning` past the SLA
  threshold, `--color-danger` past 2×. This is the queue's whole value.
- Every list has: a saved-view concept in the URL, an export action, and a bulk-select path if the
  role can act in bulk.
- Mobile: cards stacked, rail on the left, VIN + status on line one, model + engineer + age on line
  two. No horizontal scroll.

---

## C. Detail Archetype — Vehicle

```
Vehicles / MAT…4521
MAT621AB1234567890                    ⏱ QA pending     [ Reassign ] [ Open inspection ]
Nexon XZ+ · Silver · Basni yard · Received 11 Sep 2026
───────────────────────────────────────────────────────────────────────────────
[ Overview ] [ Inspections 2 ] [ Findings 5 ] [ Repairs 1 ] [ Photos 18 ] [ History ]
───────────────────────────────────────────────────────────────────────────────
┌ Current inspection ─────────────────┐  ┌ Vehicle ──────────────────────────┐
│ PDI-2026-0914  ·  R. Meena          │  │ VIN       MAT621AB1234567890      │
│ Submitted 14:02 · 12 min            │  │ Chassis   AB1234567890            │
│ 46 of 46 items · 5 findings         │  │ Engine    G12K7890                │
│ ⛔ 1 critical  ⚠ 2 major  ◔ 2 minor │  │ Fuel      Petrol · Manual         │
│                    [ Review in QA ] │  │ Yard      Basni · Bay 4           │
└─────────────────────────────────────┘  └───────────────────────────────────┘
┌ Timeline ───────────────────────────────────────────────────────────────────┐
│ ● Today                                                                      │
│ │ 14:02  R. Meena     Inspection submitted      In progress → QA pending     │
│ │ 11:20  R. Meena     Inspection started        PDI pending → In progress    │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Header is sticky and collapses to VIN + status chip + primary action.
- Left column 2fr (what's happening), right column 1fr (what it is). Identity data is reference
  material — it does not deserve the primary position.
- Tab counts are real numbers, always. A tab with zero shows "0" in muted, never hides.
- Findings summary in the inspection card uses severity tags with counts, ordered by severity.

---

## D. Review Archetype — QA Review (The Highest-Stakes Screen)

```
┌ Evidence (scrollable, 2fr) ───────────────┐┌ Decision (sticky, 1fr) ─────────┐
│ MAT…4521 · Nexon XZ+ · R. Meena           ││ 46 of 46 completed              │
│                                            ││ ⛔ 1 critical                   │
│ ▸ Exterior            12/12   ⛔1          ││ ⚠ 2 major                       │
│   ├ Front bumper scratch      Critical     ││ ◔ 2 minor                       │
│   │  [photo][photo]  "8cm scratch, lower"  ││ ─────────────────────────────── │
│ ▸ Interior            10/10                ││ Reviewed by you · 3 min         │
│ ▸ Electrical           8/8    ⚠1           ││                                 │
│ ▸ Mechanical          10/10   ⚠1           ││ [ Reject inspection ]           │
│ ▸ Documentation        6/6                 ││ [ Approve inspection ]          │
└────────────────────────────────────────────┘└─────────────────────────────────┘
```

- Categories collapsed by default **except** any containing a finding — those open automatically.
  The QA manager should never have to hunt for the problem.
- Photos open in a full-screen viewer with keyboard arrows.
- Approve is primary but sits **below** reject in the stack so the destructive option isn't the
  reflex tap; both require a confirm modal; reject requires a reason with a 10-character minimum and
  a set of quick-reasons as chips.
- If the submitting engineer is the current user, both buttons are absent and a banner explains why
  (server enforces it too — the UI just tells the truth early).
- Decision panel stays visible at all scroll positions. Never make someone scroll to a decision.

---

## E. Dashboard Archetype

```
Branch overview · Basni                        Updated 14:41  ↻    [ Last 30 days ▾ ]
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ In yard      │ Awaiting PDI │ Failed       │ Ready        │
│ 142          │ 12           │ 4            │ 27           │
│ ▲ 12 vs prev │ ▼ 3 vs prev  │ ▲ 1 vs prev  │ ▲ 6 vs prev  │
└──────────────┴──────────────┴──────────────┴──────────────┘
┌ Needs attention ────────────────────────────────────────────┐
│ ▌MAT…4522  Failed 6h      1 critical      S.Joshi   [Open]  │
│ ▌MAT…4519  QA pending 2d  —               R.Meena   [Open]  │
│ ▌MAT…4488  Repair 4d      Parts awaited   Workshop  [Open]  │
└─────────────────────────────────────────────────────────────┘
┌ PDI throughput ─────────────┐┌ Defect rate by model ────────┐
│ line chart, 1 series        ││ bar chart, sorted desc        │
└─────────────────────────────┘└───────────────────────────────┘
```

- **The dashboard's first job is a worklist, not charts.** "Needs attention" sits above the charts
  because a branch manager opens this to find out what to chase, not to admire trends.
- Freshness timestamp is mandatory and honest (aggregates are pre-computed; say when).
- Four KPIs maximum per row. A KPI without a comparison is deleted.
- Charts come last, are never more than four series, and every chart has a one-line answer to
  "so what?" as its subtitle.
- HO dashboard is the same layout with a branch-comparison table replacing "Needs attention".

---

## F. Form Archetype

```
Assign inspection
Choose an engineer for MAT…4521.
───────────────────────────────────────────
Engineer *
[ R. Meena — 2 active                   ▾ ]
Shows current load so you don't overload one person.

Due date
[ 14 Sep 2026                          📅 ]

Notes (optional)
[                                         ]
[                                         ]
───────────────────────────────────────────
                    [ Cancel ] [ Assign ]
```

- Single column, max 560px. Never two-column forms — they double the eye's travel for no gain.
- Helper text explains *why the field matters*, not what the field is.
- The submit button names the action.
- Dirty forms warn before navigation. Long forms autosave drafts and say so.
- Validation summary at top only when the form is long enough that errors can be off-screen.

---

## G. Workflow Step Archetype (Mobile Inspection)

```
┌───────────────────────────────────────┐
│ ‹  Exterior                     3/8   │  ← category, position; back exits with confirm
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░  62%       │  ← determinate, real completion
├───────────────────────────────────────┤
│                                       │
│ Item 5 of 12                          │
│ Headlamp alignment and function       │
│ ⌄ How to check                        │
│                                       │
│ 📷 Add photo                          │
│                                       │
├───────────────────────────────────────┤
│  Saved 14:32                          │
│ ┌──────┐ ┌──────┐ ┌────────────────┐  │
│ │ N/A  │ │ Fail │ │      Pass      │  │  ← sticky footer, 52px, --shadow-sticky
│ └──────┘ └──────┘ └────────────────┘  │
└───────────────────────────────────────┘
```

- One item per screen. No scrolling lists of 46 checkboxes — that is how items get missed.
- Progress is real: items answered / items total, per category and overall.
- Advancing is automatic on answer, with a 400ms window and an undo ("Back" restores the answer).
- Fail opens the finding sheet immediately, pre-filled with the item and category.
- The category grid screen shows all 8 categories as cards with `answered/total` and a severity
  summary — the engineer's map of where they are.
- Submit is only reachable from the category grid, and states exactly what is blocking it.

See `references/06-mobile-yard.md` for the rest of the mobile surface.

---

## H. Screen Inventory — Quick Index

**Web:** Login · Overview (HO/Regional/Branch) · Vehicle list · Vehicle detail · PDI queue ·
Inspection detail · QA queue · QA review · Repair queue · Repair detail · Certificate view ·
Reports · Analytics · Users · Roles · Branches · Checklist template editor · Devices · Settings ·
Audit log · Notifications · Profile.

**Mobile:** Splash · Login · Biometric · App lock · Home · My tasks · Scan VIN · Vehicle detail ·
Start inspection · Category grid · Checklist item · Finding capture · Body map · Photo capture ·
Photo review · Submit summary · Sync status · Notifications · Profile & Yard Mode.

Each mobile screen maps to a workflow-step, list or form archetype above. Do not invent a new
archetype for one screen.
