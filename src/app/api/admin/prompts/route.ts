import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promptSchema } from '@/types/prompt';

// GET /api/admin/prompts
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
    const type = searchParams.get('type') || undefined;
    const categories = searchParams.get('categories')?.split(',').map(Number) || [];
    const tools = searchParams.get('tools')?.split(',').map(Number) || [];

    // Calculate skip
    const skip = (page - 1) * pageSize;

    // Prepare filter
    const where: any = {};

    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' as const } },
        { titleAr: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (categories.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: categories },
        },
      };
    }

    if (tools.length > 0) {
      where.tools = {
        some: {
          toolId: { in: tools },
        },
      };
    }

    // Get prompts with pagination
    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
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
      }),
      prisma.prompt.count({ where }),
    ]);

    // Transform the data to match frontend schema
    const transformedPrompts = prompts.map((prompt) => ({
      id: prompt.id,
      title_en: prompt.titleEn,
      title_ar: prompt.titleAr,
      type: prompt.type,
      description_en: prompt.descriptionEn,
      description_ar: prompt.descriptionAr,
      instructions_en: prompt.instructionsEn,
      instructions_ar: prompt.instructionsAr,
      initial_uses_counter: prompt.usesCounter,
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
    }));

    return NextResponse.json({
      success: true,
      data: {
        prompts: transformedPrompts,
        total,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST /api/admin/prompts
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get and validate request body
    const body = await req.json();
    console.log('Received request body:', body);

    try {
      const validatedData = promptSchema.parse(body);
      console.log('Validated data:', validatedData);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationError },
        { status: 400 }
      );
    }

    const validatedData = promptSchema.parse(body);

    // Log the data we're about to send to Prisma
    console.log('Creating prompt with data:', {
      titleEn: validatedData.title_en,
      titleAr: validatedData.title_ar,
      type: validatedData.type,
      descriptionEn: validatedData.description_en,
      descriptionAr: validatedData.description_ar,
      instructionsEn: validatedData.instructions_en,
      instructionsAr: validatedData.instructions_ar,
      usesCounter: validatedData.initial_uses_counter,
      categories: validatedData.category_ids,
      tools: validatedData.tool_ids,
    });

    // Create prompt
    const prompt = await prisma.prompt.create({
      data: {
        titleEn: validatedData.title_en,
        titleAr: validatedData.title_ar,
        type: validatedData.type,
        descriptionEn: validatedData.description_en,
        descriptionAr: validatedData.description_ar,
        instructionsEn: validatedData.instructions_en,
        instructionsAr: validatedData.instructions_ar,
        usesCounter: validatedData.initial_uses_counter || 0,
        categories: {
          create: validatedData.category_ids.map((categoryId) => ({
            categoryId: categoryId,
          })),
        },
        tools: {
          create: validatedData.tool_ids.map((toolId) => ({
            toolId: toolId,
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tools: {
          include: {
            tool: true,
          },
        },
      },
    });

    console.log('Created prompt:', prompt);

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
      initial_uses_counter: prompt.usesCounter,
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
    console.error('Error creating prompt:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
