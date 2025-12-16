import { NextRequest, NextResponse } from 'next/server';
import { instantiateDUPA } from '@/lib/dupa-instantiation';

// POST /api/dupa-templates/:id/instantiate - Apply location rates to template
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { location, quantity, projectId } = body;
    
    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location is required' },
        { status: 400 }
      );
    }
    
    const computed = await instantiateDUPA(
      params.id,
      location,
      quantity || 1,
      projectId
    );
    
    return NextResponse.json({
      success: true,
      data: computed
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
