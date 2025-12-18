import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/upa-estimating';

// Simple CSV parser
function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data = [];
  
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 1; i < lines.length; i++) {
    currentLine += lines[i];
    
    // Count quotes to determine if we're inside a quoted field
    const quoteCount = (currentLine.match(/"/g) || []).length;
    inQuotes = quoteCount % 2 !== 0;
    
    if (!inQuotes && currentLine.trim()) {
      const values = [];
      let current = '';
      let insideQuote = false;
      
      for (let j = 0; j < currentLine.length; j++) {
        const char = currentLine[j];
        
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index].replace(/^"|"$/g, '').trim();
        });
        data.push(row);
      }
      
      currentLine = '';
    } else if (!currentLine.trim()) {
      currentLine = '';
    }
  }
  
  return data;
}

// PayItem Schema
const PayItemSchema = new mongoose.Schema({
  division: { type: String, required: true, trim: true, index: true },
  part: { type: String, required: true, trim: true, index: true },
  item: { type: String, required: true, trim: true, index: true },
  payItemNumber: { type: String, required: true, unique: true, trim: true, index: true },
  description: { type: String, required: true, trim: true },
  unit: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

const PayItem = mongoose.models.PayItem || mongoose.model('PayItem', PayItemSchema);

async function importPayItems() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read CSV file
    const csvPath = path.join(__dirname, '../REFERENCE/DPWH_PAY_ITEM.csv');
    console.log(`📖 Reading CSV from: ${csvPath}`);
    
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parseCSV(fileContent);

    console.log(`📊 Found ${records.length} records in CSV`);

    // Clear existing pay items
    console.log('🗑️  Clearing existing pay items...');
    await PayItem.deleteMany({});
    console.log('✅ Cleared existing pay items');

    // Transform and insert pay items
    console.log('💾 Inserting pay items...');
    
    const payItems = records.map(record => ({
      division: record.Division,
      part: record.Part,
      item: record.Item,
      payItemNumber: record['Pay Item'],
      description: record.Description,
      unit: record.Unit,
      isActive: true,
    })).filter(item => item.payItemNumber && item.description);

    console.log(`📝 Prepared ${payItems.length} valid pay items`);

    // Batch insert
    const batchSize = 100;
    let inserted = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < payItems.length; i += batchSize) {
      const batch = payItems.slice(i, i + batchSize);
      try {
        await PayItem.insertMany(batch, { ordered: false });
        inserted += batch.length;
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${inserted}/${payItems.length}`);
      } catch (error) {
        // Handle duplicate key errors
        if (error.writeErrors) {
          const successCount = batch.length - error.writeErrors.length;
          inserted += successCount;
          failed += error.writeErrors.length;
          errors.push(...error.writeErrors.map(e => ({
            payItemNumber: batch[e.index]?.payItemNumber,
            error: e.errmsg
          })));
          console.log(`⚠️  Batch ${Math.floor(i / batchSize) + 1}: ${successCount} inserted, ${error.writeErrors.length} failed`);
        } else {
          failed += batch.length;
          console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
        }
      }
    }

    console.log('\n📊 IMPORT SUMMARY:');
    console.log(`   Total records in CSV: ${records.length}`);
    console.log(`   Valid records: ${payItems.length}`);
    console.log(`   ✅ Successfully inserted: ${inserted}`);
    console.log(`   ❌ Failed: ${failed}`);

    if (errors.length > 0 && errors.length <= 10) {
      console.log('\n⚠️  ERRORS:');
      errors.forEach(err => {
        console.log(`   - ${err.payItemNumber}: ${err.error}`);
      });
    } else if (errors.length > 10) {
      console.log(`\n⚠️  ${errors.length} errors occurred (showing first 5):`);
      errors.slice(0, 5).forEach(err => {
        console.log(`   - ${err.payItemNumber}: ${err.error}`);
      });
    }

    // Verify data
    const totalInDB = await PayItem.countDocuments();
    console.log(`\n✅ Total pay items in database: ${totalInDB}`);

    // Sample some records
    const samples = await PayItem.find().limit(5).lean();
    console.log('\n📋 Sample records:');
    samples.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.payItemNumber} - ${item.description.substring(0, 60)}...`);
    });

    console.log('\n✅ Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error importing pay items:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the import
importPayItems()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
