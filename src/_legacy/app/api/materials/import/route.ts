import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Material from '@/models/Material';

// POST /api/materials/import - Bulk import materials from CSV data
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { materials } = body;
    
    if (!Array.isArray(materials)) {
      return NextResponse.json(
        { success: false, error: 'Materials must be an array' },
        { status: 400 }
      );
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };
    
    for (const item of materials) {
      try {
        // Extract category from material code (e.g., 'MG01' from 'MG01.0001')
        const category = item.materialCode.split('.')[0];
        
        await Material.findOneAndUpdate(
          { materialCode: item.materialCode },
          {
            materialCode: item.materialCode,
            materialDescription: item.materialDescription,
            unit: item.unit,
            basePrice: item.basePrice,
            category: category,
            isActive: true,
          },
          { upsert: true, new: true }
        );
        
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${item.materialCode}: ${error.message}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
