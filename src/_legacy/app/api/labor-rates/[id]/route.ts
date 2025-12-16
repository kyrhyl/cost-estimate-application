import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LaborRate from '@/models/LaborRate';

// GET /api/labor-rates/:id - Get specific labor rate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const laborRate = await LaborRate.findById(params.id);
    
    if (!laborRate) {
      return NextResponse.json(
        { success: false, error: 'Labor rate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: laborRate
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/labor-rates/:id - Update labor rate
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    const laborRate = await LaborRate.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!laborRate) {
      return NextResponse.json(
        { success: false, error: 'Labor rate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: laborRate
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/labor-rates/:id - Delete labor rate
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const laborRate = await LaborRate.findByIdAndDelete(params.id);
    
    if (!laborRate) {
      return NextResponse.json(
        { success: false, error: 'Labor rate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Labor rate deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
