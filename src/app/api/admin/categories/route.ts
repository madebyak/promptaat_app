import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/types/category';
import { generateUniqueSlug, validateParentCategory, getMaxOrder } from '@/lib/category';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Transform category from DB to API format
function transformCategory(category: any) {
  return {
    id: category.id,
    name_en: category.nameEn,
    name_ar: category.nameAr,
    slug: category.slug,
    parent_category_id: category.parentCategoryId,
    description: category.description,
    order: category.order,
    created_at: category.createdAt,
    updated_at: category.updatedAt,
    subcategories: category.subcategories?.map(transformCategory) || [],
  };
}

// GET /api/admin/categories
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || '';
    const includeAll = searchParams.get('includeAll') === 'true';

    const skip = (page - 1) * pageSize;

    // Query conditions
    const where = includeAll ? {} : {
      parentCategoryId: null,
      ...(search ? {
        OR: [
          { nameEn: { contains: search, mode: 'insensitive' } },
          { nameAr: { contains: search } }
        ]
      } : {})
    };

    // Include configuration
    const include = {
      subcategories: {
        include: {
          subcategories: true // Include nested subcategories
        }
      }
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: includeAll ? undefined : skip,
        take: includeAll ? undefined : pageSize,
        orderBy: { order: 'asc' },
        include
      }),
      prisma.category.count({ where })
    ]);

    // Transform categories
    const transformedCategories = categories.map(transformCategory);

    return NextResponse.json({
      success: true,
      data: {
        categories: transformedCategories,
        total,
        page: includeAll ? 1 : page,
        pageSize: includeAll ? total : pageSize
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = categorySchema.parse(body);

    // Transform API data to DB format
    const dbData = {
      nameEn: validatedData.name_en,
      nameAr: validatedData.name_ar,
      description: validatedData.description,
      parentCategoryId: validatedData.parent_category_id,
    };

    // Validate parent category if provided
    if (dbData.parentCategoryId) {
      const isValidParent = await validateParentCategory(null, dbData.parentCategoryId);
      if (!isValidParent) {
        return NextResponse.json(
          { success: false, error: 'Invalid parent category' },
          { status: 400 }
        );
      }
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(dbData.nameEn);

    // Get max order for the current level
    const order = await getMaxOrder(dbData.parentCategoryId);

    const category = await prisma.category.create({
      data: {
        ...dbData,
        slug,
        order
      },
      include: {
        subcategories: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: transformCategory(category)
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
