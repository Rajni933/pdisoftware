# 03 — Loaders & UI States

> **Status:** Locked specification. The definitive guide for loading models, the timing law, all 13 application UI states, offline synchronization honesty, and the approved copy bank.

---

## 1. The Timing Law

| Elapsed Time | What to Show | Rationale |
|---|---|---|
| **0 – 200ms** | **Nothing** | A flash of a spinner is worse than a beat of stillness. |
| **200ms – 1s** | **Inline spinner** (action) or **shimmer** (cell) | Subtle affordance indicating active processing without layout disruption. |
| **> 1s** | **Skeleton** matching real layout | Structural placeholder that sets spatial expectation. |
| **> 10s** | **Determinate progress** with cancel affordance | Transparent progress with an explicit escape hatch or background option. |
| **> 30s** | **Background job + notification** | Move to background queue; release the UI surface to the user. |

### Core Laws
1. **Never invent a percentage:** If the exact progress is unknown, it is indeterminate. A fake 90%-then-stuck progress bar destroys user trust faster than a slow spinner.
2. **One loader per surface:** A page skeleton and a button spinner must never run simultaneously on the same container.
3. **Loaders reserve exact space:** Zero cumulative layout shift (CLS) between loading and loaded states. Measure the real component dimensions and build the skeleton to match.
4. **Every loader has a failure branch wired before shipping:** A loader that can spin forever without a timeout is a critical bug.
5. **`prefers-reduced-motion` law:** All shimmer animations and spins cease; display a static placeholder or a plain `"Loading…"` text line.

---

## 2. The Ten Loader Models

### Model 1: Skeleton
- **When to use:** First paint of a known layout (table, vehicle detail, dashboard KPI grid, list).
- **Physical spec:** Not vague grey blobs. The skeleton is the real component with content replaced: identical row heights, cell paddings, column widths, and page row count.
- A status rail skeleton preserves the 3px rail in `--p-n-200` (`#D7DEE5`).

```css
.skel {
  background: var(--p-n-100);
  border-radius: var(--radius-xs);
  position: relative;
  overflow: hidden;
}
.skel::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent);
  animation: skel-sweep 1.4s var(--ease-move) infinite;
}
@keyframes skel-sweep {
  to { transform: translateX(100%); }
}
@media (prefers-reduced-motion: reduce) {
  .skel::after { animation: none; }
}
```
*Vary line widths per row (e.g. 92% · 68% · 80%) so it reads as structured typography, not a barcode. Never shimmer more than 8 rows simultaneously — render 8 and let the rest resolve.*

### Model 2: Inline Button Spinner
- **When to use:** User-triggered mutations in flight (`Approve inspection`, `Save draft`).
- **Physical spec:** The button retains its exact width, disables, and swaps its text label for a 16px spinner + present-progressive verb.
  ```
  [ Approve inspection ] → [ ◌ Approving… ]
  ```
- **Rules:** Never grey out the entire form. Never render a full-page overlay for a single field action.

### Model 3: Top Progress Bar
- **When to use:** Route transitions or indeterminate navigation-level fetches.
- **Physical spec:** 2px high hairline bar pinned directly to the top of the content region (immediately below the top navigation bar), in `--color-action`. Appears after 200ms, completes to 100%, and fades out over 140ms. On mobile: pinned under the header.
- **Rule:** Replaces full-page spinners entirely.

### Model 4: Determinate Progress Bar
- **When to use:** File uploads, export generation, Excel stock import — where a genuine fraction is known.
- **Physical spec:** 6px track in `--p-n-100`, `--radius-xs`, fill in `--color-action`.
- **Paired text line:** Always display an explanatory line below: *"4 of 11 photos · 2.1 MB of 5.8 MB"*. Percentage alone is insufficient context in stockyard sunlight.
- At `> 10s`, display a cancel ghost button or `[Continue in background]`.

### Model 5: Ring Progress
- **When to use:** Single photo thumbnail uploading in defect inspection.
- **Physical spec:** 28px SVG circular ring, 3px stroke, background track `rgba(255, 255, 255, 0.35)` over dimmed photo, fill in white, stroke-dasharray driven.
- Completes to a checkmark glyph that holds for 800ms before fading.
- On failure, turns into a `RefreshCw` retry icon that is tappable.

### Model 6: Step Loader
- **When to use:** Multi-stage backend operations (PDI certificate generation, bulk vehicle sync, audit PDF signing).
- **Physical spec:** Vertical stepper list of named operational stages:
  ```
  ✓ Inspection locked            1.2s
  ◌ Rendering certificate
  ○ Signing and storing
  ○ Ready to download
  ```
- Stages:
  - Completed = `Check` in success colour (`#0F7A46`) + elapsed time in mono.
  - Active = 14px spinner in `--color-action`.
  - Pending = hollow 8px circular node in `--p-n-300`.
- If a stage fails: node turns `OctagonAlert` in `--color-danger`, remaining stages dim, and error message with retry button renders beneath.

### Model 7: Pending Dots (Queued Offline)
- **When to use:** Record saved locally in IndexedDB/SQLite, waiting for cellular network.
- **Crucial rule:** This is NOT a loader — nothing is in flight. It must look physically distinct from anything loading:
  - Three 3px circular dots in `--p-n-400` (`#8A97A6`) fading in sequence over 1.2s.
  - Paired with `CloudOff` glyph and the label `"Queued"`.
  - **The Principle:** *Spinning means the network is working; dots mean it is not.* Field technicians learn this in 5 minutes and it stops false support inquiries.

### Model 8: Blur-Up Image
- **When to use:** Cloudflare R2 photos loading in inspection dossiers.
- **Physical spec:** Render a 20px-wide base64 LQIP (or a flat `--p-n-100` block) scaled with an 8px blur, cross-fading to the high-res image over 180ms upon decode.
- Container retains the exact 1:1 aspect ratio from frame one so zero layout shift occurs.
- On failure: render `ImageOff` icon + `"Photo unavailable"` + retry button.

### Model 9: Boot Loader
- **When to use:** Initial app cold boot or auth token verification only. Maximum once per session.
- **Physical spec:** Centered 40px Autoprime mark, and beneath it a 2px high, 120px wide indeterminate bar. No tagline, no spinning percentage.
- If bootstrap exceeds 6s, the bar is replaced by: *"Still connecting… check your network"* + `[Retry]` button.

### Model 10: Inline Shimmer Cell
- **When to use:** A single cell or KPI value refreshing in an already-loaded table (e.g. background polling of vehicle bay or age).
- **Physical spec:** The cell's text is temporarily replaced by a skeleton block of the same measured width. The surrounding table remains stable. Never zero out a value before the replacement arrives.

---

## 3. Decision Matrix: Choosing the Right Loader

```
Is the entire surface unknown?                  → 1. Skeleton
Did the user click an action button?            → 2. Inline Button Spinner
Is the page/route changing?                     → 3. Top Progress Bar
Is a true fraction/percentage known?            → 4. Determinate Bar (or 5. Ring on thumbnail)
Are there named server pipeline stages?         → 6. Step Loader
Is the network absent and item queued locally?  → 7. Pending Dots (NOT a spinner!)
Is a photo or damage image loading?             → 8. Blur-Up Image
Is the app starting from scratch?               → 9. Boot Loader
Is a single value inside loaded table stale?    → 10. Inline Shimmer Cell
```

---

## 4. The 13 Mandatory UI States

Every view, form, and table must implement all applicable states from this list:

| State | Required Visual Elements | Behavior & Recovery |
|---|---|---|
| **1. Loading** | Correct loader model chosen from the 10 models above | Activates strictly after 200ms delay |
| **2. Skeleton** | Exact layout-accurate geometry, zero shift on data resolve | Max 8 rows, variable text line widths |
| **3. Empty (No Data)** | 24px glyph in `--p-n-400` · One-line explanation · Primary action button | No decorative illustrations |
| **4. Empty (Filtered)** | *"No vehicles match these filters."* + `[Clear filters]` link | Never offer "Add vehicle" when filters cause empty |
| **5. Success** | Normal populated UI view | Completed mutations display a 5s toast |
| **6. Error** | Plain statement · Error code in mono font · Retry button · Alternative exit | State what happened and next step |
| **7. Offline** | Persistent banner · Queued item count · Active local save indicator | Never block user interaction with modals |
| **8. Unauthorised (401)**| *"Your session expired. Sign in to continue."* | Redirect to login with return URL preserved |
| **9. Forbidden (403)** | Callout stating exact missing role and who to contact | Never leak contents of unauthorized record |
| **10. Stale** | Subtle line: *"Updated 11 min ago"* + refresh glyph | Amber tint only if data is decision-critical |
| **11. Syncing** | Non-blocking sync glyph + *"Syncing 4 items…"* | Shows progress fraction if known |
| **12. Synced** | *"All changes saved · 14:32"* | Holds for 3s, then collapses to a quiet static check |
| **13. Partial Failure** | Count of succeeded vs failed (e.g. 10 of 12 uploaded) | Failed items individually listed with `[Retry Failed]` |
| **14. Retrying** | Mono attempt counter and next-attempt countdown: *"Retry 2 of 5 · next in 0:28"* | Exponential backoff with `[Retry Now]` override |

---

## 5. Offline & Synchronization (The Trust Surface)

In stockyard operations, field staff decide whether to trust the app based on offline behavior. **Be relentlessly honest.**

### Connection Indicators
- **Mobile:** Permanent icon in the top header: `Wifi` (online) or `CloudOff` (offline) + queued item count. Tapping opens the sync detail view.
- **Web:** Permanent connection status indicator at the bottom of the left sidebar navigation.

### Sync Drawer / Modal
```
┌──────────────────────────────────────────────────────────────────┐
│ [CloudOff] Offline Mode                                          │
│ Last synced: 14:32 (2 h ago)                                     │
├──────────────────────────────────────────────────────────────────┤
│ Waiting to upload:                                               │
│ • 3 inspection records               ••• Queued                  │
│ • 7 defect photos (4.2 MB)           ••• Queued                  │
│                                                                  │
│ Failed uploads:                                                  │
│ • Photo: Front bumper scratch        Retry 3 of 5 · in 0:28      │
│                                      [Retry now]                 │
├──────────────────────────────────────────────────────────────────┤
│                                      [Close]       [ Retry all ] │
└──────────────────────────────────────────────────────────────────┘
```

### Architectural Offline Rules
1. **Never say "Saved" if it only saved locally.** Say *"Saved on this device"*.
2. **Never silently drop a queued item.** A failure that exhausts all retries becomes a persistent alert banner.
3. **Never block the inspection workflow because sync failed.** Data capture always takes priority.
4. **Conflict resolution honesty:** Server wins by default, but conflicts are surfaced explicitly: show both values, state which was preserved, and let the engineer see what was superseded. Silent overwrites are strictly banned.

---

## 6. Copy Bank — Exact Approved Strings

Use these exact strings in code. Never invent alternative copy.

| Scenario | Approved Production Copy |
|---|---|
| **Empty vehicle queue** | *"No vehicles in this queue."* / *"Vehicles appear here once they're received into the stockyard."* |
| **Empty filtered table** | *"No vehicles match these filters."* + `[Clear filters]` |
| **Empty findings** | *"No findings recorded."* / *"Add one if you see damage during inspection."* |
| **Network error** | *"Couldn't load vehicles. Check your connection and try again."* + `[ERR_NET_TIMEOUT]` + `[Retry]` |
| **Server error** | *"Something failed on our side. The team has been notified."* + `[ERR_SRV_500]` + `[Retry]` |
| **Forbidden (403)** | *"You don't have access to this branch's records. Ask your branch manager for access."* |
| **Session expired** | *"Your session expired. Sign in to continue."* |
| **Offline banner** | *"You're offline. You can keep inspecting — everything saves on this device and uploads when you're back."* |
| **Queued item** | *"Queued — will upload when you're back online."* |
| **Sync failed** | *"4 photos didn't upload after 5 attempts."* + `[Retry now]` |
| **Device revoked** | *"This device has been deregistered. Contact your administrator."* |
| **Blocked submission** | *"3 mandatory items are still unanswered."* + `[Show them]` |
| **Photo required** | *"Critical findings need at least one photo."* |
| **Destructive confirm** | *"Reject this inspection? Vehicle MAT…4521 will return to the engineer. This is permanently recorded."* |
| **Save success toast** | *"Inspection submitted."* / *"Inspection approved."* / *"Ticket assigned to S. Rathore."* |
| **Invalid credentials** | *"Employee ID or password is incorrect. 3 attempts left before the account locks."* |
| **Account locked out** | *"This account is locked. Too many failed sign-in attempts."* + *"Try again in 4:58"* |
| **Offline sign-in** | *"You're offline. Sign in needs a connection."* |
| **Forgot password** | *"Ask your branch administrator to reset your password."* |
| **Device registration** | *"Your administrator can see and remove registered devices. This device will be named {model} unless you change it."* |
| **App lock expired** | *"Your session expired while the app was locked."* |


### Banned Copy (Instant PR Rejection)
- ❌ *"Oops!"* / *"Uh oh!"*
- ❌ *"Something went wrong!"* (without an error code and action)
- ❌ *"Please try again later"*
- ❌ *"Loading your data…"* / *"We're working on it"*
- ❌ *"No data found 🙁"* (no emojis in operations UI)
