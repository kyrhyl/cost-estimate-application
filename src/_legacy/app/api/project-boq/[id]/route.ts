import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectBOQ from '@/models/ProjectBOQ';

// GET /api/project-boq/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const boqItem = await ProjectBOQ.findById(params.id)
      .populate('projectId')
      .populate('templateId');
    
    if (!boqItem) {
      return NextResponse.json(
        { success: false, error: 'BOQ item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: boqItem
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/project-boq/:id - Update quantity or other fields
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // If quantity changes, recalculate totalAmount
    if (body.quantity !== undefined) {
      const boqItem = await ProjectBOQ.findById(params.id);
      if (boqItem) {
        body.totalAmount = boqItem.totalCost * body.quantity;
      }
    }
    
    const updated = await ProjectBOQ.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'BOQ item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/project-boq/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const deleted = await ProjectBOQ.findByIdAndDelete(params.id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'BOQ item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'BOQ item deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
