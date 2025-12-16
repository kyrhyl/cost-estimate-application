import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MaterialPrice from '@/models/MaterialPrice';

// GET /api/material-prices/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const materialPrice = await MaterialPrice.findById(params.id);
    
    if (!materialPrice) {
      return NextResponse.json(
        { success: false, error: 'Material price not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: materialPrice
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/material-prices/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    const materialPrice = await MaterialPrice.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!materialPrice) {
      return NextResponse.json(
        { success: false, error: 'Material price not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: materialPrice
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/material-prices/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const materialPrice = await MaterialPrice.findByIdAndDelete(params.id);
    
    if (!materialPrice) {
      return NextResponse.json(
        { success: false, error: 'Material price not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Material price deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
