import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Project from '@/models/Project';
import Estimate from '@/models/Estimate';
import { z } from 'zod';
import mongoose from 'mongoose';

const ProjectUpdateSchema = z.object({
  projectName: z.string().min(1).optional(),
  projectLocation: z.string().min(1).optional(),
  district: z.string().optional(),
  implementingOffice: z.string().optional(),
  appropriation: z.number().min(0).optional(),
  contractId: z.string().optional(),
  projectType: z.string().optional(),
  status: z.enum(['Planning', 'Approved', 'Ongoing', 'Completed', 'Cancelled']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  description: z.string().optional(),
  haulingCostPerKm: z.number().min(0).optional(),
  distanceFromOffice: z.number().min(0).optional(),
});

// GET /api/projects/:id - Get single project with estimates
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const project = await Project.findById(params.id).lean();

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get associated estimates count
    const estimatesCount = await Estimate.countDocuments({ projectId: params.id });

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        estimatesCount,
      },
    });
  } catch (error: any) {
    console.error('GET /api/projects/:id error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/:id - Update project
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = ProjectUpdateSchema.parse(body);

    // Check for duplicate contract ID if being updated
    if (validatedData.contractId) {
      const existing = await Project.findOne({
        contractId: validatedData.contractId,
        _id: { $ne: params.id },
      });

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: `Another project with contract ID "${validatedData.contractId}" already exists`,
          },
          { status: 409 }
        );
      }
    }

    const project = await Project.findByIdAndUpdate(
      params.id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project updated successfully',
    });
  } catch (error: any) {
    console.error('PATCH /api/projects/:id error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/:id - Delete project
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Check if project has estimates
    const estimatesCount = await Estimate.countDocuments({ projectId: params.id });

    if (estimatesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete project with ${estimatesCount} associated estimate(s). Delete estimates first.`,
        },
        { status: 400 }
      );
    }

    const project = await Project.findByIdAndDelete(params.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    console.error('DELETE /api/projects/:id error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete project' },
      { status: 500 }
    );
  }
}
