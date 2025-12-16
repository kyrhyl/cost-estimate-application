import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RateItem from '@/models/RateItem';

// GET /api/rates - List all rate items
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { payItemNumber: { $regex: search, $options: 'i' } },
          { payItemDescription: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const rateItems = await RateItem.find(query).sort({ payItemNumber: 1 });
    
    return NextResponse.json({
      success: true,
      data: rateItems
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/rates - Create a new rate item
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Create new rate item
    const rateItem = await RateItem.create(body);
    
    return NextResponse.json({
      success: true,
      data: rateItem
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
