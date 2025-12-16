# Migration Checklist: Legacy → New Structure

## Overview
This document tracks the migration from the legacy structure to the new organized structure implemented on December 16, 2025.

---

## 📁 Directory Structure Changes

### ✅ Completed
- [x] Created `src/_legacy/` folder with old code preserved
- [x] Created new nested structure under `src/app/projects/[projectId]/estimates/`
- [x] Created `src/app/master-data/` for admin functionality
- [x] Created organized `src/components/` with feature folders
- [x] Created organized `src/lib/` with calc, services, utils subdirectories
- [x] Moved `mongodb.ts` → `lib/db/connect.ts`
- [x] Moved `pricing-engine.ts` → `lib/calc/estimate.ts`
- [x] Moved `dupa-instantiation.ts` → `lib/services/instantiateDupa.ts`

---

## 🔄 Migration Tasks by Priority

### Phase 1: Core Infrastructure (Do First)
- [ ] **Update import paths in models**
  - Models still reference old `lib/mongodb.ts`
  - Update to `lib/db/connect.ts`
  - Files affected: All model files

- [ ] **Create database session utility**
  - Create `lib/db/session.ts` for shared DB logic
  
- [ ] **Create calculation utilities**
  - [ ] `lib/calc/labor.ts` - Labor cost calculations
  - [ ] `lib/calc/equipment.ts` - Equipment cost calculations
  - [ ] `lib/calc/materials.ts` - Material cost calculations
  - [ ] `lib/calc/hauling.ts` - Hauling cost calculations
  - [ ] `lib/calc/dupa.ts` - DUPA aggregation logic

- [ ] **Create utility functions**
  - [ ] `lib/utils/format.ts` - Number/currency formatting
  - [ ] `lib/utils/rounding.ts` - Standardized rounding rules

### Phase 2: API Routes (Critical Path)
- [ ] **Migrate Projects API**
  - Current: `src/app/api/projects/` (already in place)
  - Action: Keep as-is, this is correctly placed
  
- [ ] **Migrate Estimates API**
  - Current: `src/app/api/estimates/` (already in place)
  - Action: Keep as-is, this is correctly placed

- [ ] **Create BOQ API**
  - New: `src/app/api/boq/route.ts`
  - Migrate from: `src/_legacy/app/api/project-boq/`
  
- [ ] **Create DUPA API**
  - New: `src/app/api/dupa/instantiate/route.ts`
  - Migrate from: `src/_legacy/app/api/dupa-templates/[id]/instantiate/route.ts`
  - New: `src/app/api/dupa/[dupaId]/route.ts`

- [ ] **Create Master Data APIs**
  - [ ] `src/app/api/master/labor/route.ts` ← from `_legacy/app/api/labor-rates/`
  - [ ] `src/app/api/master/equipment/route.ts` ← from `_legacy/app/api/equipment/`
  - [ ] `src/app/api/master/materials/route.ts` ← from `_legacy/app/api/materials/` & `material-prices/`
  - [ ] `src/app/api/master/hauling/route.ts` (new)
  - [ ] `src/app/api/master/pay-items/route.ts` (new)

### Phase 3: UI Pages (User-Facing)
- [ ] **Migrate Projects Pages**
  - Current: `src/app/projects/` (mostly in place)
  - [ ] Update `page.tsx` to list projects properly
  - [ ] Update `new/page.tsx` for project creation
  - [ ] Update `[id]/page.tsx` for project overview

- [ ] **Create Nested Estimates Pages**
  - [ ] `src/app/projects/[projectId]/estimates/new/page.tsx`
  - [ ] `src/app/projects/[projectId]/estimates/[estimateId]/page.tsx` - Dashboard
  - Migrate logic from: `src/_legacy/app/estimate/`

- [ ] **Create BOQ Entry Page**
  - [ ] `src/app/projects/[projectId]/estimates/[estimateId]/boq/page.tsx`
  - Migrate from: `src/_legacy/app/projects/[id]/boq/[boqId]/page.tsx`

- [ ] **Create DUPA Pages**
  - [ ] `src/app/projects/[projectId]/estimates/[estimateId]/dupa/page.tsx` - List
  - [ ] `src/app/projects/[projectId]/estimates/[estimateId]/dupa/[dupaId]/page.tsx` - Editor
  - Migrate from: `src/_legacy/app/dupa-templates/`

- [ ] **Create Print Pages**
  - [ ] `src/app/projects/[projectId]/estimates/[estimateId]/print/pow-01.tsx`
  - [ ] `src/app/projects/[projectId]/estimates/[estimateId]/print/pow-01a.tsx`
  - [ ] `src/app/projects/[projectId]/estimates/[estimateId]/print/pow-01b.tsx`
  - [ ] `src/app/projects/[projectId]/estimates/[estimateId]/print/pow-01c.tsx`
  - [ ] `src/app/projects/[projectId]/estimates/[estimateId]/print/dupa.tsx`

- [ ] **Create Master Data Pages**
  - [ ] `src/app/master-data/labor/page.tsx` ← from `_legacy/app/labor-rates/`
  - [ ] `src/app/master-data/equipment/page.tsx` ← from `_legacy/app/equipment/`
  - [ ] `src/app/master-data/materials/page.tsx` ← from `_legacy/app/materials/`
  - [ ] `src/app/master-data/hauling/page.tsx` (new)
  - [ ] `src/app/master-data/pay-items/page.tsx` (new, from templates)

### Phase 4: Components (Reusable UI)
- [ ] **Create Layout Components**
  - [ ] `src/components/layout/PageHeader.tsx`
  - [ ] `src/components/layout/Breadcrumbs.tsx`

- [ ] **Create BOQ Components**
  - [ ] `src/components/boq/BoqTable.tsx`

- [ ] **Create DUPA Components**
  - [ ] `src/components/dupa/DupaEditor.tsx`
  - [ ] `src/components/dupa/LaborTable.tsx`
  - [ ] `src/components/dupa/EquipmentTable.tsx`
  - [ ] `src/components/dupa/MaterialsTable.tsx`
  - [ ] `src/components/dupa/TotalsPanel.tsx`

- [ ] **Create Print Components**
  - [ ] `src/components/print/POW01.tsx`
  - [ ] `src/components/print/POW01A.tsx`
  - [ ] `src/components/print/POW01B.tsx`
  - [ ] `src/components/print/POW01C.tsx`
  - [ ] `src/components/print/DUPA.tsx`

- [ ] **Create UI Components**
  - [ ] `src/components/ui/DataTable.tsx`
  - [ ] `src/components/ui/NumberInput.tsx`
  - [ ] `src/components/ui/Select.tsx`

### Phase 5: Models & Schema Updates
- [ ] **Review and Update Models**
  - Current models are in good shape, may need:
  - [ ] Update `BoqLine.ts` if doesn't exist
  - [ ] Rename `DUPATemplate.ts` → `DupaTemplate.ts` (consistent casing)
  - [ ] Create `ProjectDupa.ts` for instantiated DUPAs
  - [ ] Create `HaulingRate.ts` model
  - [ ] Review relationships between models

### Phase 6: Styles
- [ ] **Create Print Styles**
  - [ ] `src/styles/print/pow.css`
  - [ ] `src/styles/print/dupa.css`
  - [ ] `src/styles/tables.css`

### Phase 7: Documentation
- [ ] **Create Core Documentation**
  - [ ] `docs/ARCHITECTURE.md` - System design overview
  - [ ] `docs/DATABASE_SCHEMA.md` - Model relationships
  - [ ] `docs/CALCULATION_RULES.md` - Excel formula equivalents
  - [ ] `docs/ROADMAP.md` - Future features
  - [ ] Update `docs/README.md` with new structure

---

## 🗂️ Legacy Code Mapping

### What's in `_legacy/` and where it should go:

#### API Routes
```
_legacy/app/api/dupa-templates/       → api/dupa/ + api/master/pay-items/
_legacy/app/api/equipment/            → api/master/equipment/
_legacy/app/api/labor-rates/          → api/master/labor/
_legacy/app/api/material-prices/      → api/master/materials/
_legacy/app/api/materials/            → api/master/materials/
_legacy/app/api/project-boq/          → api/boq/
_legacy/app/api/rates/                → Merge into estimates or deprecate
```

#### UI Pages
```
_legacy/app/dupa-templates/           → projects/[projectId]/estimates/[estimateId]/dupa/
_legacy/app/equipment/                → master-data/equipment/
_legacy/app/labor-rates/              → master-data/labor/
_legacy/app/materials/                → master-data/materials/
_legacy/app/rates/                    → Merge into estimates or master-data
```

---

## 🚨 Breaking Changes to Watch

1. **Import Path Changes**
   - All components importing from `@/lib/mongodb` need update
   - All components importing from `@/lib/pricing-engine` need update
   - All components importing from `@/lib/dupa-instantiation` need update

2. **Route Changes**
   - Old estimate routes: `/estimate/[id]`
   - New estimate routes: `/projects/[projectId]/estimates/[estimateId]`
   - Update all navigation links and API calls

3. **API Endpoint Changes**
   - Master data consolidated under `/api/master/*`
   - DUPA operations under `/api/dupa/*`
   - Update all fetch calls in components

---

## ✅ Testing Checklist

After each phase, verify:
- [ ] No TypeScript errors (`npm run build`)
- [ ] All imports resolve correctly
- [ ] API routes return expected data
- [ ] Pages render without errors
- [ ] Database connections work
- [ ] Calculations produce correct results

---

## 📝 Notes

- **Keep `_legacy/` folder until full migration is complete and tested**
- **Test each phase before moving to the next**
- **Update this checklist as you complete tasks**
- **Document any issues or discoveries in comments**

---

## 🎯 Success Criteria

Migration is complete when:
1. All functionality from legacy code is working in new structure
2. All tests pass
3. No references to `_legacy/` in active code
4. Documentation is updated
5. Team is trained on new structure
6. `_legacy/` folder can be safely deleted

---

*Last Updated: December 16, 2025*
