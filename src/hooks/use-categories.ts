import useSWR from 'swr';
import { Category, CategoryResponse } from '@/types';
import { useTheme } from '@/lib/theme';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<CategoryResponse>(
    '/api/categories',
    fetcher
  );
  const { language } = useTheme();

  const getCategoryName = (category: Category) => {
    return language === 'en' ? category.nameEn : category.nameAr;
  };

  const getSubcategoryName = (category: Category, subcategoryId: number) => {
    const subcategory = category.subcategories?.find(sub => sub.id === subcategoryId);
    return subcategory ? (language === 'en' ? subcategory.nameEn : subcategory.nameAr) : '';
  };

  return {
    categories: data?.categories ?? [],
    isLoading,
    error: error || data?.error,
    getCategoryName,
    getSubcategoryName,
    mutate
  };
}
