import { useState } from 'react';

export type PromptType = 'all' | 'free' | 'pro';
export type SortOption = 'popular' | 'recent' | 'trending';

export interface PromptFilters {
  search: string;
  type: PromptType;
  sort: SortOption;
  selectedTools: string[];
}

export function usePromptFilters() {
  const [filters, setFilters] = useState<PromptFilters>({
    search: '',
    type: 'all',
    sort: 'popular',
    selectedTools: [],
  });

  const setSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const setType = (type: PromptType) => {
    setFilters((prev) => ({ ...prev, type }));
  };

  const setSort = (sort: SortOption) => {
    setFilters((prev) => ({ ...prev, sort }));
  };

  const setSelectedTools = (selectedTools: string[]) => {
    setFilters((prev) => ({ ...prev, selectedTools }));
  };

  return {
    filters,
    setSearch,
    setType,
    setSort,
    setSelectedTools,
  };
}
