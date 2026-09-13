# Autoprime PDI — Screen Blueprints & Layout Archetypes

> Every screen belongs to one of six structural archetypes. Do not invent a bespoke layout when an archetype fits the task.

---

## 1. Hierarchy Rules

When arranging elements on any screen, apply the hierarchy tools in this strict order:
1. **Position:** Top-left is highest priority; bottom/right is secondary.
2. **Size:** 17px for container title, 14px for primary data, 11-13px for metadata.
3. **Weight:** 600 for headings/KPIs, 500 for labels, 400 for values. (700+ is banned).
4. **Colour:** Ink for values, Ink-3 for labels, Accent for active items, Semantic for status.
5. **Border:** 1px hairlines to separate regions.
6. **Background:** Canvas (`#FAFAFA`) vs Surface (`#FFFFFF`).
7. **Shadow:** Prohibited on pages and panels. Used ONLY on floating overlays.

---

## 2. The Six Layout Archetypes

### 2.1 Archetype A: The List / Registry
Used for vehicle inventories, inward truck queues, inspection queues, and user management.

```
+------------------------------------------------------------------------------------+
| Page Title: Inward Vehicles Queue             [Filter Status] [Search VIN] [+ Inward]
+------------------------------------------------------------------------------------+
| Tabs: All (42) | Pending PDI (18) | In Progress (6) | Passed (14) | Rectification (4) |
+------------------------------------------------------------------------------------+
| [3px Rail]  VIN / Chassis      Model & Variant         Bay       Status     Defects |
| [Green]     MAT628472P12891    Nexon EV Empowered+     Bay 02    [Passed]      0    |
| [Amber]     MAT628472P12892    Harrier Fearless MT     Bay 04    [In Prog]     2    |
| [Red]       MAT628472P12893    Safari Accomplished+    Bay 01    [Failed]      5    |
+------------------------------------------------------------------------------------+
| Pagination / Record Count: Showing 1-25 of 42 vehicles             < Prev  1 [2]  Next >
+------------------------------------------------------------------------------------+
```

### 2.2 Archetype B: The Detail Record
Used for vehicle profiles, completed inspection dossiers, and audit trails.

```
+------------------------------------------------------------------------------------+
| <- Back to Queue   Vehicle: MAT628472P12891 (Nexon EV)      [Status Chip] [Action] |
+---------------------------------------------------+--------------------------------+
| MAIN CONTENT (2/3 Width)                          | SIDEBAR / METADATA (1/3 Width) |
| +-----------------------------------------------+ | +----------------------------+ |
| | Summary Cards (VIN, Engine, Battery, Inward)  | | | Vehicle Status Rail        | |
| +-----------------------------------------------+ | | Location: Bay 02 (Jodhpur) | |
| | Inspection Checkpoints (Grouped by Category)  | | | Assigned Tech: R. Sharma   | |
| |   > Exterior & Paint (Pass - 18/18)           | | | Date: 13 Sep 2026 10:30 AM | |
| |   > Electrical & Battery (Pass - 24/24)       | | +----------------------------+ |
| |   > Underbody & Tyres (Pass - 12/12)          | | | Attached Documents         | |
| +-----------------------------------------------+ | | - Gate Pass Inward PDF     | |
| | Defect Gallery (0 defects logged)             | | | - OEM Transit Slip         | |
| +-----------------------------------------------+ | +----------------------------+ |
+---------------------------------------------------+--------------------------------+
```

### 2.3 Archetype C: The Workflow Step (Active PDI)
Optimized for one-handed mobile and tablet stockyard inspection. Dense, large tap targets.

```
+------------------------------------------------------------------------------------+
| Top Bar: Step 2 of 4 — Exterior Body & Paint               [14 / 22 Checked] [Quit]|
+------------------------------------------------------------------------------------+
| Sub-category: Front Bumper & Headlamps                                             |
|                                                                                    |
| [Pass] [Fail]  1. Front bumper alignment and paint finish                          |
| [Pass] [Fail]  2. LED headlamps and DRL operation (High/Low beam)                  |
| [Pass] [Fail]  3. Fog lamp housing and bezel integrity                            |
|                                                                                    |
| [!] DEFECT LOGGED: Paint scratch 3cm on left quarter panel                         |
|     [Photo Thumbnail] [Photo Thumbnail] [+ Add Photo]                              |
|     Severity: [Minor] [Major] [Critical]                                           |
+------------------------------------------------------------------------------------+
| Sticky Bottom Bar:                                                                 |
| [< Previous Step]                                        [Save & Continue to Next >]
+------------------------------------------------------------------------------------+
```

### 2.4 Archetype D: The Operational Form
Used for gate-in registration, driver handover, and manual vehicle inwarding.

```
+------------------------------------------------------------------------------------+
| Form Title: Record Vehicle Inward Gate Pass                                        |
+------------------------------------------------------------------------------------+
| Panel 1: Carrier & Transit Details                                                 |
|   Transporter Name: [ Tata Logistics Ltd.         ]  Truck No: [ RJ-19-GA-1234 ]   |
|   Driver Name:      [ Suresh Kumar                ]  Phone:    [ +91 98290 12345 ] |
|                                                                                    |
| Panel 2: Vehicle Identification                                                    |
|   VIN (Scan or Type): [ MAT628472P12891           ] [Scan Barcode]                 |
|   Chassis No:         [ 12891                     ]  Engine:   [ REV20268491   ]   |
|   Model:              [ Harrier MT                ]  Color:    [ Daytona Grey  ]   |
+------------------------------------------------------------------------------------+
| Footer Actions:                              [Cancel]   [Save Draft]   [Confirm Gate-In]
+------------------------------------------------------------------------------------+
```

### 2.5 Archetype E: The Operations Dashboard
Real-time dealership visibility. High-density metrics, status distributions, aging alerts.

```
+------------------------------------------------------------------------------------+
| Dealership: Autoprime Tata (Jodhpur Central)           [Today] [This Week] [Refresh]|
+------------------+------------------+------------------+---------------------------+
| Total Inward     | PDI Completed    | First-Pass Rate  | Aging > 48h in Yard       |
| 142              | 118              | 91.4%            | 6 vehicles                |
| +12 today        | 8 in progress    | +2.1% vs last wk | [Requires Escalation]     |
+------------------+------------------+------------------+---------------------------+
| Active Bay Allocation (12 Bays)             | PDI Bottleneck Queue (Top 5 Issues)  |
| Bay 01: [Inward Check - Safari]             | 1. High-voltage battery firmware (4) |
| Bay 02: [Exterior PDI - Nexon EV]           | 2. Transit clear-coat scratches (3)  |
| Bay 03: [QA Final Signoff - Curvv]          | 3. Infotainment screen freeze (2)    |
+---------------------------------------------+--------------------------------------+
```

### 2.6 Archetype F: The Review & Approval Console
Dual-column split interface for QA Managers to cross-examine checklist notes, defect photos, and sign off certificates.

```
+------------------------------------------------------------------------------------+
| Review PDI #PDI-2026-0842 — Tata Curvv Accomplished                [Reject] [Approve]
+---------------------------------------------------+--------------------------------+
| LEFT: Checklist Findings                          | RIGHT: Evidence & Photo Viewer |
| Category: Body Panels                             | +----------------------------+ |
| [Pass] Hood alignment                             | | High-Res Defect Photo      | |
| [Fail] Rear tail-gate panel gap (>4.5mm)          | | (Annotated defect area)    | |
|        Notes: Left gap 5.2mm vs spec 3.0mm        | | Timestamp: 11:14 AM        | |
|                                                   | | Inspector: R. Sharma       | |
| Rectification History:                            | +----------------------------+ |
| Rectified by Workshop Bay 02 (12 Sep 15:00)       | [Thumb 1] [Thumb 2] [Thumb 3]  |
| Post-fix gap measured: 3.1mm (Within spec)        |                                |
+---------------------------------------------------+--------------------------------+
```
