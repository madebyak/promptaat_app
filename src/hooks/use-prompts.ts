import useSWR from 'swr';

interface Prompt {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  type: 'FREE' | 'PRO';
  categories: Array<{
    id: number;
    name: {
      en: string;
      ar: string;
    };
    isSubcategory: boolean;
  }>;
  tools: Array<{
    id: string;
    name: string;
    iconUrl: string;
  }>;
  usesCount: number;
}

interface PaginatedResponse {
  prompts: Prompt[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch prompts');
  }
  return res.json();
};

export function usePrompts(page = 1, limit = 18) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse>(
    `/api/prompts?page=${page}&limit=${limit}`,
    fetcher
  );

  return {
    prompts: data?.prompts || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}
