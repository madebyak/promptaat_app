import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CategoryResponse } from '@/types';

export async function GET() {
  try {
    // Fetch main categories with their subcategories
    const categories = await prisma.category.findMany({
      where: {
        parentCategoryId: null // Only fetch main categories
      },
      orderBy: {
        order: 'asc'
      },
      include: {
        subcategories: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return NextResponse.json({ categories } as CategoryResponse);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { categories: [], error: 'Failed to fetch categories' } as CategoryResponse,
      { status: 500 }
    );
  }
}
