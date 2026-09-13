# Autoprime PDI — Pre-PR Design Review Gate

> **Mandatory Review:** Before any frontend pull request or component change is merged, every item on this checklist must pass. If any check fails, the pull request does not ship.

---

## 1. Non-Negotiable Rules Audit

### Rule R1 — Token Discipline
- [ ] No raw hex codes (`#123456`) in CSS, JSX, or Tailwind inline classes.
- [ ] Every color references a token (`var(--accent)`, `text-ink`, `bg-surface`, `border-line`).
- [ ] No raw pixel values for typography, padding, or margins (`px-[17px]` is banned; use `space-*` scale).
- [ ] Any new required token was added to `tokens.css` with a rationale comment.

### Rule R2 — Status is Never Colour Alone
- [ ] Every status badge, table row indicator, and defect pill contains a **glyph/icon + text label**.
- [ ] **Greyscale Test Passed:** Screenshot converted to black-and-white is 100% decipherable.

### Rule R3 — 13 UI States Implemented
- [ ] `loading` & `skeleton` states match the physical layout of the loaded data.
- [ ] `empty` state explains why there is no data and provides a primary recovery action.
- [ ] `error` state displays an exact error code and a retry/fallback affordance.
- [ ] `offline` and `syncing` indicators behave correctly when network is toggled off in DevTools.

### Rule R4 — Touch Target Floor
- [ ] Web desktop clickable targets are at least `32px` tall.
- [ ] Mobile buttons and tappable rows are at least `44 × 44px`.
- [ ] Yard Mode inspection controls are at least `52 × 52px`.
- [ ] Safe spacing between adjacent destructive and confirmation buttons is `>= 12px`.

### Rule R5 — Accessibility (a11y) Floor
- [ ] Contrast ratio between text and surface meets WCAG 2.1 AA (min 4.5:1 for body, 3:1 for large text).
- [ ] Every form input has an associated, visible `<label>` element (placeholders are never labels).
- [ ] All interactive controls have a visible focus ring: `outline: 2px solid var(--accent); outline-offset: 2px;`.
- [ ] `@media (prefers-reduced-motion: reduce)` disables all transitions and animations.

### Rule R6 — Copy is Design
- [ ] Sentence case used across all titles, buttons, badges, and headers (no Title Case or ALL CAPS).
- [ ] Active voice used ("Save inspection", not "Your inspection will be saved").
- [ ] No apology or blame copy ("Something went wrong" or "Oops!" are strictly prohibited).
- [ ] Error messages explicitly explain what happened and what to do next.

### Rule R7 — Motion Answers Actions
- [ ] Motion occurs strictly in response to user actions (opening a modal, expanding an accordion).
- [ ] Zero scroll-triggered section reveal animations.
- [ ] No decorative infinite animations next to static data.

### Rule R8 — Consistency Beats Cleverness
- [ ] Used existing components from `references/02-components.md`.
- [ ] Zero drop shadows on content cards and panels.
- [ ] Monospaced tabular numbers (`IBM Plex Mono`) used for all VINs, chassis numbers, dates, and counts.
- [ ] The 3px Status Rail is applied to the leading edge of vehicle cards and table rows.

---

## 2. PR Description Sign-Off Template

Paste this block into the Pull Request description:

```markdown
### Design System Verification
- [x] R1: Token discipline verified (zero raw hex/px)
- [x] R2: Greyscale test passed (status = glyph + text)
- [x] R3: Handled all applicable UI states (loading, skeleton, empty, error, offline)
- [x] R4: Touch targets meet minimum height (>=32px web / >=44px mobile / >=52px yard)
- [x] R5: WCAG AA contrast & visible focus ring confirmed
- [x] R6: Sentence case & active voice verified
- [x] R7: Motion is purely functional; reduced-motion respected
- [x] R8: Zero shadows on content cards; status rail applied
```
