import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Equipment from '@/models/Equipment';

// GET /api/equipment - List all equipment
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const equipment = await Equipment.find()
      .sort({ no: 1 });
    
    return NextResponse.json({
      success: true,
      data: equipment
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/equipment - Create new equipment or bulk import
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Check if bulk import
    if (Array.isArray(body)) {
      // Bulk import from CSV
      const equipment = await Equipment.insertMany(body, { ordered: false });
      
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${equipment.length} equipment items`,
        data: equipment
      });
    } else {
      // Single equipment creation
      const equipment = await Equipment.create(body);
      
      return NextResponse.json({
        success: true,
        data: equipment
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/equipment - Clear all equipment (for re-import)
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const result = await Equipment.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} equipment items`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
