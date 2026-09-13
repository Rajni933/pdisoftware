# Autoprime PDI — Loaders & The 13 UI States

> **Rule R3:** 13 states or it is not built. A screen that handles only the happy path is an unfinished screen.

---

## 1. The Timing Law

To avoid visual jitter, flickers, and false illusions of performance, state transitions must strictly obey the **Timing Law**:

```
[0ms] ──(No loader)──> [200ms] ──(Spinner / Shimmer)──> [1000ms] ──(Full Skeleton Layout)──> [10s] ──(Determinate Bar + Cancel)
```

1. **0 – 200ms:** Show **nothing**. Fast requests resolve silently without layout flash.
2. **200ms – 1s:** Show a lightweight inline spinner or subtle shimmer cell.
3. **> 1s:** Render a full structural skeleton that matches the exact physical layout of the incoming data.
4. **> 10s:** Render a determinate progress bar with a transparent explanation ("Syncing 124 records with cloud...") and an explicit **Cancel** affordance.
5. **Never fake progress:** A progress bar must represent actual bytes or items completed. Never animate a fake 0–99% progress bar.

---

## 2. The Ten Loader Models

Every loader model has exactly one dedicated purpose. Never substitute one for another.

| # | Model | Dedicated Use Case | Implementation Pattern |
|---|---|---|---|
| 1 | **Skeleton** | First data load of a known page layout | CSS pulse shimmer with identical width/height to real components |
| 2 | **Inline Button Spinner** | In-flight user action (e.g. "Saving…", "Approving…") | 16px SVG spinner replacing or flanking button text; button stays disabled |
| 3 | **Top Progress Bar** | Route change / full page navigation | 2px high hairline bar running across the viewport top border |
| 4 | **Determinate Bar** | Uploading heavy assets (batch defects, firmware logs) | Track + fill percentage, explicitly displays `MB uploaded` or `x of y items` |
| 5 | **Ring Progress** | Photo thumbnail upload during PDI inspection | Radial SVG stroke around camera thumbnail |
| 6 | **Step Loader** | Multi-stage operations (PDI Certificate creation + PDF signing) | Stepper list: Step 1 (Done) → Step 2 (In-Flight) → Step 3 (Pending) |
| 7 | **Pending Dots** | Offline queued items waiting for connection | 3 static or gently pulsing dots next to an item in offline queue |
| 8 | **Blur-up Image** | Cloudflare R2 presigned image resolution | Low-res SVG placeholder or blur hash until full image finishes decode |
| 9 | **Boot Loader** | Initial app cold boot / auth token verification | Centered Autoprime mark with calm, non-looping initialization pulse |
| 10 | **Inline Shimmer Cell** | Single cell or row background refresh in active table | Shimmer sweep on the modified cell while preserving the rest of the table |

---

## 3. The 13 Mandatory UI States

Every view, data list, and form in the platform must support and handle these 13 states:

### 3.1 `loading` (Initial Load)
- Request initiated; triggers after 200ms delay.
- Skeletons render matching the destination layout.

### 3.2 `skeleton` (Layout Placeholder)
- Structural wireframe using `bg-line` with a calm opacity animation.
- Table headers are visible; table rows are placeholder bars.

### 3.3 `empty` (Zero Records Found)
- Never show a blank screen.
- Explains why the view is empty and provides a direct primary action:
  - *"No inspections scheduled for Bay 04 today."*
  - Primary button: `[Schedule New PDI]` or `[Switch Bay]`.

### 3.4 `success` (Data Loaded / Action Confirmed)
- Standard populated UI.
- Completed mutations trigger an ephemeral toast: *"Vehicle MAT628… approved."*

### 3.5 `error` (Hard Failure)
- Clear notification containing:
  1. What failed.
  2. The technical error code (`ERR_SYNC_GATEWAY_TIMEOUT`).
  3. The next action: `[Retry Now]` or `[Work Offline]`.
- No apologies, no exclamation marks.

### 3.6 `offline` (Connection Lost)
- Persistent top status chip or toast: *"Working offline. Changes are saved locally on this device."*
- Actions switch from cloud mutation to local queue.

### 3.7 `unauthorised` (No Session / Token Expired)
- User session is invalid.
- Redirects cleanly to login with return path preserved in state.

### 3.8 `forbidden` (Insufficient Role Privileges)
- Technician attempts to access Admin Audit Log or Financial Release.
- Calm callout explaining the exact role required: *"This action requires QA Manager or Dealer Principal permissions."*

### 3.9 `stale` (Cached Data Displayed)
- In the yard with intermittent network, cached vehicle profile is displayed.
- Subdued banner: *"Showing cached data from 10:45 AM. Pull to refresh."*

### 3.10 `syncing` (Background Synchronization In Flight)
- Local changes are being synchronized with Cloudflare Worker / Supabase.
- Header icon shows rotating sync arrows with queue counter (`Syncing 3 items…`).

### 3.11 `synced` (Sync Complete)
- All offline actions successfully written to remote database.
- Shows timestamp: *"All changes saved • 11:02 AM"*.

### 3.12 `partial-failure` (Batch Partial Error)
- Batch upload of 12 defect photos had 2 timeouts.
- UI highlights the specific failed thumbnails with `[Retry Failed (2)]` button without discarding the 10 succeeded photos.

### 3.13 `retrying` (Automatic Exponential Backoff)
- Network blip on submitting PDI form.
- Input disabled; status displays: *"Connection lost. Retrying in 4s (attempt 2 of 5)… [Retry Now]"*.
