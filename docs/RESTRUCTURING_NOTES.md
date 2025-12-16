# Code Restructuring - December 16, 2025

## What Changed?

The project has been reorganized into a cleaner, more maintainable structure. All existing code has been preserved in the `src/_legacy/` folder while the new structure is implemented.

## Directory Changes

### Old Structure → New Structure

#### App Routes (Pages)
```
src/app/dupa-templates/      → src/_legacy/app/dupa-templates/
src/app/equipment/           → src/_legacy/app/equipment/
src/app/labor-rates/         → src/_legacy/app/labor-rates/
src/app/materials/           → src/_legacy/app/materials/
src/app/rates/               → src/_legacy/app/rates/
```

New structure created under:
- `src/app/projects/[projectId]/estimates/[estimateId]/` - Nested estimates
- `src/app/master-data/` - Admin data management

#### API Routes
```
src/app/api/dupa-templates/  → src/_legacy/app/api/dupa-templates/
src/app/api/equipment/       → src/_legacy/app/api/equipment/
src/app/api/labor-rates/     → src/_legacy/app/api/labor-rates/
src/app/api/material-prices/ → src/_legacy/app/api/material-prices/
src/app/api/materials/       → src/_legacy/app/api/materials/
src/app/api/project-boq/     → src/_legacy/app/api/project-boq/
src/app/api/rates/           → src/_legacy/app/api/rates/
```

New structure created under:
- `src/app/api/boq/` - BOQ operations
- `src/app/api/dupa/` - DUPA operations
- `src/app/api/master/` - Master data APIs

#### Library Files
```
src/lib/mongodb.ts            → src/lib/db/connect.ts
src/lib/pricing-engine.ts     → src/lib/calc/estimate.ts
src/lib/dupa-instantiation.ts → src/lib/services/instantiateDupa.ts
```

New directories created:
- `src/lib/db/` - Database utilities
- `src/lib/calc/` - Calculation functions
- `src/lib/services/` - Business logic
- `src/lib/utils/` - Helper functions

#### New Directories Created
- `src/components/layout/` - Layout components
- `src/components/boq/` - BOQ components
- `src/components/dupa/` - DUPA components
- `src/components/print/` - Print layouts
- `src/components/ui/` - Reusable UI
- `src/styles/print/` - Print stylesheets
- `docs/` - Project documentation

## Important: Import Path Changes

If you're working on code that imports from the following paths, update them:

### ❌ Old Imports (Will Break)
```typescript
import { connectDB } from '@/lib/mongodb'
import { calculateEstimate } from '@/lib/pricing-engine'
import { instantiateDUPA } from '@/lib/dupa-instantiation'
```

### ✅ New Imports
```typescript
import { connectDB } from '@/lib/db/connect'
import { calculateEstimate } from '@/lib/calc/estimate'
import { instantiateDUPA } from '@/lib/services/instantiateDupa'
```

## What's Next?

See [docs/MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) for the full migration plan.

**Priority tasks:**
1. Update all model imports to use new lib paths
2. Migrate API routes to new structure
3. Create calculation utilities in `lib/calc/`
4. Build out new UI pages
5. Create reusable components

## Do NOT Delete `_legacy/` Yet!

The `src/_legacy/` folder contains all working code. It should remain until:
- All functionality is migrated and tested
- All import paths are updated
- Team is comfortable with new structure
- A final review confirms nothing is missing

## Questions?

Refer to:
- [docs/ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [docs/MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) - Migration tasks
- Ask the team lead if something is unclear

---

*Restructuring Date: December 16, 2025*
