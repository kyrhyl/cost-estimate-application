import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RateItem from '@/models/RateItem';

// GET /api/rates/:id - Get a specific rate item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const rateItem = await RateItem.findById(params.id);
    
    if (!rateItem) {
      return NextResponse.json(
        { success: false, error: 'Rate item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: rateItem
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/rates/:id - Update a rate item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    const rateItem = await RateItem.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!rateItem) {
      return NextResponse.json(
        { success: false, error: 'Rate item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: rateItem
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/rates/:id - Delete a rate item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const rateItem = await RateItem.findByIdAndDelete(params.id);
    
    if (!rateItem) {
      return NextResponse.json(
        { success: false, error: 'Rate item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Rate item deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
