# 07 — Review Gate

Run this before you call any UI work done. Every line is pass/fail. Report the result in the PR
description as a checklist. **A single ✗ blocks the merge.**

---

## A. Tokens & Consistency

- [ ] Zero raw hex, rgb, px font-size, or ms value in component code
- [ ] No radius value outside the four defined (`3px`, `6px`, `10px`, `999px`)
- [ ] No shadow on anything that is not a popover, modal, drawer, toast or sticky bar
- [ ] No new colour introduced; new states mapped into an existing status family
- [ ] Spacing values all come from the scale (no `13px`, no `18px`, no `margin: 0 auto` hacks)
- [ ] Typography uses scale tokens; no ad-hoc `font-size` / `line-height`
- [ ] All numbers, IDs and VINs are mono + tabular

## B. States

- [ ] Loading uses the correct model from `03#models` (and only one on the surface)
- [ ] Skeleton matches real dimensions — verified by toggling, zero layout shift
- [ ] Empty state exists, and the filtered-empty state is separate from the never-had-data state
- [ ] Error state has: plain statement, error code, retry, and a non-retry escape
- [ ] Offline behaviour defined and non-blocking
- [ ] 403 does not leak the protected record's contents
- [ ] Every mutation shows in-flight, success and failure feedback
- [ ] Nothing can spin forever — every loader has a timeout branch

## C. Interaction

- [ ] Exactly one primary button per screen region
- [ ] Every button label is `verb + object`
- [ ] Destructive actions confirm, name the object, and state the consequence
- [ ] Disabled controls state why, inline or on hover
- [ ] Forms: label above, validate on blur, server errors mapped to fields, dirty-state guard
- [ ] Filter and tab state is in the URL (web)
- [ ] Keyboard: tab order sane, focus visible, Esc closes, focus returns to trigger

## D. Accessibility

- [ ] All text ≥ 4.5:1; UI borders and glyphs ≥ 3:1
- [ ] Passes in greyscale — no meaning carried by colour alone
- [ ] Icons are `aria-hidden` beside labels, `aria-label` when alone
- [ ] Touch targets ≥ 44px (≥ 52px in Yard Mode)
- [ ] `prefers-reduced-motion` honoured, including loaders
- [ ] Headings are a real, ordered hierarchy; landmarks present
- [ ] Screen-reader pass on one primary flow per PR

## E. Responsive

- [ ] Works at 360, 768, 1024, 1440
- [ ] No horizontal scroll on desktop tables — columns drop by priority
- [ ] Mobile table → stacked cards, not a squeezed grid
- [ ] Sticky headers and action bars respect safe areas and don't cover content

## F. Copy

- [ ] Sentence case everywhere, no ALL-CAPS labels
- [ ] No "Oops", no exclamation marks, no apologies
- [ ] Action verb identical in button, loading label and success toast
- [ ] Empty states invite an action; error states name the next step
- [ ] Nothing says "Saved" when it only saved locally

## G. The Three Anti-Slop Tests

**1. The greyscale test.** Screenshot, desaturate. If you can't tell a failed vehicle from an
approved one, the status system is broken.

**2. The squint test.** Blur the screenshot to 8px. The most important element must still be the
most visually prominent. If a decorative element survives the blur better than the primary action,
delete the decoration.

**3. The swap test.** Replace the logo and product name with a competitor's. Does anything left on
the screen still identify this as an automotive inspection console? If not, the status rail, the
mono data treatment or the density is not doing its job.

## H. The Chanel Rule

Before opening the PR, look at the screen and **remove one thing**. An icon, a divider, a subtitle,
a border, a shadow, a colour. Then check whether anyone would miss it. Usually not — and the screen
is better for it.

---

## Definition of Done (UI)

A screen is done when all of the following exist:

```
□ Matches an archetype in 05-screen-blueprints.md
□ All applicable states from 03-loaders-states.md implemented
□ Tokens only, no exceptions
□ Keyboard + screen reader pass
□ Screenshots attached: desktop, mobile, empty, error, offline (+ Yard Mode if mobile)
□ This checklist pasted into the PR with every box ticked
□ No new component pattern introduced without adding it to 02-components.md in the same PR
```
