# Hauling Cost Option Feature

## Overview
Added a per-material flag to control whether hauling costs should be included in price calculations. This allows selective application of hauling costs based on material type (e.g., raw materials vs. delivered goods).

## Changes Made

### 1. Material Model (`src/models/Material.ts`)
**Added Field:**
- `includeHauling: boolean` - Controls whether hauling cost should be added for this material
- Default value: `true` (for backward compatibility)

**Interface Update:**
```typescript
interface IMaterial {
  materialCode: string;
  materialDescription: string;
  unit: string;
  basePrice: number;
  category?: string;
  includeHauling: boolean;  // NEW
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Schema Update:**
```typescript
includeHauling: {
  type: Boolean,
  default: true, // By default, include hauling cost
}
```

### 2. Materials Management UI (`src/app/master/materials/page.tsx`)

**Interface Update:**
- Added `includeHauling: boolean` to Material interface

**Form State Update:**
- Added `includeHauling: true` to formData initial state
- Updated `handleEdit()` to include includeHauling from material
- Updated `resetForm()` to set includeHauling to true

**Form UI Changes:**
Added checkbox in the form:
```tsx
<label className="flex items-center">
  <input
    type="checkbox"
    checked={formData.includeHauling}
    onChange={(e) => setFormData({ ...formData, includeHauling: e.target.checked })}
    className="mr-2"
  />
  <span className="text-sm font-medium text-gray-700">Include Hauling Cost</span>
</label>
```

**Table Display:**
Added "Hauling" column showing:
- `✓ Yes` (blue badge) - when includeHauling is true
- `✗ No` (gray badge) - when includeHauling is false

### 3. DUPA Instantiate Route (`src/app/api/dupa-templates/[id]/instantiate/route.ts`)

**Import Added:**
```typescript
import Material from '@/models/Material';
```

**Material Pricing Logic Update:**
Before adding hauling cost, the route now:
1. Fetches the Material document to check the `includeHauling` flag
2. Only adds hauling cost if `includeHauling !== false` (defaults to true if not set)
3. Logs whether hauling was included or excluded

**Code:**
```typescript
// Fetch the material to check if hauling should be included
const materialDoc: any = await Material.findOne({ 
  materialCode: material.materialCode 
}).lean();

const price: any = await MaterialPrice.findOne(priceQuery)
  .sort({ effectiveDate: -1 })
  .lean();

if (price) {
  unitCost = price.unitCost;
  
  // Only add hauling cost if the material has includeHauling flag set to true
  const includeHauling = materialDoc?.includeHauling !== false; // Default to true if not set
  if (includeHauling) {
    unitCost += haulingCostPerCuM;
    console.log(`Material ${material.materialCode}: Base price ₱${price.unitCost.toFixed(2)}, Hauling ₱${haulingCostPerCuM.toFixed(2)}, Total ₱${unitCost.toFixed(2)}`);
  } else {
    console.log(`Material ${material.materialCode}: Base price ₱${price.unitCost.toFixed(2)}, Hauling EXCLUDED (material setting), Total ₱${unitCost.toFixed(2)}`);
  }
}
```

### 4. API Validation Schemas

**POST/PATCH Validation (`src/app/api/master/materials/route.ts`):**
```typescript
const MaterialSchema = z.object({
  materialCode: z.string().min(1, 'Material code is required').toUpperCase(),
  materialDescription: z.string().min(1, 'Material description is required'),
  unit: z.string().min(1, 'Unit is required').toUpperCase(),
  basePrice: z.number().min(0, 'Base price must be non-negative'),
  category: z.string().optional(),
  includeHauling: z.boolean().optional().default(true),  // NEW
  isActive: z.boolean().optional().default(true),
});
```

**PATCH Validation (`src/app/api/master/materials/[id]/route.ts`):**
```typescript
const UpdateMaterialSchema = z.object({
  materialCode: z.string().min(1, 'Material code is required').toUpperCase().optional(),
  materialDescription: z.string().min(1, 'Material description is required').optional(),
  unit: z.string().min(1, 'Unit is required').toUpperCase().optional(),
  basePrice: z.number().min(0, 'Base price must be non-negative').optional(),
  category: z.string().optional(),
  includeHauling: z.boolean().optional(),  // NEW
  isActive: z.boolean().optional(),
});
```

## Usage Guidelines

### When to Set `includeHauling = true`:
- **Raw Materials from Quarries/Sources:**
  - Sand & Gravel
  - Common Borrow
  - Crushed Stone/Aggregates
  - Soil materials

### When to Set `includeHauling = false`:
- **Delivered/Manufactured Items:**
  - Diesel, Gasoline (delivered to site)
  - Cement (factory price includes delivery)
  - Steel reinforcement bars (supplier delivers)
  - Hardware items (retail includes delivery)
  - Pre-mixed concrete (delivered by mixer truck)

## Backward Compatibility

- **Default Value:** `includeHauling = true`
- **Existing Materials:** Will automatically have hauling applied (default behavior)
- **Migration:** No database migration needed - existing materials without this field will default to `true`
- **API Compatibility:** Old clients that don't send this field will get the default value

## Testing Recommendations

1. **Create Test Materials:**
   - Create a material with `includeHauling = true` (e.g., Sand)
   - Create a material with `includeHauling = false` (e.g., Diesel)

2. **Test BOQ Generation:**
   - Create a DUPA template with both materials
   - Instantiate to a project with hauling distance configured
   - Verify that:
     - Sand shows: Base Price + Hauling Cost
     - Diesel shows: Base Price only
     - Console logs show correct hauling inclusion/exclusion

3. **Test UI:**
   - Verify checkbox appears in material form
   - Verify "Hauling" column displays in materials table
   - Test editing existing materials

## Console Log Output

When instantiating a DUPA template, you'll see logs like:

```
Instantiating materials with hauling cost per cu.m.: ₱25.50
Material SAND001: Base price ₱450.00, Hauling ₱25.50, Total ₱475.50
Material DIESEL01: Base price ₱65.00, Hauling EXCLUDED (material setting), Total ₱65.00
Material GRAVEL01: Base price ₱520.00, Hauling ₱25.50, Total ₱545.50
```

## Files Modified

1. `src/models/Material.ts` - Schema update
2. `src/app/master/materials/page.tsx` - UI update
3. `src/app/api/dupa-templates/[id]/instantiate/route.ts` - Pricing logic
4. `src/app/api/master/materials/route.ts` - Validation schema
5. `src/app/api/master/materials/[id]/route.ts` - Validation schema

## Status

✅ All changes implemented
✅ No compilation errors
✅ Backward compatible
✅ Ready for testing
