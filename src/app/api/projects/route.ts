import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Project from '@/models/Project';
import { CreateProjectSchema, validateInput } from '@/lib/validation/schemas';

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
    
    // Validate input with Zod
    const validation = validateInput(CreateProjectSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid project data', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }
    
    const project = await Project.create(validation.data);
    
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
