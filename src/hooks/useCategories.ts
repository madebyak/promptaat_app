import useSWR from 'swr';
import { CategoryResponse } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<CategoryResponse>(
    '/api/categories',
    fetcher
  );

  return {
    categories: data?.categories ?? [],
    isLoading,
    isError: error,
    mutate
  };
}
