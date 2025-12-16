import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectBOQ from '@/models/ProjectBOQ';

// GET /api/project-boq?projectId=xxx - List BOQ items for a project
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      );
    }
    
    const boqItems = await ProjectBOQ.find({ projectId })
      .populate('templateId')
      .sort({ payItemNumber: 1 });
    
    return NextResponse.json({
      success: true,
      data: boqItems
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/project-boq - Create BOQ item from template instantiation
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Body should contain computed DUPA from instantiation + projectId + quantity
    const boqItem = await ProjectBOQ.create(body);
    
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
