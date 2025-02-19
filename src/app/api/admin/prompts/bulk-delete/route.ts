import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid prompt IDs' },
        { status: 400 }
      );
    }

    // Delete all prompt relationships first
    await prisma.$transaction([
      prisma.promptCategory.deleteMany({
        where: {
          promptId: {
            in: ids,
          },
        },
      }),
      prisma.promptTool.deleteMany({
        where: {
          promptId: {
            in: ids,
          },
        },
      }),
      prisma.prompt.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Error deleting prompts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete prompts' },
      { status: 500 }
    );
  }
}
