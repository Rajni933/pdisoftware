# Autoprime PDI — Icons & Motion

> **Rules R5 & R7:** Lucide only, 1.5px stroke, accessible labels. Motion answers user actions only.

---

## 1. Icon Standards

The system exclusively utilizes **Lucide Icons** (`lucide-react` for Web, `lucide-react-native` for Mobile).

### 1.1 Structural Constraints
- **Stroke Width:** Strictly `1.5px` (or `strokeWidth={1.75}` for 16px micro icons).
- **Default Size:** `20px` (standard actions, navigation).
- **Compact / Table Size:** `16px` (inside table cells, chips, compact buttons).
- **Touch / Mobile Size:** `24px` (mobile bottom navigation, Yard Mode primary controls).
- **Color:** Always `currentColor`. Inherits typography color.
- **Filling:** Never filled, never two-tone. Pure outline geometry.
- **Accessibility:** Never render an icon alone without an accompanying `aria-label` or visible label text.

---

## 2. Domain-to-Icon Mapping

Do not guess or pick random icons. Use this standard domain map:

| Domain Concept | Lucide Icon | Component Name | Usage Context |
|---|---|---|---|
| **Overview / Dashboard** | `LayoutDashboard` | `<LayoutDashboard />` | Main operations overview |
| **Inward / Gate Pass** | `Truck` | `<Truck />` | Vehicle delivery truck arrival |
| **Vehicle / Car Profile** | `Car` | `<Car />` | Vehicle details, chassis lookup |
| **PDI Inspection** | `ClipboardCheck` | `<ClipboardCheck />` | Active inspection checklist |
| **Checklist Item** | `CheckSquare` | `<CheckSquare />` | Standard item checkbox |
| **Passed / Verified** | `Check` | `<Check />` | Checkpoint pass badge |
| **Defect / Issue** | `AlertTriangle` | `<AlertTriangle />` | Inspection flaw, cosmetic damage |
| **Critical Failure** | `XCircle` | `<XCircle />` | Major safety fail, rejection |
| **Quality Audit / QA** | `ShieldCheck` | `<ShieldCheck />` | QA signoff, final release |
| **Certificate / PDF** | `FileText` | `<FileText />` | PDI Certificate generation |
| **Stockyard / Bay** | `Warehouse` | `<Warehouse />` | Bay management, parking allocation |
| **Camera / Photo Capture**| `Camera` | `<Camera />` | Defect evidence photo |
| **Sync / Network** | `RefreshCw` | `<RefreshCw />` | Offline sync state, queue |
| **Offline Alert** | `WifiOff` | `<WifiOff />` | Disconnected indicator |
| **User / Technician** | `User` | `<User />` | Profile, assigned technician |
| **Search / Filter** | `Search` | `<Search />` | Global VIN & booking search |
| **Calendar / Date** | `Calendar` | `<Calendar />` | Inward schedule, delivery date |
| **History / Audit Log** | `Clock` | `<Clock />` | Vehicle event timeline |
| **Settings / Config** | `Settings` | `<Settings />` | Dealership settings |

---

## 3. Motion & Micro-Interactions

Motion in this system is an **operational response**, not aesthetic decoration.

### 3.1 When to Animate
- **Expansion / Collapse:** Accordion checklist sections expanding (`150ms`).
- **Surface Elevation:** Modals appearing, flyout drawers sliding from right (`200ms`).
- **Dismissal:** Toast notifications sliding out, deleted row collapsing (`150ms`).
- **State Switch:** Toggle switch flipping from Off to On (`150ms`).

### 3.2 What is Strictly Banned
- ❌ Animating page sections into view on scroll.
- ❌ Bouncing buttons or pulsing "Click Me" call-to-actions.
- ❌ Confetti or celebration particle bursts on PDI completion.
- ❌ Infinite spinning badges (except loading/sync spinners).
- ❌ Parallax movement or decorative gradient rotation.

### 3.3 Easing Curves & Timing
- Enter / Expand: `150ms cubic-bezier(0.16, 1, 0.3, 1)` (snappy ease-out).
- Exit / Dismiss: `120ms cubic-bezier(0.4, 0, 1, 1)` (rapid ease-in).
- Standard Duration: Never exceed `250ms`. Operational users must never wait for an animation to finish to click the next button.

### 3.4 Reduced Motion
Every animation must be completely disabled if the user has requested reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
