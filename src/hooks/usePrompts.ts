import { useState, useCallback, useEffect } from 'react';

interface Category {
  id: number;
  name: {
    en: string;
    ar: string;
  };
  isSubcategory: boolean;
}

interface Tool {
  id: string;
  name: string;
  iconUrl: string;
}

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
  categories: Category[];
  tools: Tool[];
  usesCount: number;
}

interface PaginationInfo {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

interface PromptsResponse {
  prompts: Prompt[];
  pagination: PaginationInfo;
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 1,
    currentPage: 1,
    perPage: 12
  });

  const fetchPrompts = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/prompts?page=${page}&limit=${pagination.perPage}`);
      if (!response.ok) throw new Error('Failed to fetch prompts');
      
      const data: PromptsResponse = await response.json();
      
      if (page === 1) {
        setPrompts(data.prompts);
      } else {
        setPrompts(prev => [...prev, ...data.prompts]);
      }
      
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [pagination.perPage]);

  const fetchNextPage = useCallback(() => {
    if (pagination.currentPage < pagination.pages) {
      fetchPrompts(pagination.currentPage + 1);
    }
  }, [pagination.currentPage, pagination.pages, fetchPrompts]);

  const incrementUsesCount = useCallback(async (promptId: string) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/increment-uses`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to increment uses count');
      
      const { usesCount } = await response.json();
      
      setPrompts(prev =>
        prev.map(p =>
          p.id === promptId ? { ...p, usesCount } : p
        )
      );
    } catch (err) {
      console.error('Error incrementing uses count:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPrompts(1);
  }, [fetchPrompts]);

  return {
    prompts,
    loading,
    error,
    pagination,
    fetchNextPage,
    incrementUsesCount
  };
}
