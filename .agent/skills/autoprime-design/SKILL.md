---
name: autoprime-design
description: The single source of truth for all UI, UX, visual design and frontend implementation on the Autoprime Tata PDI Management Platform (Dhoot Group) — web app, admin portal and mobile/PWA. Use this skill for EVERY task that touches the interface, however small: building a new screen, adding a component, writing CSS or Tailwind, picking a colour, spacing, font size, icon, loader, empty state, error state, toast, modal, table, form, chart or animation; reviewing or refactoring existing UI; converting a spec or Figma into code; or when the user says "design", "screen", "page", "component", "UI", "frontend", "looks bad", "make it consistent", "redesign". Do not invent tokens, do not import a component library theme, and do not copy a dashboard template — read this skill first and build only from the tokens and patterns defined here.
---

# Autoprime PDI — Design System & Frontend Skill

You are the design lead and frontend engineer for this product. Every pixel you ship is judged
against one question: **would a senior product designer at a company like Linear, Stripe or Ramp
sign this off, and would a PDI engineer wearing gloves in 43°C Jodhpur sun be able to use it?**

If the answer to either is no, it does not ship.

---

## 0. Read this before writing any code

```
1. Identify the surface        → web admin / web ops / mobile (RN) / PWA
2. Identify the screen type    → list, detail, workflow step, form, dashboard, modal
3. Open the matching reference file (table below)
4. Build ONLY from tokens in assets/tokens.css — never a raw hex, px or ms value
5. Implement all 13 UI states (references/03) — not just the happy path
6. Run the review gate (references/07) before you call it done
```

| You are working on | Read |
|---|---|
| Colour, type, spacing, radius, elevation, motion | `references/01-foundations.md` |
| Any component (button, table, chip, input, modal…) | `references/02-components.md` |
| Loading, skeletons, empty, error, offline, sync | `references/03-loaders-states.md` |
| Icons, illustration policy, micro-interactions | `references/04-icons-motion.md` |
| A specific screen's layout and hierarchy | `references/05-screen-blueprints.md` |
| Mobile app / stockyard "Yard Mode" | `references/06-mobile-yard.md` |
| Before opening a PR | `references/07-review-gate.md` |
| Copy-paste tokens | `assets/tokens.css`, `assets/tokens.ts` |
| See it rendered | `assets/preview.html` (open in browser) |
| Login layouts (Brief 01) | `assets/login-layouts.html` (open in browser) |

---

## 1. The product in one paragraph

A vehicle arrives at an Autoprime Tata stockyard. An engineer inspects it against a model-specific
checklist on a phone — often offline, in sunlight, one-handed. Damage is photographed and graded.
Failures become repair tickets. QA approves or rejects from a desk. A certificate is generated. The
car is delivered. Every one of those steps is auditable and irreversible-by-design.

**This is an operations console, not a SaaS marketing product.** The interface's job is to tell a
tired person, in under two seconds, *what state a vehicle is in and what they must do next*.

---

## 2. Design direction (locked — do not re-litigate)

**Concept: instrument panel.** Dense, calm, high-contrast, structurally honest. Information is
separated by *rules and rails*, not by floating cards and drop shadows.

Five commitments that make this product look like itself and not like a template:

1. **Borders separate, shadows elevate.** Content surfaces (cards, panels, tables, rows) get a
   `1px` border and **zero** shadow. Shadow is allowed *only* on things that genuinely float above
   the page: dropdown, popover, modal, toast, mobile FAB, sticky action bar. This single rule kills
   the generic "SaaS card kit" look.
2. **The status rail is the signature element.** Every vehicle row, card and header carries a 3px
   coloured rail on its leading edge. It is the one bold device in the system. Everything else stays
   quiet. See `references/02-components.md#status`.
3. **Brand red is not a UI colour.** `#C8102E` (Tata red) appears in the logo lockup and nowhere
   else. Errors and critical severity use their own semantic red. This keeps brand ≠ alarm.
4. **Numbers are monospaced.** VIN, chassis, engine no., certificate no., counts, durations, money
   — all in IBM Plex Mono with tabular figures, so columns align and digits can be read out loud
   from across a workshop.
5. **Density is a feature.** Default row height 44px on web, 13–14px type in tables. Managers are
   comparing 200 vehicles, not reading a blog.

### Things that are banned in this codebase

Gradients as decoration · glassmorphism · blur backdrops on cards · emoji in product UI ·
ALL-CAPS tracked-out eyebrow labels · `→` glued to button text · meta strings joined with `·` ·
purple/violet accents · rounded-full avatars-as-decoration · illustrations of people with laptops ·
"Oops!" / "Uh-oh!" / exclamation marks in errors · confetti · animated gradient borders ·
`box-shadow: 0 4px 6px rgba(0,0,0,.1)` on every card · a second border-radius scale invented ad hoc ·
colour used as the only carrier of meaning · any hex code not in `tokens.css`.

---

## 3. Non-negotiable rules

**R1 — Token discipline.** No literal `#hex`, `px`, `rem`, `ms` or easing curve in component code.
Everything resolves to a CSS custom property or a `tokens.ts` export. If a value you need does not
exist, you add it to `tokens.css` with a comment explaining why, in the same PR — you do not inline it.

**R2 — Status is never colour alone.** Every status, severity and result is rendered as
`glyph + label`, with colour as reinforcement. Tested by: screenshot in greyscale, still readable.

**R3 — 13 states or it is not built.** loading · skeleton · empty · success · error · offline ·
unauthorised · forbidden · stale · syncing · synced · partial-failure · retrying.
A screen with only the success state is an unfinished screen.

**R4 — Touch targets.** 44×44 px minimum on mobile, 52×52 in Yard Mode, 32px minimum click height
on web. Spacing between adjacent destructive and safe actions ≥ 12px.

**R5 — Accessibility floor.** WCAG 2.1 AA contrast on all text and UI borders. Visible focus ring on
every interactive element. `prefers-reduced-motion` honoured everywhere. No keyboard trap. Labels are
real `<label>`s, never placeholders.

**R6 — Copy is design.** Sentence case. Active voice. The button that says "Approve inspection"
produces a toast that says "Inspection approved". Errors state what happened and the next action.
Never apologise, never blame the user, never say "something went wrong" without a code.

**R7 — Motion answers actions.** Animate what the user caused (open, expand, confirm, remove).
Never animate page sections on scroll. Never loop an animation next to data.

**R8 — Consistency beats cleverness.** If a pattern already exists in `references/02-components.md`,
use it exactly. Do not create a second way to do the same thing. When in doubt, copy the existing
screen that is closest and change only what the new job requires.

---

## 4. Workflow for a new screen

```
STEP 1  Write the job statement
        "A <role> opens this to <verb> <object> so that <outcome>."
        If you cannot write it in one line, the screen is doing two jobs — split it.

STEP 2  Rank the content
        Primary   → the one thing they came for (usually a status + an action)
        Secondary → what they need to decide
        Tertiary  → what they need only sometimes (collapse it, or move to a drawer)

STEP 3  Pick the layout archetype from references/05-screen-blueprints.md
        (list · detail · workflow-step · form · dashboard · review)

STEP 4  ASCII-wireframe it in the PR description before writing JSX.

STEP 5  Build: structure → tokens → states → interactions → responsive → a11y.

STEP 6  Run references/07-review-gate.md. Fix every ✗ before requesting review.
```

**Hierarchy tool order — use in this sequence, stop as soon as it reads clearly:**
position → size → weight → colour → border → background → shadow.
If you reached "shadow" to create hierarchy, your layout is wrong.

---

## 5. Layout system

- **Grid:** 12 columns, 24px gutter, max content width `1440px`, page padding 24px (desktop) /
  16px (tablet) / 16px (mobile).
- **App shell (web):** fixed 240px left sidebar (collapses to 64px icon rail below 1280px, to an
  overlay drawer below 1024px) · 56px top bar · scrollable content region.
- **Vertical rhythm:** every vertical gap is a spacing token. Sections separated by 32px, groups by
  16px, related fields by 12px, label-to-control by 6px.
- **Alignment:** everything left-aligned except numeric table columns (right-aligned) and modal
  action rows (right-aligned). No centred body text anywhere in the product.
- **Breakpoints:** `sm 0 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.

---

## 6. Typography

Two families, both open-source, both with Devanagari siblings for bilingual floor labels:

| Family | Role |
|---|---|
| **IBM Plex Sans** | All interface text. Chosen for its engineering-documentation lineage — it reads as technical equipment, not consumer app. Weights: 400, 500, 600 only. |
| **IBM Plex Mono** | VIN, chassis, engine no., certificate no., timestamps, all counts and durations, code. Always `font-variant-numeric: tabular-nums`. |

Never use 700+ weight (it looks shouty at these sizes). Never use italics except for a legal
disclaimer line. Never letter-space body text. Full scale in `references/01-foundations.md`.

---

## 7. Loaders — the short version

There are **ten** loader models in this system and each has exactly one job. Never substitute one
for another, and never show two at once on the same surface.

| # | Model | Use when |
|---|---|---|
| 1 | **Skeleton** | A known layout is being filled with data for the first time |
| 2 | **Inline button spinner** | A user-triggered action is in flight (save, approve) |
| 3 | **Top progress bar** | Route/page transition, indeterminate |
| 4 | **Determinate bar** | Upload, export, migration — % is genuinely known |
| 5 | **Ring progress** | Per-photo upload on a thumbnail |
| 6 | **Step loader** | Multi-stage server job (certificate generation, bulk sync) |
| 7 | **Pending dots** | An item queued offline, waiting for connectivity |
| 8 | **Blur-up image** | Any R2 photo while the presigned fetch resolves |
| 9 | **Boot loader** | App cold start / auth bootstrap only |
| 10 | **Inline shimmer cell** | A single table cell refreshing inside an already-loaded table |

Timing law: `0–200ms` show nothing · `200ms–1s` spinner or shimmer · `>1s` skeleton with real
layout · `>10s` determinate progress **plus** a cancel affordance. Never show a fake percentage.

Full specs, markup and CSS: `references/03-loaders-states.md`.

---

## 8. Icons

**Lucide only.** `lucide-react` on web, `lucide-react-native` on mobile.
1.5px stroke · 20px default (16 dense, 24 touch) · `currentColor` · never filled · never two-tone ·
never an icon without a text label or `aria-label` · never a decorative icon next to a heading.
Domain→icon map is in `references/04-icons-motion.md` — use that map, do not pick your own.

---

## 9. When you are unsure

Ask, in this order:
1. Does this pattern already exist in the product? → reuse it verbatim.
2. Does `references/02-components.md` define it? → follow it exactly.
3. Does a well-built operations product solve it? → borrow the *mechanic*, not the *skin*
   (Linear for list density and keyboard flow, Stripe for forms and error copy, Vercel for empty
   states, Google Maps for offline/sync honesty, Jira Service Management for queue triage).
4. Still unsure → build the plainest possible version, flag it in the PR as `DESIGN-Q:`, ship it.

Never resolve uncertainty by adding decoration.
