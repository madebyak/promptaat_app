import { ApiResponse, Category } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const response = await fetch(`${API_URL}/api/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
    };
  }
}

export async function getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
  try {
    const response = await fetch(`${API_URL}/api/categories/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching category:', error);
    return {
      success: false,
      data: {} as Category,
      error: error instanceof Error ? error.message : 'Failed to fetch category',
    };
  }
}
