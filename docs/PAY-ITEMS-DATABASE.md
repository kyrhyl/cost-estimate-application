# DPWH Pay Items Database

## Overview

The Pay Items database contains all standard DPWH (Department of Public Works and Highways) pay items based on DPWH Standard Specifications. These items are organized hierarchically by Division, Part, and Item, with unique pay item numbers.

## Database Structure

### PayItem Model

Located at: [src/models/PayItem.ts](../src/models/PayItem.ts)

```typescript
{
  division: string;        // e.g., "DIVISION I - GENERAL"
  part: string;            // e.g., "PART C"
  item: string;            // e.g., "ITEM 800 - CLEARING AND GRUBBING"
  payItemNumber: string;   // e.g., "800 (1)", "800 (3)a1" (unique)
  description: string;     // Full description of the pay item
  unit: string;           // e.g., "Square Meter", "Each", "Lump Sum"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### GET /api/master/pay-items
List all pay items with filtering and pagination

**Query Parameters:**
- `search` - Search in payItemNumber or description (partial match)
- `division` - Filter by division (partial match)
- `part` - Filter by part (partial match)
- `item` - Filter by item (partial match)
- `unit` - Filter by unit (exact match)
- `active` - Filter by active status (true/false)
- `sortBy` - Field to sort by (default: payItemNumber)
- `order` - Sort order 'asc' or 'desc' (default: asc)
- `limit` - Maximum number of results (default: 1000)
- `page` - Page number for pagination (default: 1)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 1392,
    "page": 1,
    "limit": 50,
    "pages": 28
  }
}
```

### POST /api/master/pay-items
Create new pay item(s) - supports single item or bulk import

**Single Item Body:**
```json
{
  "division": "DIVISION I - GENERAL",
  "part": "PART C",
  "item": "ITEM 800 - CLEARING AND GRUBBING",
  "payItemNumber": "800 (1)",
  "description": "Clearing and Grubbing",
  "unit": "Square Meter",
  "isActive": true
}
```

**Bulk Import Body:** Array of pay item objects

**Response (Bulk):**
```json
{
  "success": true,
  "message": "Imported 1392 pay items",
  "summary": {
    "total": 1392,
    "imported": 1392,
    "failed": 0,
    "duplicates": 0
  }
}
```

### GET /api/master/pay-items/[id]
Get a single pay item by ID

### PATCH /api/master/pay-items/[id]
Update a pay item

**Body:** Partial pay item object with fields to update

### DELETE /api/master/pay-items/[id]
Delete a pay item by ID

### DELETE /api/master/pay-items
Bulk delete pay items

**Body:**
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

## UI Management

### Pay Items Page

Located at: [/master/pay-items](http://localhost:3000/master/pay-items)

**Features:**
- Search by pay item number or description
- Filter by division, part, unit, and status
- Pagination (50 items per page)
- Create, edit, and delete pay items
- Toggle active/inactive status
- Responsive table view with full pay item details

## Data Import

### From CSV File

The DPWH pay items can be imported from the CSV file at `REFERENCE/DPWH_PAY_ITEM.csv`.

**Using the seed script:**

```bash
npm run seed:pay-items
```

This script will:
1. Connect to MongoDB
2. Clear existing pay items
3. Read the CSV file
4. Import all pay items in batches
5. Handle duplicates and errors
6. Provide a summary of the import

**Manual import via API:**

You can also use the bulk import API endpoint:

```bash
POST /api/master/pay-items
Content-Type: application/json

[
  {
    "division": "...",
    "part": "...",
    "item": "...",
    "payItemNumber": "...",
    "description": "...",
    "unit": "..."
  },
  ...
]
```

## Database Indexes

The PayItem model has the following indexes for optimized queries:

1. `payItemNumber` - Unique index
2. `division`, `part`, `item` - Single field indexes
3. `isActive` - Index for filtering
4. `{ division: 1, part: 1, item: 1 }` - Compound index for hierarchical queries
5. Text index on `description` and `payItemNumber` for full-text search

## Usage in the Application

Pay items are used throughout the application for:

1. **DUPA Templates** - Each template is associated with a pay item
   - `payItemNumber` field in DUPATemplate model
   - Used to categorize and identify work items

2. **Project BOQ** - Bill of Quantities uses pay items to define work items
   - Pay items determine the unit of measurement
   - Used in quantity calculations and cost estimates

3. **Estimates** - Cost estimates reference pay items
   - Provides standardized descriptions
   - Ensures consistency across projects

## Integration Points

### With DUPA Templates

DUPA templates reference pay items via the `payItemNumber` field:

```typescript
// In DUPATemplate model
{
  payItemNumber: string;    // References PayItem.payItemNumber
  payItemDescription: string;
  unit: string;
}
```

When creating or editing DUPA templates, the UI should provide:
- Dropdown to select from available pay items
- Auto-fill description and unit based on selected pay item
- Validation to ensure pay item exists

### With Estimates

Estimates can leverage pay items for standardization:
- Use pay item descriptions as work item names
- Validate units match pay item specifications
- Link estimates to DPWH standard specifications

## Data Source

The pay items data is based on DPWH Standard Specifications and covers:

- **DIVISION I - GENERAL**: Clearing, grubbing, removals, excavation, embankment
- **DIVISION II - DRAINAGE**: Pipes, culverts, drainage structures
- **DIVISION III - SUBGRADE AND BASE COURSES**: Base courses, subbase
- **DIVISION IV - FLEXIBLE PAVEMENT**: Asphalt, surface treatments
- **DIVISION V - RIGID PAVEMENT**: Concrete pavement, joints
- **DIVISION VI - STRUCTURES**: Bridges, retaining walls, etc.
- And more...

Total: 1,392 standard pay items

## Maintenance

### Adding New Pay Items

1. Via UI: Use the "+ Add New Pay Item" button in the Pay Items page
2. Via API: POST to `/api/master/pay-items`
3. Via CSV: Update `REFERENCE/DPWH_PAY_ITEM.csv` and run seed script

### Updating Pay Items

- Use the "Edit" button in the UI
- Or PATCH `/api/master/pay-items/[id]`
- Ensure `payItemNumber` remains unique if modified

### Deactivating Pay Items

Instead of deleting, consider deactivating:
- Set `isActive: false`
- This preserves historical data
- Inactive items can be filtered out in queries

## Best Practices

1. **Don't Delete Referenced Pay Items**: Check if pay items are referenced in DUPA templates or estimates before deletion
2. **Maintain Unique Pay Item Numbers**: The `payItemNumber` should be unique and follow DPWH standards
3. **Use Standard Units**: Stick to standard units (Square Meter, Cubic Meter, Linear Meter, Each, Lump Sum, etc.)
4. **Regular Backups**: The pay items database is critical - ensure regular backups
5. **Version Control**: When updating DPWH standards, consider versioning the pay items

## Future Enhancements

Potential improvements for the pay items system:

1. **Hierarchical View**: Tree view showing Division > Part > Item structure
2. **CSV Export**: Export pay items back to CSV
3. **Bulk Edit**: Update multiple pay items at once
4. **Version History**: Track changes to pay items over time
5. **Reference Tracking**: Show which DUPA templates use each pay item
6. **Standard Specifications Link**: Link to DPWH spec documents
7. **Unit Price History**: Track typical unit prices for each pay item
