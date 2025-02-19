import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promptSchema } from '@/types/prompt';

// GET /api/admin/prompts/[id]
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

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                nameEn: true,
                nameAr: true,
              },
            },
          },
        },
        tools: {
          include: {
            tool: {
              select: {
                id: true,
                nameEn: true,
                iconUrl: true,
              },
            },
          },
        },
      },
    });

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Transform the response to match frontend schema
    const transformedPrompt = {
      id: prompt.id,
      title_en: prompt.titleEn,
      title_ar: prompt.titleAr,
      type: prompt.type,
      description_en: prompt.descriptionEn,
      description_ar: prompt.descriptionAr,
      instructions_en: prompt.instructionsEn,
      instructions_ar: prompt.instructionsAr,
      uses_counter: prompt.usesCounter,
      created_at: prompt.createdAt,
      updated_at: prompt.updatedAt,
      categories: prompt.categories.map((pc) => ({
        id: pc.category.id,
        name_en: pc.category.nameEn,
        name_ar: pc.category.nameAr,
      })),
      tools: prompt.tools.map((pt) => ({
        id: pt.tool.id,
        name_en: pt.tool.nameEn,
        icon_url: pt.tool.iconUrl,
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformedPrompt,
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/prompts/[id]
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
    const validatedData = promptSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid data',
          details: validatedData.error.errors,
        },
        { status: 400 }
      );
    }

    // Update prompt
    const prompt = await prisma.$transaction(async (tx) => {
      // Delete existing relationships
      await tx.promptCategory.deleteMany({
        where: { promptId: id },
      });
      await tx.promptTool.deleteMany({
        where: { promptId: id },
      });

      // Update prompt and create new relationships
      return tx.prompt.update({
        where: { id },
        data: {
          titleEn: validatedData.data.title_en,
          titleAr: validatedData.data.title_ar,
          type: validatedData.data.type,
          descriptionEn: validatedData.data.description_en,
          descriptionAr: validatedData.data.description_ar,
          instructionsEn: validatedData.data.instructions_en,
          instructionsAr: validatedData.data.instructions_ar,
          categories: {
            create: validatedData.data.category_ids.map((categoryId) => ({
              categoryId,
            })),
          },
          tools: {
            create: validatedData.data.tool_ids.map((toolId) => ({
              toolId,
            })),
          },
        },
        include: {
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  nameEn: true,
                  nameAr: true,
                },
              },
            },
          },
          tools: {
            include: {
              tool: {
                select: {
                  id: true,
                  nameEn: true,
                  iconUrl: true,
                },
              },
            },
          },
        },
      });
    });

    // Transform the response to match frontend schema
    const transformedPrompt = {
      id: prompt.id,
      title_en: prompt.titleEn,
      title_ar: prompt.titleAr,
      type: prompt.type,
      description_en: prompt.descriptionEn,
      description_ar: prompt.descriptionAr,
      instructions_en: prompt.instructionsEn,
      instructions_ar: prompt.instructionsAr,
      uses_counter: prompt.usesCounter,
      created_at: prompt.createdAt,
      updated_at: prompt.updatedAt,
      categories: prompt.categories.map((pc) => ({
        id: pc.category.id,
        name_en: pc.category.nameEn,
        name_ar: pc.category.nameAr,
      })),
      tools: prompt.tools.map((pt) => ({
        id: pt.tool.id,
        name_en: pt.tool.nameEn,
        icon_url: pt.tool.iconUrl,
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformedPrompt,
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/prompts/[id]
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

    // Delete prompt and its relationships
    await prisma.$transaction([
      prisma.promptCategory.deleteMany({
        where: { promptId: id },
      }),
      prisma.promptTool.deleteMany({
        where: { promptId: id },
      }),
      prisma.prompt.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
