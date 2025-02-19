import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toolSchema } from '@/types/tool';

// GET /api/admin/tools/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const tool = await prisma.tool.findUnique({
      where: { id },
    });

    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Transform the response to match frontend schema
    const transformedTool = {
      id: tool.id,
      name_en: tool.nameEn,
      icon_url: tool.iconUrl,
      created_at: tool.createdAt,
      updated_at: tool.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: transformedTool,
    });
  } catch (error) {
    console.error('Error fetching tool:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tool' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/tools/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Get and validate request body
    const body = await req.json();
    const validatedData = toolSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid data',
          details: validatedData.error.errors
        },
        { status: 400 }
      );
    }

    // Update tool
    const tool = await prisma.tool.update({
      where: { id },
      data: {
        nameEn: body.name_en,
        iconUrl: body.icon_url,
      },
    });

    // Transform the response to match frontend schema
    const transformedTool = {
      id: tool.id,
      name_en: tool.nameEn,
      icon_url: tool.iconUrl,
      created_at: tool.createdAt,
      updated_at: tool.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: transformedTool,
    });
  } catch (error) {
    console.error('Error updating tool:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tool' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tools/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    await prisma.tool.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tool' },
      { status: 500 }
    );
  }
}
