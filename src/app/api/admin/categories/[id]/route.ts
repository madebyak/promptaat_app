import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/types/category';
import { generateUniqueSlug, validateParentCategory, hasSubcategories } from '@/lib/category';
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
  };
}

// GET /api/admin/categories/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // For development, temporarily skip auth check
    // if (!session?.user) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    const id = parseInt(params.id);
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: transformCategory(category)
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // For development, temporarily skip auth check
    // if (!session?.user) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    const id = parseInt(params.id);
    const body = await req.json();
    const validatedData = categorySchema.partial().parse(body);

    // Transform API data to DB format
    const dbData = {
      nameEn: validatedData.name_en,
      nameAr: validatedData.name_ar,
      description: validatedData.description,
      parentCategoryId: validatedData.parent_category_id,
    };

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Validate parent category if provided
    if (dbData.parentCategoryId) {
      const isValidParent = await validateParentCategory(id, dbData.parentCategoryId);
      if (!isValidParent) {
        return NextResponse.json(
          { success: false, error: 'Invalid parent category' },
          { status: 400 }
        );
      }
    }

    // Generate new slug if name_en changed
    let slug = existingCategory.slug;
    if (dbData.nameEn && dbData.nameEn !== existingCategory.nameEn) {
      slug = await generateUniqueSlug(dbData.nameEn);
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...dbData,
        slug
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: transformCategory(category)
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // For development, temporarily skip auth check
    // if (!session?.user) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    const id = parseInt(params.id);

    // Check if category has subcategories
    const hasChildren = await hasSubcategories(id);
    if (hasChildren) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with subcategories' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
