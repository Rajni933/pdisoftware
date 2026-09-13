# 06 — Mobile & Yard Mode

The mobile app is not a shrunk web app. It is a field instrument used by someone standing outside,
in sun, possibly wearing gloves, holding a torch or a clipboard, with one usable hand, on a
₹12,000 Android phone, with two bars of signal, under pressure to clear 30 cars before lunch.

Design for that person or the app gets abandoned for a paper checklist within a month.

---

## 1. Physical Constraints → Design Responses

| Constraint | Response |
|---|---|
| **Bright sunlight** | Near-white backgrounds, 1px+ borders, AA+ contrast minimum, no low-contrast grey-on-grey, no thin 300-weight type |
| **Gloves / wet hands** | 44px minimum targets, 52px in Yard Mode, 12px minimum gaps, no long-press-only actions, no swipe-only actions (swipe may be a shortcut, never the only path) |
| **One hand** | All primary actions in the bottom third. Nothing critical in the top-right corner |
| **Torch or clipboard in the other hand** | No two-finger gestures anywhere. No drag-and-drop |
| **Time pressure** | Auto-advance on answer, camera one tap away, zero confirmation dialogs on non-destructive actions |
| **Weak network** | Offline-first everywhere; see `03#offline` |
| **Mid-range Android** | Budget: < 2s cold start, 60fps list scroll, images decoded off the main thread, no heavy blur/shadow effects |

---

## 2. Navigation

Bottom tab bar, five items, 56px + safe area:

```
  Home      Tasks      [Scan]      Alerts     Profile
  home    clipboard-   scan-line     bell      user
          check       (raised)
```

- **Scan is the centre tab and is visually raised** (48px circle, `--color-action`, white glyph,
  `--shadow-sticky`). It is the single most-used action in the product and deserves the best
  position on the screen.
- Tab labels always visible — icon-only tabs are guesswork in the field.
- Alerts tab carries a count badge; danger fill when something is blocked or sync has failed.
- No hamburger menu. No nested drawers. Maximum two levels deep from any tab.

---

## 3. Yard Mode

A user-toggled profile (Profile → Yard Mode), remembered per device, and auto-suggested once via a
dismissible banner when ambient light exceeds threshold or the screen brightness is at max.

```
[data-mode="yard"] overrides:
  --t-body      14 → 16
  --t-body-sm   13 → 15
  --t-caption   12 → 13
  --touch-min   44 → 52
  --rail         3 → 5
  --color-border          #D7DEE5 → #B9C4CF
  --color-text-secondary  #4A5766 → #33404E
  --photo-thumb  64 → 88
```

### Rules
- Yard Mode changes **density and contrast only**. It never hides features, never changes layout
  structure, never becomes a different app. Someone switching it on mid-inspection must not get lost.
- Toggling never loses in-progress state.
- Screenshots of both modes are required in any PR that touches a mobile screen.

---

## 4. Camera & Photo Flow

```
Tap "Add photo"
  → camera opens directly (no intermediate sheet)
  → guided overlay: dimmed frame + hairline guide + slot label ("Front exterior")
  → capture (shutter 72px, bottom centre, thumb-reachable)
  → immediate preview with [Retake] [Use photo]
  → returns to the item, thumbnail animates into the strip
  → compress to WebP 1920×1080 q0.82 off the main thread
  → queue for upload; ring progress on the thumbnail
```

- The overlay guide is a hairline rectangle, not an illustrated car outline — outlines never match
  the actual model and engineers stop trusting them.
- Multiple photos per slot allowed; the strip is horizontally scrollable with a persistent
  "+" tile at the end.
- Capture **always succeeds locally**, even with zero storage headroom warnings pending; upload is a
  separate concern the engineer is never blocked on.
- Photo metadata shown on review: slot, time (mono), size, upload state.

---

## 5. Finding Capture Sheet

Bottom sheet, `--radius-md`, drag handle, opens to 90% height.

```
Add finding                                   ✕
Exterior · Headlamp alignment and function
──────────────────────────────────────────────
Severity *
[⛔ Critical] [⚠ Major] [◔ Minor] [👁 Observation]   ← segmented, 52px
Critical and major findings fail the inspection and create a repair ticket.

Where *
[ vehicle body map — tap a panel ]
Front bumper ✕

What you saw *
[ Scratch ▾ ]   [ 8 cm, lower edge, below the fog lamp        ]

Photos *  (required for critical)
[ 📷 ] [thumb] [thumb]
──────────────────────────────────────────────
                        [ Cancel ] [ Save finding ]
```

- Severity first, because it determines everything downstream and the engineer already knows it.
- The consequence of the chosen severity is stated in plain language under the selector, live.
- Save is disabled with an inline reason until requirements are met — never a silent dead button.
- Findings are editable until submission and read-only after; the UI says which state it is in.

---

## 6. Auth, Lock and Device

- **Login:** employee ID + password, 44px fields, mono employee-ID field, "Show password" toggle,
  no social logins, no "remember me" checkbox (device registration handles it).
- **Biometric:** offered on second launch, never forced, always with a visible fallback path. The
  prompt is the platform's own — no custom biometric UI.
- **App lock:** full-screen cover, blurred nothing — a plain surface with the logo, the user's name,
  and the unlock action. Sensitive content is removed from the view hierarchy before the app
  backgrounds (`FLAG_SECURE` / `isCaptured`), so the app-switcher preview is a plain surface too.
- **Device revoked:** a full-screen terminal state with the exact copy from `03#copy`, one action
  ("Sign out"), no retry loop.

---

## 7. Performance Budget (Mobile)

| Metric | Budget |
|---|---|
| Cold start → login | < 2s |
| Warm start → biometric prompt | < 1s |
| Checklist answer → local save + visual feedback | < 50ms |
| Camera tap → viewfinder | < 300ms |
| Capture → preview | < 300ms |
| Category grid with 8 categories, 46 items | 60fps scroll |
| List of 200 assigned vehicles | virtualised, 60fps |

If an interaction cannot hit its budget, change the interaction — do not add a loader to cover it.

---

## 8. PWA Differences

The PWA is a reduced surface and must **say so** rather than fail silently:
- Camera quality and guided capture are degraded → show a one-time notice, keep the flow identical.
- No biometric unlock → the toggle is absent, not disabled.
- Offline works, but storage limits are real → surface remaining capacity on the sync screen when
  below 20%.
Never render a control the PWA cannot honour.
