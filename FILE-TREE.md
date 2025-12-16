# Updated File Tree - Post Restructuring (December 16, 2025)

## New Structure

```
POW/
├── docs/                           # ✨ NEW: Project documentation
│   ├── ARCHITECTURE.md            # System design overview
│   ├── MIGRATION_CHECKLIST.md     # Migration tracking
│   └── RESTRUCTURING_NOTES.md     # What changed and why
│
├── src/
│   ├── _legacy/                   # ⚠️ OLD CODE - Preserved but don't use
│   │   └── app/
│   │       ├── api/              # Old API routes
│   │       │   ├── dupa-templates/
│   │       │   ├── equipment/
│   │       │   ├── labor-rates/
│   │       │   ├── material-prices/
│   │       │   ├── materials/
│   │       │   ├── project-boq/
│   │       │   └── rates/
│   │       ├── dupa-templates/   # Old DUPA pages
│   │       ├── equipment/        # Old equipment pages
│   │       ├── labor-rates/      # Old labor pages
│   │       ├── materials/        # Old materials pages
│   │       └── rates/            # Old rates pages
│   │
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   │
│   │   ├── projects/             # ✅ KEPT: Project pages
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx
│   │   │       ├── boq/         # Old BOQ location (still here)
│   │   │       │   └── [boqId]/
│   │   │       │       └── page.tsx
│   │   │       └── estimates/   # ✨ NEW: Nested estimate structure
│   │   │           ├── new/
│   │   │           │   └── page.tsx
│   │   │           └── [estimateId]/
│   │   │               ├── page.tsx          # Estimate dashboard
│   │   │               ├── boq/
│   │   │               │   └── page.tsx      # BOQ entry
│   │   │               ├── dupa/
│   │   │               │   ├── page.tsx      # DUPA list
│   │   │               │   └── [dupaId]/
│   │   │               │       └── page.tsx  # DUPA editor
│   │   │               └── print/            # ✨ NEW: Print layouts
│   │   │                   ├── pow-01.tsx
│   │   │                   ├── pow-01a.tsx
│   │   │                   ├── pow-01b.tsx
│   │   │                   ├── pow-01c.tsx
│   │   │                   └── dupa.tsx
│   │   │
│   │   ├── estimate/             # ✅ KEPT: Old estimate pages
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── edit/
│   │   │       │   └── page.tsx
│   │   │       └── reports/
│   │   │           └── page.tsx
│   │   │
│   │   ├── master-data/          # ✨ NEW: Admin data management
│   │   │   ├── labor/
│   │   │   │   └── page.tsx
│   │   │   ├── equipment/
│   │   │   │   └── page.tsx
│   │   │   ├── materials/
│   │   │   │   └── page.tsx
│   │   │   ├── hauling/
│   │   │   │   └── page.tsx
│   │   │   └── pay-items/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                  # API Routes
│   │       ├── projects/         # ✅ KEPT: Projects API
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       │
│   │       ├── estimates/        # ✅ KEPT: Estimates API
│   │       │   ├── route.ts
│   │       │   ├── import/
│   │       │   │   └── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       │
│   │       ├── boq/              # ✨ NEW: BOQ API
│   │       │   └── route.ts
│   │       │
│   │       ├── dupa/             # ✨ NEW: DUPA API
│   │       │   ├── instantiate/
│   │       │   │   └── route.ts
│   │       │   └── [dupaId]/
│   │       │       └── route.ts
│   │       │
│   │       └── master/           # ✨ NEW: Master data APIs
│   │           ├── labor/
│   │           │   └── route.ts
│   │           ├── equipment/
│   │           │   └── route.ts
│   │           ├── materials/
│   │           │   └── route.ts
│   │           ├── hauling/
│   │           │   └── route.ts
│   │           └── pay-items/
│   │               └── route.ts
│   │
│   ├── components/               # ✨ NEW: React components
│   │   ├── layout/
│   │   │   ├── PageHeader.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   ├── boq/
│   │   │   └── BoqTable.tsx
│   │   ├── dupa/
│   │   │   ├── DupaEditor.tsx
│   │   │   ├── LaborTable.tsx
│   │   │   ├── EquipmentTable.tsx
│   │   │   ├── MaterialsTable.tsx
│   │   │   └── TotalsPanel.tsx
│   │   ├── print/
│   │   │   ├── POW01.tsx
│   │   │   ├── POW01A.tsx
│   │   │   ├── POW01B.tsx
│   │   │   ├── POW01C.tsx
│   │   │   └── DUPA.tsx
│   │   └── ui/
│   │       ├── DataTable.tsx
│   │       ├── NumberInput.tsx
│   │       └── Select.tsx
│   │
│   ├── lib/                      # Business logic
│   │   ├── db/                   # ✨ NEW: Database utilities
│   │   │   ├── connect.ts        # ← mongodb.ts MOVED HERE
│   │   │   └── session.ts
│   │   │
│   │   ├── calc/                 # ✨ NEW: Calculation engine
│   │   │   ├── labor.ts
│   │   │   ├── equipment.ts
│   │   │   ├── materials.ts
│   │   │   ├── hauling.ts
│   │   │   ├── dupa.ts
│   │   │   └── estimate.ts       # ← pricing-engine.ts MOVED HERE
│   │   │
│   │   ├── services/             # ✨ NEW: Orchestration
│   │   │   ├── instantiateDupa.ts # ← dupa-instantiation.ts MOVED HERE
│   │   │   ├── recalcEstimate.ts
│   │   │   └── validation.ts
│   │   │
│   │   └── utils/                # ✨ NEW: Helpers
│   │       ├── format.ts
│   │       └── rounding.ts
│   │
│   ├── models/                   # ✅ KEPT: Mongoose schemas
│   │   ├── Project.ts
│   │   ├── Estimate.ts
│   │   ├── PayItem.ts
│   │   ├── BoqLine.ts
│   │   ├── DUPATemplate.ts
│   │   ├── ProjectDupa.ts
│   │   ├── LaborRate.ts
│   │   ├── Equipment.ts
│   │   ├── Material.ts
│   │   ├── MaterialPrice.ts
│   │   ├── RateItem.ts
│   │   └── ProjectBOQ.ts
│   │
│   └── styles/                   # ✨ NEW: Stylesheets
│       ├── print/
│       │   ├── pow.css
│       │   └── dupa.css
│       └── tables.css
│
├── REFERENCE/                    # Reference data
│   ├── equipmentdatabase.csv
│   └── Materials Database.csv
│
├── .env.local                    # Environment variables
├── next.config.js                # ✏️ UPDATED: Excludes _legacy
├── tsconfig.json                 # ✏️ UPDATED: Excludes _legacy
├── package.json
├── tailwind.config.js
├── postcss.config.js
│
└── README.md                     # ✏️ UPDATED: Restructuring notice

```

## Key Changes Summary

### ✨ New Directories
- `docs/` - Project documentation
- `src/_legacy/` - Preserved old code
- `src/components/` - Organized by feature
- `src/lib/db/`, `src/lib/calc/`, `src/lib/services/`, `src/lib/utils/`
- `src/styles/`
- `src/app/master-data/`
- `src/app/projects/[projectId]/estimates/[estimateId]/`

### 📦 Moved Files
- `src/lib/mongodb.ts` → `src/lib/db/connect.ts`
- `src/lib/pricing-engine.ts` → `src/lib/calc/estimate.ts`
- `src/lib/dupa-instantiation.ts` → `src/lib/services/instantiateDupa.ts`

### 🗑️ Moved to Legacy
- `src/app/dupa-templates/` → `src/_legacy/app/dupa-templates/`
- `src/app/equipment/` → `src/_legacy/app/equipment/`
- `src/app/labor-rates/` → `src/_legacy/app/labor-rates/`
- `src/app/materials/` → `src/_legacy/app/materials/`
- `src/app/rates/` → `src/_legacy/app/rates/`
- Corresponding API routes also moved to `_legacy/`

### ✅ Kept in Place
- `src/app/projects/` (updated)
- `src/app/estimate/` (to be migrated)
- `src/app/api/projects/`
- `src/app/api/estimates/`
- `src/models/` (all models)

---

*Generated: December 16, 2025*
