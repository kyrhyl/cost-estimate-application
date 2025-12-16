# DPWH Cost Estimation System

A comprehensive Next.js application for DPWH Unit Price Analysis (UPA) and Bill of Quantities (BOQ) estimation.

## ⚠️ RESTRUCTURING NOTICE (December 16, 2025)

**This project has been reorganized!** All legacy code has been moved to `src/_legacy/`. 

👉 **Read [docs/RESTRUCTURING_NOTES.md](./docs/RESTRUCTURING_NOTES.md) before continuing development.**

## Features

- **Rate Item (UPA) Management**: Create and manage detailed unit price analysis with:
  - Labor entries (designation, persons, hours, hourly rate)
  - Equipment entries (name/capacity, units, hours, hourly rate)
  - Material entries (name/specification, unit, quantity, unit cost)
  - Add-on percentages (OCM, CP, VAT) for both Submitted and Evaluated costs

- **BOQ Import & Estimation**: 
  - Import BOQ data in JSON format
  - Automatic pricing using stored rate items
  - Complete cost breakdown with add-ons
  - Support for both "As Submitted" and "As Evaluated" pricing

- **Pricing Engine**: Accurate cost computation following DPWH UPA formulas:
  - Direct costs (Labor + Equipment + Material)
  - Sequential add-ons: OCM → CP → VAT
  - Detailed breakdowns per line item

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod schemas

## New Project Structure (Post-Restructuring)

```
src/
├── app/                          # Next.js App Router
│   ├── projects/                 # Project management
│   │   └── [projectId]/
│   │       └── estimates/        # Nested estimates
│   ├── master-data/              # Admin data management
│   └── api/                      # API endpoints
├── components/                   # React components
│   ├── boq/, dupa/, print/, ui/
├── lib/                          # Business logic
│   ├── db/                       # Database (mongodb.ts → connect.ts)
│   ├── calc/                     # Calculations (pricing-engine.ts → estimate.ts)
│   ├── services/                 # Orchestration
│   └── utils/                    # Helpers
├── models/                       # Mongoose schemas
└── _legacy/                      # ⚠️ Old code - DO NOT USE
├── .env.local                   # Environment variables
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure MongoDB

Edit `.env.local` with your MongoDB connection string:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/upa-estimating

# Or MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/upa-estimating?retryWrites=true&w=majority
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## API Endpoints

### Rate Items (UPA)

- `GET /api/rates` - List all rate items (with optional search)
- `POST /api/rates` - Create new rate item
- `GET /api/rates/:id` - Get specific rate item
- `PUT /api/rates/:id` - Update rate item
- `DELETE /api/rates/:id` - Delete rate item

### Estimates

- `GET /api/estimates` - List all estimates
- `POST /api/estimates/import` - Import BOQ and compute estimate
- `GET /api/estimates/:id` - Get specific estimate
- `DELETE /api/estimates/:id` - Delete estimate

## BOQ JSON Format

```json
{
  "projectName": "Project name here",
  "projectLocation": "Location here",
  "implementingOffice": "Office name here",
  "boqLines": [
    {
      "itemNo": "1.01",
      "description": "Work description",
      "unit": "l.s.",
      "quantity": 1.0,
      "payItemNumber": "801 (1)"
    }
  ]
}
```

## Pricing Formula (from UPA Screenshot)

Based on the DPWH UPA format:

1. **Direct Cost** = Labor + Equipment + Material
2. **+ OCM** (Overhead, Contingencies & Misc) = Direct Cost × OCM%
3. **Subtotal after OCM** = Direct Cost + OCM
4. **+ CP** (Contractor's Profit) = Subtotal × CP%
5. **Subtotal after CP** = Subtotal + CP
6. **+ VAT** (Value Added Tax) = Subtotal × VAT%
7. **Total Unit Cost** = Subtotal + VAT

Default percentages (from screenshot):
- OCM (Evaluated): 15%
- CP (Submitted): 10%
- VAT (Submitted): 12%

## Key Assumptions

1. **Minor Tools**: Equipment entries with "Minor Tools" in the name are calculated as 10% of labor cost
2. **Sequential Add-ons**: OCM, CP, and VAT are applied sequentially (not on original direct cost)
3. **Per-Unit Rates**: All computed costs are per unit of measurement; multiplied by quantity for totals
4. **Submitted vs Evaluated**: System supports both cost types; labor/equipment/material arrays are separate

## Pages

- `/` - Home page with overview
- `/rates` - List all rate items
- `/rates/new` - Create new rate item (UPA editor)
- `/rates/:id` - View rate item details
- `/rates/:id/edit` - Edit rate item
- `/estimate/new` - Import BOQ and create estimate
- `/estimate/:id` - View estimate with detailed breakdowns

## 📚 Documentation

**Essential Reading:**
- 📘 [RESTRUCTURING_NOTES.md](./docs/RESTRUCTURING_NOTES.md) - What changed, import path updates
- 📋 [MIGRATION_CHECKLIST.md](./docs/MIGRATION_CHECKLIST.md) - Migration tasks and progress
- 🏗️ [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design and data flow

**Reference:**
- [QUICKSTART.md](./QUICKSTART.md) - Getting started
- [FORMULAS.md](./FORMULAS.md) - Calculation formulas
- [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md) - Project overview

## Development Notes

- The app uses Next.js App Router with React Server Components where appropriate
- Client components are marked with `'use client'` directive
- MongoDB connection is cached to prevent connection pool exhaustion
- **⚠️ Import from `@/lib/db/connect`, NOT `@/lib/mongodb`**
- **⚠️ Do NOT import anything from `src/_legacy/`**

---

*Last Updated: December 16, 2025*

## License

Internal DPWH use
