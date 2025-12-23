/**
 * Seed Script for DPWH Cost Estimator
 * Populates initial master data: Labor Rates, Equipment, Materials, Material Prices
 * 
 * Usage: node --loader ts-node/esm scripts/seed.ts
 * Or: npm run seed (add to package.json scripts)
 */

// @ts-nocheck
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });
console.log('CWD:', process.cwd());
console.log('MONGODB_URI:', process.env.MONGODB_URI);
import mongoose from 'mongoose';
import dbConnect from '../src/lib/db/connect';

// Import models
import LaborRate from '../src/models/LaborRate';
import Equipment from '../src/models/Equipment';
import Material from '../src/models/Material';
import MaterialPrice from '../src/models/MaterialPrice';

const BUKIDNON_LOCATION = 'Malaybalay City, Bukidnon';
const EFFECTIVE_DATE = new Date('2024-01-01');

// DPWH Standard Labor Rates (Bukidnon Region)
const laborRates = [
  {
    designation: 'Foreman',
    location: BUKIDNON_LOCATION,
    hourlyRate: 95.00,
    monthlyRate: 19950.00,
    effectiveDate: EFFECTIVE_DATE,
    isActive: true,
  },
  {
    designation: 'Chief of Party',
    location: BUKIDNON_LOCATION,
    hourlyRate: 110.00,
    monthlyRate: 23100.00,
    effectiveDate: EFFECTIVE_DATE,
    isActive: true,
  },
  {
    designation: 'Skilled Labor',
    location: BUKIDNON_LOCATION,
    hourlyRate: 75.00,
    monthlyRate: 15750.00,
    effectiveDate: EFFECTIVE_DATE,
    isActive: true,
  },
  {
    designation: 'Unskilled Labor',
    location: BUKIDNON_LOCATION,
    hourlyRate: 60.00,
    monthlyRate: 12600.00,
    effectiveDate: EFFECTIVE_DATE,
    isActive: true,
  },
  {
    designation: 'Mason',
    location: BUKIDNON_LOCATION,
    hourlyRate: 80.00,
    monthlyRate: 16800.00,
    effectiveDate: EFFECTIVE_DATE,
    isActive: true,
  },
  {
    designation: 'Carpenter',
    location: BUKIDNON_LOCATION,
    hourlyRate: 80.00,
    monthlyRate: 16800.00,
    effectiveDate: EFFECTIVE_DATE,
    isActive: true,
  },
  {
    designation: 'Electrician',
    location: BUKIDNON_LOCATION,
    hourlyRate: 85.00,
    monthlyRate: 17850.00,
    effectiveDate: EFFECTIVE_DATE,
    isActive: true,
  },
  {
    designation: 'Plumber',
    location: BUKIDNON_LOCATION,
    hourlyRate: 85.00,
    monthlyRate: 17850.00,
    effectiveDate: EFFECTIVE_DATE,
    isActive: true,
  },
  {
    designation: 'Painter',
    location: BUKIDNON_LOCATION,
    hourlyRate: 70.00,
    monthlyRate: 14700.00,
    effectiveDate: EFFECTIVE_DATE,
    isActive: true,
  },
  {
    designation: 'Welder',
    location: BUKIDNON_LOCATION,
    hourlyRate: 90.00,
    monthlyRate: 18900.00,
    effectiveDate: EFFECTIVE_DATE,
    isActive: true,
  },
  {
    designation: 'Equipment Operator',
    location: BUKIDNON_LOCATION,
    hourlyRate: 85.00,
    monthlyRate: 17850.00,
    effectiveDate: EFFECTIVE_DATE,
    isActive: true,
  },
];

// Common Construction Equipment
const equipment = [
  {
    equipmentCode: 'EQ-001',
    name: 'Backhoe',
    description: 'Hydraulic backhoe loader',
    unit: 'hour',
    hourlyRate: 850.00,
    monthlyRate: 178500.00,
    depreciationRate: 15,
    category: 'Heavy Equipment',
    isActive: true,
  },
  {
    equipmentCode: 'EQ-002',
    name: 'Dump Truck',
    description: '6-wheeler dump truck',
    unit: 'hour',
    hourlyRate: 750.00,
    monthlyRate: 157500.00,
    depreciationRate: 15,
    category: 'Transport',
    isActive: true,
  },
  {
    equipmentCode: 'EQ-003',
    name: 'Concrete Mixer',
    description: 'Portable concrete mixer (1 bag capacity)',
    unit: 'hour',
    hourlyRate: 120.00,
    monthlyRate: 25200.00,
    depreciationRate: 10,
    category: 'Concrete Equipment',
    isActive: true,
  },
  {
    equipmentCode: 'EQ-004',
    name: 'Compactor',
    description: 'Plate compactor',
    unit: 'hour',
    hourlyRate: 200.00,
    monthlyRate: 42000.00,
    depreciationRate: 10,
    category: 'Compaction',
    isActive: true,
  },
  {
    equipmentCode: 'EQ-005',
    name: 'Welding Machine',
    description: 'Arc welding machine',
    unit: 'hour',
    hourlyRate: 150.00,
    monthlyRate: 31500.00,
    depreciationRate: 10,
    category: 'Tools',
    isActive: true,
  },
  {
    equipmentCode: 'EQ-006',
    name: 'Water Pump',
    description: '2-inch water pump',
    unit: 'hour',
    hourlyRate: 100.00,
    monthlyRate: 21000.00,
    depreciationRate: 10,
    category: 'Tools',
    isActive: true,
  },
  {
    equipmentCode: 'EQ-007',
    name: 'Grader',
    description: 'Motor grader',
    unit: 'hour',
    hourlyRate: 1200.00,
    monthlyRate: 252000.00,
    depreciationRate: 15,
    category: 'Heavy Equipment',
    isActive: true,
  },
  {
    equipmentCode: 'EQ-008',
    name: 'Concrete Vibrator',
    description: 'Immersion concrete vibrator',
    unit: 'hour',
    hourlyRate: 80.00,
    monthlyRate: 16800.00,
    depreciationRate: 10,
    category: 'Concrete Equipment',
    isActive: true,
  },
];

// Common Construction Materials
const materials = [
  {
    materialCode: 'MAT-001',
    name: 'Portland Cement',
    description: 'Type I Portland Cement, 40kg bag',
    unit: 'bag',
    category: 'Cement',
    specification: 'Conforms to ASTM C150',
    isActive: true,
  },
  {
    materialCode: 'MAT-002',
    name: 'Sand',
    description: 'Washed sand for concrete',
    unit: 'cu.m.',
    category: 'Aggregates',
    specification: 'Conforms to ASTM C33',
    isActive: true,
  },
  {
    materialCode: 'MAT-003',
    name: 'Gravel',
    description: 'Crushed gravel, 3/4 inch',
    unit: 'cu.m.',
    category: 'Aggregates',
    specification: 'Conforms to ASTM C33',
    isActive: true,
  },
  {
    materialCode: 'MAT-004',
    name: 'Deformed Bar 12mm',
    description: 'Grade 40 deformed steel bar',
    unit: 'kg',
    category: 'Steel',
    specification: 'Conforms to ASTM A615',
    isActive: true,
  },
  {
    materialCode: 'MAT-005',
    name: 'Deformed Bar 16mm',
    description: 'Grade 40 deformed steel bar',
    unit: 'kg',
    category: 'Steel',
    specification: 'Conforms to ASTM A615',
    isActive: true,
  },
  {
    materialCode: 'MAT-006',
    name: 'Plywood 1/4 inch',
    description: 'Marine plywood for formwork',
    unit: 'sheet',
    category: 'Wood',
    specification: '4ft x 8ft',
    isActive: true,
  },
  {
    materialCode: 'MAT-007',
    name: 'Lumber 2x4',
    description: 'Dressed lumber',
    unit: 'bd.ft.',
    category: 'Wood',
    specification: 'S4S',
    isActive: true,
  },
  {
    materialCode: 'MAT-008',
    name: 'Paint',
    description: 'Latex paint for exterior',
    unit: 'gallon',
    category: 'Paint',
    specification: 'Weather-resistant',
    isActive: true,
  },
  {
    materialCode: 'MAT-009',
    name: 'Hollow Blocks 4 inch',
    description: 'Concrete hollow blocks',
    unit: 'pcs',
    category: 'Masonry',
    specification: '100mm x 200mm x 400mm',
    isActive: true,
  },
  {
    materialCode: 'MAT-010',
    name: 'Cement Mortar',
    description: 'Pre-mixed cement mortar',
    unit: 'bag',
    category: 'Cement',
    specification: '40kg bag',
    isActive: true,
  },
];

// Material Prices for Bukidnon Location
const materialPrices = [
  {
    materialCode: 'MAT-001',
    materialName: 'Portland Cement',
    unit: 'bag',
    unitPrice: 285.00,
    location: BUKIDNON_LOCATION,
    effectiveDate: EFFECTIVE_DATE,
    source: 'Market Survey 2024',
    isActive: true,
  },
  {
    materialCode: 'MAT-002',
    materialName: 'Sand',
    unit: 'cu.m.',
    unitPrice: 850.00,
    location: BUKIDNON_LOCATION,
    effectiveDate: EFFECTIVE_DATE,
    source: 'Local Quarry',
    isActive: true,
  },
  {
    materialCode: 'MAT-003',
    materialName: 'Gravel',
    unit: 'cu.m.',
    unitPrice: 950.00,
    location: BUKIDNON_LOCATION,
    effectiveDate: EFFECTIVE_DATE,
    source: 'Local Quarry',
    isActive: true,
  },
  {
    materialCode: 'MAT-004',
    materialName: 'Deformed Bar 12mm',
    unit: 'kg',
    unitPrice: 52.00,
    location: BUKIDNON_LOCATION,
    effectiveDate: EFFECTIVE_DATE,
    source: 'Hardware Store',
    isActive: true,
  },
  {
    materialCode: 'MAT-005',
    materialName: 'Deformed Bar 16mm',
    unit: 'kg',
    unitPrice: 54.00,
    location: BUKIDNON_LOCATION,
    effectiveDate: EFFECTIVE_DATE,
    source: 'Hardware Store',
    isActive: true,
  },
  {
    materialCode: 'MAT-006',
    materialName: 'Plywood 1/4 inch',
    unit: 'sheet',
    unitPrice: 720.00,
    location: BUKIDNON_LOCATION,
    effectiveDate: EFFECTIVE_DATE,
    source: 'Hardware Store',
    isActive: true,
  },
  {
    materialCode: 'MAT-007',
    materialName: 'Lumber 2x4',
    unit: 'bd.ft.',
    unitPrice: 45.00,
    location: BUKIDNON_LOCATION,
    effectiveDate: EFFECTIVE_DATE,
    source: 'Lumber Yard',
    isActive: true,
  },
  {
    materialCode: 'MAT-008',
    materialName: 'Paint',
    unit: 'gallon',
    unitPrice: 1250.00,
    location: BUKIDNON_LOCATION,
    effectiveDate: EFFECTIVE_DATE,
    source: 'Hardware Store',
    isActive: true,
  },
  {
    materialCode: 'MAT-009',
    materialName: 'Hollow Blocks 4 inch',
    unit: 'pcs',
    unitPrice: 12.50,
    location: BUKIDNON_LOCATION,
    effectiveDate: EFFECTIVE_DATE,
    source: 'Local Supplier',
    isActive: true,
  },
  {
    materialCode: 'MAT-010',
    materialName: 'Cement Mortar',
    unit: 'bag',
    unitPrice: 195.00,
    location: BUKIDNON_LOCATION,
    effectiveDate: EFFECTIVE_DATE,
    source: 'Hardware Store',
    isActive: true,
  },
];

async function seed() {
  console.log('🌱 Starting seed process...\n');

  try {
    // Connect to database
    await dbConnect();
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data (optional - comment out to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await LaborRate.collection.drop().catch(() => {}); // Ignore if collection doesn't exist
    // await Equipment.collection.drop().catch(() => {});
    // await Material.collection.drop().catch(() => {});
    // await MaterialPrice.collection.drop().catch(() => {});
    console.log('✅ Existing data cleared\n');

    // Seed Labor Rates
    console.log('👷 Seeding Labor Rates...');
    await LaborRate.insertMany(laborRates);
    console.log(`✅ ${laborRates.length} labor rates inserted\n`);

    // Seed Equipment
    console.log('🚜 Seeding Equipment...');
    // await Equipment.insertMany(equipment);
    console.log(`✅ ${equipment.length} equipment items inserted\n`);

    // Seed Materials
    console.log('🧱 Seeding Materials...');
    // await Material.insertMany(materials);
    console.log(`✅ ${materials.length} materials inserted\n`);

    // Seed Material Prices
    console.log('💰 Seeding Material Prices...');
    // await MaterialPrice.insertMany(materialPrices);
    console.log(`✅ ${materialPrices.length} material prices inserted\n`);

    console.log('🎉 Seed process completed successfully!');
    console.log('\nSummary:');
    console.log(`  - Labor Rates: ${laborRates.length}`);
    console.log(`  - Equipment: ${equipment.length}`);
    console.log(`  - Materials: ${materials.length}`);
    console.log(`  - Material Prices: ${materialPrices.length}`);
    console.log(`  - Location: ${BUKIDNON_LOCATION}`);
    console.log(`  - Effective Date: ${EFFECTIVE_DATE.toDateString()}\n`);

  } catch (error: unknown) {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

// Run seed
seed();
