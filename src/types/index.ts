export interface Prompt {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  promptText: string;
  tags: string[];
  tools: string[];
  usageCount: number;
  type: 'FREE' | 'PRO';
}

export interface Category {
  id: number;
  nameEn: string;
  nameAr: string;
  slug: string;
  description?: string;
  order: number;
  parentCategoryId?: number;
  subcategories?: Category[];
}

export interface CategoryResponse {
  categories: Category[];
  error?: string;
}

export interface Tool {
  id: string;
  name: string;
  imageUrl: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  favorites: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
