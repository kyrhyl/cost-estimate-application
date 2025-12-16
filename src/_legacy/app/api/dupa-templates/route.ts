import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DUPATemplate from '@/models/DUPATemplate';

// GET /api/dupa-templates - List all templates
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    
    const filter = active === 'true' ? { isActive: true } : {};
    
    const templates = await DUPATemplate.find(filter)
      .sort({ payItemNumber: 1 });
    
    return NextResponse.json({
      success: true,
      data: templates
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/dupa-templates - Create new template
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    const template = await DUPATemplate.create(body);
    
    return NextResponse.json({
      success: true,
      data: template
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
