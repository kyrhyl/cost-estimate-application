import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MaterialPrice from '@/models/MaterialPrice';

// GET /api/material-prices - List all material prices
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    
    const filter = location ? { location } : {};
    
    const materialPrices = await MaterialPrice.find(filter)
      .sort({ materialCode: 1, location: 1 });
    
    return NextResponse.json({
      success: true,
      data: materialPrices
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/material-prices - Create or bulk import
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    if (Array.isArray(body)) {
      const materialPrices = await MaterialPrice.insertMany(body, { ordered: false });
      
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${materialPrices.length} material prices`,
        data: materialPrices
      });
    } else {
      const materialPrice = await MaterialPrice.create(body);
      
      return NextResponse.json({
        success: true,
        data: materialPrice
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
