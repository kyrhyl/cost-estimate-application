# System Architecture

## Overview
DPWH Cost Estimation System - A Next.js application for construction cost estimation following DPWH standards.

## Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Database**: MongoDB with Mongoose ODM
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: TBD

## System Design Principles

### 1. Separation of Concerns
- **Pages**: UI and routing only
- **Components**: Reusable UI elements
- **API Routes**: HTTP handlers, thin layer
- **Services**: Business logic orchestration
- **Calc**: Pure calculation functions
- **Models**: Data schemas and validation

### 2. Data Flow
```
User Action → Page Component → API Route → Service Layer → Calc/Models → Database
                                                ↓
                                    Database ← Models ← Service
                                                ↓
                                    API Route ← Service
                                                ↓
                                    Component ← API Response
```

### 3. Calculation Architecture
All calculations follow DPWH excel formulas exactly, broken into:
- `lib/calc/labor.ts` - Labor costs
- `lib/calc/equipment.ts` - Equipment costs
- `lib/calc/materials.ts` - Material costs
- `lib/calc/hauling.ts` - Hauling costs
- `lib/calc/dupa.ts` - DUPA aggregation
- `lib/calc/estimate.ts` - Full estimate calculation

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── projects/          # Project management
│   ├── master-data/       # Admin configuration
│   └── api/               # HTTP endpoints
│
├── components/            # React components
│   ├── layout/           # Page structure
│   ├── boq/              # Bill of quantities
│   ├── dupa/             # Detailed unit price analysis
│   ├── print/            # Print layouts
│   └── ui/               # Reusable widgets
│
├── lib/                  # Business logic
│   ├── db/              # Database connection
│   ├── calc/            # Calculation engine
│   ├── services/        # Orchestration
│   └── utils/           # Helpers
│
└── models/              # Mongoose schemas
```

## Key Workflows

### Estimate Creation Flow
1. User creates Project
2. User creates Estimate under Project
3. User enters BOQ (Bill of Quantities)
4. For each BOQ item, user creates/selects DUPA Template
5. System instantiates DUPA with current rates
6. User adjusts quantities/rates if needed
7. System calculates totals
8. User generates reports (POW-01, POW-01A, etc.)

### DUPA Instantiation
```typescript
// Service orchestrates the process
instantiateDupa(templateId, boqItemId, estimateId)
  ↓
// Fetch template and current rates
template = await DupaTemplate.findById(templateId)
rates = await getCurrentRates(estimateId.date)
  ↓
// Apply rates to template quantities
laborCosts = calcLabor(template.labor, rates.labor)
equipmentCosts = calcEquipment(template.equipment, rates.equipment)
materialCosts = calcMaterials(template.materials, rates.materials)
  ↓
// Create ProjectDupa instance
projectDupa = new ProjectDupa({
  estimate: estimateId,
  boqItem: boqItemId,
  ...calculatedCosts
})
```

## Database Schema Relationships

```
Project
  ↓ hasMany
Estimate
  ↓ hasMany
BoqLine (Pay Items with quantities)
  ↓ hasOne
ProjectDupa (Instantiated DUPA)
  ↓ references
DupaTemplate (Master template)

Master Data (shared across all estimates):
- LaborRate
- EquipmentRate
- MaterialPrice
- HaulingRate
```

## API Design

### RESTful Conventions
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Nested Resources
- `POST /api/boq` - Create BOQ line (with estimateId in body)
- `POST /api/dupa/instantiate` - Create project DUPA from template
- `PATCH /api/dupa/[dupaId]` - Update DUPA values

## State Management
- **Server State**: Database (MongoDB)
- **Client State**: React hooks (useState, useEffect)
- **Form State**: Controlled components
- **URL State**: Next.js routing params

No global state management library needed initially.

## Print System
- Print components in `components/print/`
- Print-specific CSS in `styles/print/`
- Print routes: `/projects/[projectId]/estimates/[estimateId]/print/*`
- Use `@media print` for print styling
- Generate PDFs via browser print dialog

## Performance Considerations
- Server-side rendering for initial page loads
- Client-side navigation for subsequent pages
- Database indexes on frequently queried fields
- Calculation caching where appropriate
- Lazy loading for large datasets

## Security
- All API routes validate input
- Database queries use parameterized inputs (Mongoose)
- Authentication TBD (NextAuth.js recommended)
- Role-based access control for master data

## Error Handling
- API routes return proper HTTP status codes
- Client-side error boundaries for React errors
- Toast notifications for user-facing errors
- Logging for debugging (console in dev, service in prod)

---

*Last Updated: December 16, 2025*
