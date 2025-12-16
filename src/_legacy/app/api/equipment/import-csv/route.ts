import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Equipment from '@/models/Equipment';

// POST /api/equipment/import-csv - Import equipment from CSV data
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { csvData, clearExisting } = body;
    
    if (!csvData) {
      return NextResponse.json(
        { success: false, error: 'CSV data is required' },
        { status: 400 }
      );
    }
    
    // Parse CSV data
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    
    // Clear existing equipment if requested
    if (clearExisting) {
      await Equipment.deleteMany({});
    }
    
    const equipmentData = [];
    
    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Parse CSV line (handle quoted fields with commas)
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      // Extract and clean data
      const no = parseInt(values[0]) || 0;
      const completeDescription = values[1] || '';
      const description = values[2] || '';
      const equipmentModel = values[3] || '';
      const capacity = values[4] || '';
      const flywheelHorsepower = parseFloat(values[5]) || 0;
      const rentalRateStr = values[6] || '0';
      
      // Clean rental rate - remove commas, spaces, quotes
      const rentalRate = parseFloat(rentalRateStr.replace(/[",\s]/g, '')) || 0;
      
      // Calculate hourly rate (daily rate ÷ 8 hours)
      const hourlyRate = rentalRate / 8;
      
      equipmentData.push({
        no,
        completeDescription,
        description,
        equipmentModel,
        capacity,
        flywheelHorsepower,
        rentalRate,
        hourlyRate
      });
    }
    
    // Bulk insert
    const result = await Equipment.insertMany(equipmentData, { ordered: false });
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.length} equipment items`,
      count: result.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
