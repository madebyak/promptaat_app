import { z } from 'zod';

// Zod schema for validation
export const categorySchema = z.object({
  name_en: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  name_ar: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').nullable(),
  parent_category_id: z.number().nullable(),
  order: z.number().min(1, 'Order must be at least 1'),
});

// Response type for category data
export interface Category {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  parent_category_id: number | null;
  description: string | null;
  order: number;
  created_at: Date;
  updated_at: Date;
}

// Type for creating a new category
export type CreateCategoryInput = z.infer<typeof categorySchema>;

// Type for updating a category
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

// Type for bulk order update
export interface CategoryOrder {
  id: number;
  order: number;
}

// Type for category list response with pagination
export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page: number;
  pageSize: number;
}

// API Response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
