import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Material from '@/models/Material';

// GET /api/materials - List all materials with optional filtering
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { materialCode: { $regex: search, $options: 'i' } },
        { materialDescription: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (active !== null && active !== undefined) {
      filter.isActive = active === 'true';
    }
    
    const materials = await Material.find(filter)
      .sort({ materialCode: 1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      data: materials,
      count: materials.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/materials - Create new material
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const material = await Material.create(body);
    
    return NextResponse.json({
      success: true,
      data: material
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
