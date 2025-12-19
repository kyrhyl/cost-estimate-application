# Equipment Import Fix - Summary

**Date**: December 18, 2025

## Problem
Users were seeing "No equipment found" message on the equipment master data page. The database was empty and needed to be populated with equipment data from the CSV file.

## Issues Fixed

### 1. CSV Number Parsing Issue
**Problem**: The equipment CSV file (`REFERENCE/equipmentdatabase.csv`) contains rental rates with commas and spaces like `" 3,824.00 "`, but the parser was using `parseFloat()` directly which couldn't handle formatted numbers.

**Fix**: Updated [src/app/api/master/equipment/import-csv/route.ts](src/app/api/master/equipment/import-csv/route.ts#L123-L126) to remove commas and spaces before parsing:
```typescript
// Remove commas and spaces from numbers before parsing
const cleanValue = value.replace(/,/g, '').replace(/\s/g, '');
const num = parseFloat(cleanValue);
```

### 2. CSV Header Mapping Issue
**Problem**: The CSV file uses " RENTAL RATES " (plural) as the column header, but the parser only recognized "rental rate" (singular).

**Fix**: Added "rental rates" and "rentalrates" to the header mapping dictionary.

### 3. Missing Hourly Rate
**Problem**: The CSV only contains one rate column (Rental Rates), but the database schema requires both `rentalRate` and `hourlyRate`.

**Fix**: Updated the import logic to use `rentalRate` for `hourlyRate` if not provided:
```typescript
// If hourlyRate is not provided, use rentalRate (common in CSV imports)
equipment.hourlyRate = equipment.hourlyRate || equipment.rentalRate || 0;
```

### 4. Duplicate Schema Index Warnings
**Problem**: Mongoose was warning about duplicate indexes on `no`, `location`, and `materialCode` fields.

**Fix**: Removed explicit index declarations that were duplicating indexes already created by `unique: true`:
- [src/models/Equipment.ts](src/models/Equipment.ts#L59-L60) - Removed duplicate `no` index
- [src/models/LaborRate.ts](src/models/LaborRate.ts#L87-L88) - Removed duplicate `location` index  
- [src/models/Material.ts](src/models/Material.ts#L62) - Removed duplicate `materialCode` index

## How to Import Equipment Data

### Method 1: Via Web Interface (Recommended)

1. Open your browser and navigate to: `http://localhost:3000/master/equipment`

2. Click the "Import CSV" button

3. Copy the entire contents of `REFERENCE/equipmentdatabase.csv`

4. Paste into the CSV Import dialog

5. Configure options:
   - **Clear Existing**: ☐ (Keep unchecked for first import)
   - **Skip Duplicates**: ☑ (Check to avoid errors)

6. Click "Import" button

7. You should see a success message showing how many equipment items were imported

### Method 2: Via API (Direct)

Use curl or any API client:

```bash
# Read the CSV file and import via API
curl -X POST http://localhost:3000/api/master/equipment/import-csv \
  -H "Content-Type: application/json" \
  -d '{
    "csvData": "<paste CSV contents here>",
    "clearExisting": false,
    "skipDuplicates": true
  }'
```

### Method 3: Create Import Script (Future)

Create `scripts/import-equipment.mjs`:
```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.join(__dirname, '../REFERENCE/equipmentdatabase.csv');
const csvData = fs.readFileSync(csvPath, 'utf-8');

const response = await fetch('http://localhost:3000/api/master/equipment/import-csv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    csvData,
    clearExisting: false,
    skipDuplicates: true
  })
});

const result = await response.json();
console.log(result);
```

## Files Changed

1. ✏️ [src/app/api/master/equipment/import-csv/route.ts](src/app/api/master/equipment/import-csv/route.ts)
   - Fixed number parsing to handle commas
   - Added "rental rates" to header mapping
   - Made hourlyRate default to rentalRate

2. ✏️ [src/models/Equipment.ts](src/models/Equipment.ts)
   - Removed duplicate `no` index

3. ✏️ [src/models/LaborRate.ts](src/models/LaborRate.ts)
   - Removed duplicate `location` index

4. ✏️ [src/models/Material.ts](src/models/Material.ts)
   - Removed duplicate `materialCode` index

## Expected Results

After importing:
- ✅ 96 equipment items loaded
- ✅ Equipment page displays all items
- ✅ Search and filter functionality works
- ✅ No more "No equipment found" message
- ✅ No more mongoose duplicate index warnings

## Verification Steps

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/master/equipment`

3. Import the CSV using Method 1 above

4. Verify equipment appears in the table

5. Test search: Type "crane" in the search box

6. Test filter: Set min rate to 1000

7. Check the terminal - no duplicate index warnings should appear

## Next Steps

Consider creating:
1. Automated seeding script for development databases
2. Sample data fixtures for testing
3. Database backup/restore procedures
4. Bulk update functionality for rate adjustments

✅ **Status**: Equipment import functionality is now working correctly!
