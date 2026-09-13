# Autoprime PDI — Mobile App & Stockyard "Yard Mode"

> **The Reality Check:** An inspection app that works in an air-conditioned office is useless if a PDI engineer wearing rubber/leather work gloves in 43°C Jodhpur sun cannot tap a button or read the screen.

---

## 1. Operating Environment & Constraints

Stockyard inspections take place under harsh field conditions:
1. **Intense Glare & Heat:** Ambient temperatures exceeding 43°C in Rajasthan/Gujarat, extreme direct sunlight causing screen wash-out.
2. **PPE & Gloves:** Technicians wear inspection gloves; precision pinch gestures and tiny 24px targets fail completely.
3. **One-Handed Operation:** One hand holds the phone while the other holds a flashlight, paint-depth gauge, or inspects panel gaps.
4. **Zero / Flaky Connectivity:** Concrete stockyards and metal sheds create signal dead zones. The app must function 100% offline.

---

## 2. Yard Mode Specifications

When "Yard Mode" is engaged (automatically on mobile inspection routes or manually toggled via header):

### 2.1 Touch Target Expansion
- Standard Web touch target: `32px`
- Standard Mobile touch target: `44px`
- **Yard Mode touch target: strictly `52 × 52px` minimum**
- Spacing between adjacent buttons: `>= 12px` to eliminate fat-finger mis-taps.

### 2.2 Sunlight Contrast Override
- Surface backgrounds switch to pure `#FFFFFF`.
- Inks switch to pure `#000000` (or `#0E1116`).
- Border lines increase from `1px` to `2px solid #000000` or `#D7DBE0`.
- All secondary muted text (`--ink-3`) is darkened to `--ink-2` (`#4A5159`) to prevent sunlight invisibility.

### 2.3 Thumb-Zone Architecture
- All primary actions (`Pass`, `Fail`, `Add Defect`, `Next`) are anchored to a fixed **Bottom Action Bar** within natural thumb reach.
- Destructive actions (`Reject Inspection`) are located behind a deliberate long-press or two-step confirmation dialog.

---

## 3. Defect Capture & Camera Workflow

Defect documentation must be instant.

```
[Tap "Fail"] ──> [Full-Screen Camera Launches < 300ms] ──> [Snap Photo] ──> [Tap Damage Location] ──> [Severity Tag] ──> [Saved to Queue]
```

1. **Instant Shutter:** Camera launches with zero transition lag.
2. **Defect Pinning:** Inspector taps directly on the photo preview to place a defect pin (e.g. "Scratch", "Dent", "Misalignment").
3. **Severity Toggle:** Three large 52px segmented buttons:
   - `[Minor]` (Cosmetic, buffing required)
   - `[Major]` (Part replacement / panel repaint)
   - `[Critical]` (Safety hazard, vehicle immobilized)
4. **Local Storage First:** High-resolution photos are compressed client-side and saved immediately to local storage (SQLite / WatermelonDB / IndexedDB) before background sync begins.

---

## 4. Offline Queue & Network Status Bar

When working in the yard without cellular signal:
- The app displays a sticky top status bar:
  ```
  [WifiOff Icon] Offline Mode • 14 actions queued for sync • Local storage healthy
  ```
- Technicians never see blocking modal alerts saying "Network Error".
- When WiFi or 4G is re-established, the sync worker transmits records in order, displaying a non-intrusive progress counter: `Syncing 3 of 14 photos…`.
