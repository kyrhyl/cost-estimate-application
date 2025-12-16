# Testing & Data Integrity Roadmap

**Project:** DPWH Cost Estimation System  
**Created:** December 16, 2025  
**Status:** In Progress

---

## 🎯 Testing Strategy Overview

### Multi-Layer Defense
Our testing approach uses multiple layers to ensure calculation accuracy and data integrity:

1. **TypeScript** - Compile-time type safety
2. **Zod** - Runtime input validation at API boundaries
3. **Vitest** - Unit & integration tests for business logic
4. **Mongoose** - Database-level constraints
5. **GitHub Actions** - Automated CI/CD testing

---

## 📋 Implementation Phases

### ✅ Phase 1: Foundation (COMPLETED)
**Timeframe:** Week 1  
**Status:** ✅ Done

- [x] Install Vitest and testing libraries
- [x] Create `vitest.config.ts` configuration
- [x] Set up test scripts in `package.json`
- [x] Create test setup file (`src/test/setup.ts`)
- [x] Create Zod validation schemas (`src/lib/validation/schemas.ts`)
- [x] Write calculation unit tests (`src/lib/calc/__tests__/estimate.test.ts`)
- [x] Update API routes with Zod validation:
  - [x] `/api/estimates/import`
  - [x] `/api/projects`

**Commands:**
```bash
npm run test          # Run tests
npm run test:ui       # Run with UI
npm run test:coverage # Generate coverage report
```

---

### 🚧 Phase 2: Core Calculation Testing (HIGH PRIORITY)
**Timeframe:** Week 1-2  
**Status:** In Progress

#### A. Labor Calculations
- [x] Basic labor cost computation
- [x] Multiple labor entries
- [x] Edge cases (zero values, empty arrays)
- [ ] Test against actual DPWH examples
- [ ] Verify rounding behavior

#### B. Equipment Calculations
- [x] Standard equipment cost
- [x] Minor Tools (10% of labor)
- [x] Mixed equipment types
- [ ] Test with real equipment database entries
- [ ] Verify hourly rate calculations

#### C. Material Calculations
- [x] Single material cost
- [x] Multiple materials
- [x] Fractional quantities
- [ ] Test with actual material prices
- [ ] Verify unit conversions

#### D. DPWH Add-on Formula (CRITICAL)
- [x] Sequential add-ons (OCM → CP → VAT)
- [x] Submitted vs Evaluated costs
- [x] Zero percentage handling
- [ ] Test against official DPWH examples
- [ ] Verify with 10+ real projects

**Files to Test:**
```
src/lib/calc/
├── labor.ts           # Labor cost functions
├── equipment.ts       # Equipment cost functions  
├── materials.ts       # Material cost functions
├── hauling.ts         # Hauling cost functions
├── dupa.ts           # DUPA aggregation
└── estimate.ts       # Full estimate calculation
```

---

### Phase 3: Service Layer Testing
**Timeframe:** Week 2-3  
**Status:** Not Started

#### A. DUPA Instantiation
```typescript
// Test file: src/lib/services/__tests__/instantiateDupa.test.ts
- [ ] Template + current rates → Project DUPA
- [ ] Missing rate data handling
- [ ] Rate effective dates
- [ ] Quantity overrides
- [ ] Cost recalculation on rate change
```

#### B. Estimate Recalculation
```typescript
// Test file: src/lib/services/__tests__/recalcEstimate.test.ts
- [ ] Recalculate when BOQ quantity changes
- [ ] Recalculate when rates change
- [ ] Maintain audit trail
- [ ] Validate totals match line items
```

#### C. Validation Services
```typescript
// Test file: src/lib/services/__tests__/validation.test.ts
- [ ] BOQ import validation
- [ ] Cross-field validation
- [ ] Business rule validation
```

---

### Phase 4: API Integration Testing
**Timeframe:** Week 3-4  
**Status:** Not Started

#### A. Estimate Endpoints
```typescript
// Test: src/app/api/estimates/__tests__/
- [ ] POST /api/estimates/import - Valid BOQ
- [ ] POST /api/estimates/import - Invalid data (Zod catches)
- [ ] GET /api/estimates - List all
- [ ] GET /api/estimates/[id] - Get specific
- [ ] DELETE /api/estimates/[id] - Delete
```

#### B. Project Endpoints
```typescript
// Test: src/app/api/projects/__tests__/
- [ ] POST /api/projects - Create with validation
- [ ] GET /api/projects - List
- [ ] PATCH /api/projects/[id] - Update
- [ ] Project status workflow validation
```

#### C. DUPA Endpoints
```typescript
// Test: src/app/api/dupa/__tests__/
- [ ] POST /api/dupa/instantiate
- [ ] PATCH /api/dupa/[id] - Update values
- [ ] Recalculation on update
```

#### D. Master Data Endpoints
```typescript
// Test: src/app/api/master/__tests__/
- [ ] CRUD operations for rates
- [ ] Effective date handling
- [ ] Historical rate preservation
```

---

### Phase 5: Data Integrity & Validation
**Timeframe:** Week 4-5  
**Status:** Not Started

#### A. Zod Schema Enhancement
- [ ] Add all remaining endpoints
- [ ] Custom validators for business rules
- [ ] Cross-field validation (dates, quantities)
- [ ] Error message improvements

#### B. Mongoose Schema Validation
```typescript
// Enhance models with:
- [ ] Required fields
- [ ] Min/max constraints
- [ ] Enum validations
- [ ] Custom validators
- [ ] Pre-save hooks for integrity checks
- [ ] Unique indexes
```

#### C. Database Integrity Tests
- [ ] Referential integrity (foreign keys)
- [ ] Cascade delete behavior
- [ ] Orphaned record prevention
- [ ] Transaction rollback scenarios

---

### Phase 6: E2E Testing (Optional, Future)
**Timeframe:** Week 6+  
**Status:** Planned

Using **Playwright** for full user workflows:
```typescript
- [ ] Create project → Add estimate → Enter BOQ → Print
- [ ] Create DUPA template → Instantiate → Modify → Save
- [ ] Import CSV → Validate → Process → Review
- [ ] Master data management workflow
```

---

## 🎯 Testing Priorities

### 🔥 Critical (Do First)
1. **Calculation Accuracy** - Must match DPWH formulas exactly
2. **Input Validation** - Prevent bad data from entering system
3. **API Endpoint Testing** - Ensure contracts are stable

### ⚠️ High Priority
4. **Service Layer Logic** - Business rules correctness
5. **Database Integrity** - No orphaned/corrupted data
6. **Error Handling** - Graceful failure scenarios

### 📋 Medium Priority
7. **Edge Cases** - Null values, boundaries, special characters
8. **Performance Tests** - Large BOQ handling
9. **Concurrency** - Multiple users editing

### 💡 Low Priority (Later)
10. **UI Component Testing** - React component tests
11. **E2E Workflows** - Full user journeys
12. **Load Testing** - System under stress

---

## 🚀 Continuous Integration Setup

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test & Lint

on: [push, pull_request]

jobs:
  test:
    - Install dependencies
    - Run TypeScript type check
    - Run linter
    - Run unit tests
    - Run integration tests
    - Upload coverage report
```

**Status:** Pending (Phase 5 task)

---

## 📊 Coverage Goals

### Target Coverage
- **Calculations (`lib/calc/`)**: 95%+ (CRITICAL)
- **Services (`lib/services/`)**: 85%+
- **API Routes (`app/api/`)**: 80%+
- **Models (`models/`)**: 70%+
- **Overall Project**: 75%+

### Current Coverage
Run `npm run test:coverage` to see current metrics.

---

## 🛠️ Tools & Libraries

| Tool | Purpose | Status |
|------|---------|--------|
| **Vitest** | Unit & integration testing | ✅ Installed |
| **@testing-library/react** | React component testing | ✅ Installed |
| **@testing-library/jest-dom** | DOM assertions | ✅ Installed |
| **happy-dom** | Lightweight DOM for tests | ✅ Installed |
| **Zod** | Runtime validation | ✅ Installed & Configured |
| **@vitest/coverage-v8** | Code coverage | ✅ Installed |
| **Playwright** | E2E testing | 🔜 Future |
| **MongoDB Memory Server** | In-memory DB for tests | 🔜 Needed |

---

## 📝 Testing Best Practices

### 1. Test Naming Convention
```typescript
describe('Feature or Module', () => {
  it('should do something specific when condition', () => {
    // Arrange
    // Act
    // Assert
  })
})
```

### 2. Test Organization
```
src/
├── lib/
│   ├── calc/
│   │   ├── labor.ts
│   │   └── __tests__/
│   │       └── labor.test.ts
│   └── services/
│       ├── instantiateDupa.ts
│       └── __tests__/
│           └── instantiateDupa.test.ts
```

### 3. Mock External Dependencies
- Mock database calls in unit tests
- Use real DB in integration tests (memory server)
- Mock 3rd party APIs

### 4. Data Fixtures
```typescript
// src/test/fixtures/
export const sampleDupaTemplate = { ... }
export const sampleBoqData = { ... }
export const sampleRates = { ... }
```

---

## 🎓 Team Training Needs

- [ ] Introduction to Vitest
- [ ] Writing effective unit tests
- [ ] Zod validation patterns
- [ ] Integration testing strategies
- [ ] CI/CD workflow understanding

---

## 📈 Success Metrics

### Code Quality
- ✅ All tests pass before merge
- ✅ No TypeScript errors
- ✅ ESLint warnings addressed
- ✅ Test coverage meets targets

### Business Impact
- 🎯 Zero calculation discrepancies vs DPWH formulas
- 🎯 < 1% bug reports related to invalid data
- 🎯 95%+ of edge cases caught before production
- 🎯 Faster development (confidence to refactor)

---

## 🔄 Maintenance & Updates

### Regular Tasks
- Run full test suite before each release
- Update tests when formulas change
- Review and improve test coverage quarterly
- Keep dependencies updated

### When to Add Tests
- ✅ Before fixing a bug (reproduce it first)
- ✅ When adding new features
- ✅ When refactoring critical code
- ✅ When user reports calculation issues

---

## 📚 Resources

### Documentation
- [Vitest Docs](https://vitest.dev/)
- [Zod Documentation](https://zod.dev/)
- [Testing Library](https://testing-library.com/)

### Internal Docs
- [docs/ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [FORMULAS.md](../FORMULAS.md) - DPWH calculation reference
- [docs/MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) - Migration tasks

---

*Last Updated: December 16, 2025*
