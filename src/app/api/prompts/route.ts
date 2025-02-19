import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '18');
    const skip = (page - 1) * limit;

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        take: limit,
        skip,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.prompt.count(),
    ])

    console.log('Raw prompts from database:', prompts)

    const formattedPrompts = prompts.map(prompt => ({
      id: prompt.id.toString(),
      title: {
        en: prompt.titleEn || '',
        ar: prompt.titleAr || ''
      },
      description: {
        en: prompt.descriptionEn || '',
        ar: prompt.descriptionAr || ''
      },
      instructions: {
        en: prompt.instructionsEn || '',
        ar: prompt.instructionsAr || ''
      },
      type: prompt.type || 'FREE',
      usesCount: prompt.usesCounter || 0,
      categories: prompt.categories.map(pc => ({
        id: pc.category.id,
        name: {
          en: pc.category.nameEn,
          ar: pc.category.nameAr
        },
        isSubcategory: pc.category.parentCategoryId !== null
      })),
      tools: prompt.tools.map(pt => ({
        id: pt.tool.id,
        name: pt.tool.nameEn,
        iconUrl: pt.tool.iconUrl
      }))
    }))

    console.log('Formatted prompts:', formattedPrompts)

    return NextResponse.json({
      prompts: formattedPrompts,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + prompts.length < total,
      },
    })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}
