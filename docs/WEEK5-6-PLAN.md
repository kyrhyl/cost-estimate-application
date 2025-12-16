# Week 5-6 Development Plan

**Implementation Period**: Week 5-6 (December 2025)  
**Focus**: DUPA Templates, Projects, Enhanced Workflows, Navigation  
**Status**: 🚧 IN PROGRESS (1/10 tasks complete)

---

## 🎯 Overview

Week 5-6 builds upon the master data foundation (Week 3-4) by implementing:
1. **DUPA Template System** - Reusable unit price analysis templates
2. **Project Management** - Full project lifecycle with nested estimates/BOQ
3. **Enhanced Workflows** - Improved estimate creation and reporting
4. **System Integration** - Navigation, seed data, complete user experience

---

## 📋 Task Breakdown

### ✅ Task 1: DUPA Templates CRUD API (COMPLETED)
**Status**: ✅ Complete  
**Commit**: dda2473

**Files Created:**
- `src/app/api/dupa-templates/route.ts` (188 lines)
- `src/app/api/dupa-templates/[id]/route.ts` (170 lines)
- `src/app/api/dupa-templates/[id]/instantiate/route.ts` (216 lines)

**Features Implemented:**
- ✅ GET list with filtering (search, category, isActive)
- ✅ POST create single/bulk templates
- ✅ GET single template by ID
- ✅ PATCH update template
- ✅ DELETE template
- ✅ POST instantiate - Convert template to RateItem with location-specific rates
- ✅ Zod validation for all fields
- ✅ Duplicate pay item number detection
- ✅ Location-based rate application
- ✅ Historical price support (effectiveDate)
- ✅ Minor Tools automatic calculation (10% of labor)

**API Endpoints:**
```
GET    /api/dupa-templates                     # List all templates
GET    /api/dupa-templates?search=excavation   # Search templates
GET    /api/dupa-templates?category=earthwork  # Filter by category
POST   /api/dupa-templates                     # Create template(s)
GET    /api/dupa-templates/:id                 # Get single template
PATCH  /api/dupa-templates/:id                 # Update template
DELETE /api/dupa-templates/:id                 # Delete template
POST   /api/dupa-templates/:id/instantiate     # Instantiate with rates
```

---

### 🚧 Task 2: DUPA Templates UI (IN PROGRESS)
**Priority**: High  
**Estimated**: 400-500 lines

**Required Pages:**
- `/dupa-templates` - List view with search and filters
- `/dupa-templates/new` - Create new template form
- `/dupa-templates/[id]` - View template details
- `/dupa-templates/[id]/edit` - Edit template form

**UI Features Needed:**
- Template list data table
- Search by pay item number/description
- Category filter dropdown
- Active/inactive status toggle
- Create template modal/form with:
  - Basic info (pay item number, description, unit, output/hour)
  - Labor template entries (designation, persons, hours)
  - Equipment template entries (equipment select, units, hours)
  - Material template entries (material select, quantity, unit)
  - Add-on percentages (OCM, CP, VAT)
  - Category, specification, notes
- Edit template (pre-filled form)
- Delete confirmation
- Instantiate button (opens modal for location selection)
- Copy template feature

---

### Task 3: Projects CRUD API
**Priority**: High  
**Estimated**: 300-400 lines

**Required Endpoints:**
```
GET    /api/projects                    # List all projects
POST   /api/projects                    # Create project
GET    /api/projects/:id                # Get single project
PATCH  /api/projects/:id                # Update project
DELETE /api/projects/:id                # Delete project
GET    /api/projects/:id/estimates      # Get project estimates
POST   /api/projects/:id/estimates      # Create estimate for project
```

**Data Model Features:**
- Project metadata (name, location, contract info)
- Status workflow (draft, ongoing, completed, archived)
- Date tracking (start date, target completion, actual completion)
- Budget tracking
- Nested estimates/BOQ relationship
- Project team members
- Document attachments (future)

---

### Task 4: Projects UI
**Priority**: High  
**Estimated**: 600-700 lines

**Required Pages:**
- `/projects` - List view with filters
- `/projects/new` - Create project form
- `/projects/[id]` - Project dashboard
- `/projects/[id]/edit` - Edit project
- `/projects/[id]/estimates` - Project estimates list
- `/projects/[id]/boq` - Project BOQ summary

**UI Features:**
- Project cards/table view
- Status badges (draft, ongoing, completed)
- Budget vs actual cost visualization
- Timeline view
- Quick actions (add estimate, view BOQ, print report)
- Project details overview
- Nested estimates management

---

### Task 5: Enhance Estimate Pages
**Priority**: Medium  
**Estimated**: 200-300 lines of improvements

**Enhancements Needed:**
- Update `/estimate/new` to use new master data APIs
- Improve BOQ import validation
- Add DUPA template selection for BOQ items
- Better error handling and user feedback
- Loading states during calculation
- Progress indicators for large BOQ
- Export BOQ to Excel/CSV
- Print estimate summary

**Integration Points:**
- Connect to `/api/dupa-templates` for pay item selection
- Use `/api/master/labor`, `/api/master/equipment`, `/api/master/materials`
- Fetch project context if estimate belongs to project

---

### Task 6: Add Navigation & Layout
**Priority**: High (User Experience)  
**Estimated**: 150-200 lines

**Components to Create:**
- `src/components/layout/Header.tsx` - Top navigation bar
- `src/components/layout/Sidebar.tsx` - Side menu (optional)
- `src/components/layout/Footer.tsx` - Footer with version info
- `src/app/layout.tsx` - Update root layout

**Navigation Structure:**
```
Home
├── Dashboard
│
Master Data
├── Labor Rates
├── Equipment
├── Materials
└── Material Prices
│
Work Management
├── Projects
├── Estimates
└── DUPA Templates
│
Reports
├── Project Reports
├── Estimate Reports
└── Rate Schedules
│
Settings (Future)
└── User Profile
```

**Features:**
- Active route highlighting
- Breadcrumbs
- User info display
- Quick search (future)
- Notifications (future)

---

### Task 7: Create Material Prices UI
**Priority**: Medium  
**Estimated**: 400-450 lines

**Page**: `/master/materials/prices`

**Features:**
- List all material prices with filters
- Filter by material code
- Filter by location
- Date range filter (from/to)
- Sort by effective date, price
- Create price modal
- Edit price
- Delete price
- Price history view per material (chart/table)
- Bulk import from CSV
- Export to Excel

---

### Task 8: Create Master Data Seed Script
**Priority**: Medium (One-time setup)  
**Estimated**: 300-400 lines

**Script**: `scripts/seed-master-data.ts`

**Data to Seed:**
1. **Labor Rates** - DPWH standard rates by district
   - Manila NCR
   - Region I (Ilocos)
   - Region II (Cagayan Valley)
   - Region III (Central Luzon)
   - etc.

2. **Equipment** - DPWH equipment database
   - Load from REFERENCE/equipmentdatabase.csv
   - Categories: Excavation, Hauling, Compaction, etc.

3. **Materials** - Common construction materials
   - Load from REFERENCE/Materials Database.csv
   - Categories: Cement, Aggregates, Steel, etc.

4. **DUPA Templates** - Standard DPWH pay items
   - 801 series (Clearing & Grubbing)
   - 802 series (Earthwork)
   - 803 series (Embankment)
   - etc.

**Script Features:**
- Read from CSV/JSON files
- Validate data before inserting
- Skip duplicates
- Progress logging
- Error handling
- Rollback on failure

**Usage:**
```bash
npm run seed              # Seed all data
npm run seed:labor        # Seed only labor rates
npm run seed:equipment    # Seed only equipment
npm run seed:materials    # Seed only materials
npm run seed:templates    # Seed only DUPA templates
```

---

### Task 9: Add Report Generation
**Priority**: Medium-Low  
**Estimated**: 500-600 lines

**Required Pages:**
- `/estimate/[id]/reports` - Already exists, enhance it
- `/projects/[id]/reports` - Project summary report
- `/dupa-templates/[id]/print` - Template documentation

**Report Types:**
1. **Estimate Summary Report**
   - BOQ with unit costs
   - Total costs breakdown
   - Add-ons calculation
   - Project info header
   - Print-friendly CSS

2. **Detailed Estimate Report**
   - Full DUPA breakdown per item
   - Labor, equipment, materials details
   - Rate sources (location, date)
   - Calculation formulas shown

3. **Project Summary Report**
   - All estimates in project
   - Budget vs actual
   - Timeline
   - Status summary

4. **DUPA Template Documentation**
   - Template details
   - Labor/equipment/materials lists
   - Typical usage scenarios
   - Sample calculations

**Features:**
- Print-friendly layouts
- Export to PDF (future)
- Export to Excel
- Email report (future)
- Save as draft

---

### Task 10: Create DUPA & Estimate Integration Tests
**Priority**: High (Quality Assurance)  
**Estimated**: 400-500 lines

**Test Files to Create:**
- `src/app/api/dupa-templates/__tests__/dupa-templates.test.ts`
- `src/app/api/dupa-templates/__tests__/instantiate.test.ts`
- `src/app/api/projects/__tests__/projects.test.ts`
- `src/lib/calc/__tests__/estimate-integration.test.ts`

**Test Coverage:**

**DUPA Templates API:**
- ✅ Create template with all fields
- ✅ Create bulk templates
- ✅ Reject duplicate pay item numbers
- ✅ Search and filter templates
- ✅ Update template
- ✅ Delete template
- ✅ Validate labor template entries
- ✅ Validate equipment template entries
- ✅ Validate material template entries

**DUPA Instantiation:**
- ✅ Instantiate template with valid location
- ✅ Fetch correct labor rates
- ✅ Fetch correct equipment rates
- ✅ Fetch correct material prices
- ✅ Apply historical prices (effectiveDate)
- ✅ Calculate Minor Tools correctly (10% of labor)
- ✅ Handle missing rates gracefully
- ✅ Create RateItem with correct structure
- ✅ Apply Submitted vs Evaluated flag

**Estimate Calculation:**
- ✅ Calculate direct costs correctly
- ✅ Apply OCM sequentially
- ✅ Apply CP on OCM subtotal
- ✅ Apply VAT on CP subtotal
- ✅ Verify total unit cost
- ✅ Test with multiple BOQ items
- ✅ Test with large quantities
- ✅ Test rounding behavior

**Projects Workflow:**
- ✅ Create project
- ✅ Add estimate to project
- ✅ Update project status
- ✅ Calculate project totals
- ✅ Handle nested estimates

**Target**: 60+ test cases total

---

## 🎯 Success Criteria

### Week 5-6 Complete When:
- [x] ✅ DUPA Templates API fully functional (COMPLETED)
- [ ] DUPA Templates UI allows creating/editing templates
- [ ] Projects API manages project lifecycle
- [ ] Projects UI provides project dashboard
- [ ] Estimate pages use new master data APIs
- [ ] Navigation menu connects all pages
- [ ] Material prices UI for price history
- [ ] Seed script populates standard data
- [ ] Reports generate print-friendly output
- [ ] Integration tests verify workflows

### Quality Gates:
- All new APIs have Zod validation
- All endpoints have error handling
- TypeScript compilation passes
- No broken imports or references
- Tests achieve 80%+ coverage on new code
- UI is responsive (mobile-friendly)
- Loading states on all async operations

---

## 📊 Progress Tracking

| Task | Status | Lines | Commit | Notes |
|------|--------|-------|--------|-------|
| 1. DUPA Templates API | ✅ Complete | 574 | dda2473 | All CRUD + instantiate |
| 2. DUPA Templates UI | 🚧 In Progress | - | - | Starting next |
| 3. Projects API | ⏳ Pending | - | - | - |
| 4. Projects UI | ⏳ Pending | - | - | - |
| 5. Enhance Estimates | ⏳ Pending | - | - | - |
| 6. Navigation & Layout | ⏳ Pending | - | - | - |
| 7. Material Prices UI | ⏳ Pending | - | - | - |
| 8. Seed Script | ⏳ Pending | - | - | - |
| 9. Report Generation | ⏳ Pending | - | - | - |
| 10. Integration Tests | ⏳ Pending | - | - | - |

**Overall Progress**: 10% (1/10 tasks complete)

---

## 🔄 Development Workflow

1. **API First**: Create API endpoints with validation
2. **Test APIs**: Use integration tests or manual testing
3. **Build UI**: Create React pages consuming APIs
4. **Test UI**: Manual testing, edge cases
5. **Document**: Update README, add comments
6. **Commit**: Clear commit messages
7. **Push**: Push to main branch

---

## 📚 Related Documentation

- [MASTER-DATA-COMPLETION.md](./MASTER-DATA-COMPLETION.md) - Week 3-4 completion
- [WEEK1-2-COMPLETION.md](./WEEK1-2-COMPLETION.md) - Week 1-2 foundation
- [TESTING_ROADMAP.md](./TESTING_ROADMAP.md) - Testing strategy
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

## 🚀 Next Actions

**Immediate (Today):**
1. Create DUPA Templates UI list page
2. Create DUPA Templates create/edit forms
3. Test instantiation workflow end-to-end

**This Week:**
4. Build Projects API
5. Build Projects UI
6. Add navigation layout
7. Create material prices UI

**Next Week:**
8. Enhance estimate pages
9. Build seed script
10. Add report generation
11. Write integration tests

---

**Document Version**: 1.0  
**Last Updated**: December 16, 2025  
**Current Sprint**: Week 5-6  
**Next Milestone**: Full system integration
