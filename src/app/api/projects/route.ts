import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const projects = await Project.find()
      .select('projectName projectLocation status appropriation contractId createdAt')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: projects
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    const project = await Project.create(body);
    
    return NextResponse.json({
      success: true,
      data: project
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
