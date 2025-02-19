import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/tools
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || '';

    // Calculate skip
    const skip = (page - 1) * pageSize;

    // Prepare filter
    const where = search
      ? {
          nameEn: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    // Get tools with pagination
    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.tool.count({ where }),
    ]);

    // Transform the data to match the frontend schema
    const transformedTools = tools.map(tool => ({
      id: tool.id,
      name_en: tool.nameEn,
      icon_url: tool.iconUrl,
      created_at: tool.createdAt,
      updated_at: tool.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: transformedTools,
      total,
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

// POST /api/admin/tools
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();

    // Validate required fields
    if (!body.name_en || !body.icon_url) {
      return NextResponse.json(
        { success: false, error: 'Name and icon URL are required' },
        { status: 400 }
      );
    }

    // Create tool
    const tool = await prisma.tool.create({
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
    console.error('Error creating tool:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tool' },
      { status: 500 }
    );
  }
}
