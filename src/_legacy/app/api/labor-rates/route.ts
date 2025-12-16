import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LaborRate from '@/models/LaborRate';

// GET /api/labor-rates - List all labor rates
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const laborRates = await LaborRate.find()
      .sort({ location: 1 });
    
    return NextResponse.json({
      success: true,
      data: laborRates
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/labor-rates - Create or bulk import labor rates
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    if (Array.isArray(body)) {
      // Bulk import
      const laborRates = await LaborRate.insertMany(body, { ordered: false });
      
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${laborRates.length} labor rates`,
        data: laborRates
      });
    } else {
      // Single creation
      const laborRate = await LaborRate.create(body);
      
      return NextResponse.json({
        success: true,
        data: laborRate
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
