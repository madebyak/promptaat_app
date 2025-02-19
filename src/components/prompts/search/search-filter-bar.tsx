'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { usePromptFilters } from '@/hooks/use-prompt-filters';
import { TypeToggle } from './type-toggle';
import { SortDropdown } from './sort-dropdown';
import { FilterButton } from './filter-button';
import { useTheme } from '@/lib/theme';

export function SearchFilterBar() {
  const { filters, setSearch, setType, setSort, setSelectedTools } = usePromptFilters();
  const { language } = useTheme();

  return (
    <div className="px-6 mt-8">
      <div className="flex items-center justify-between gap-6">
        {/* Search input with gradient focus */}
        <div className="flex-1 gradient-focus-container">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder={language === 'en' ? "Search for prompts..." : "ابحث عن النماذج..."}
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-zinc-900 border-zinc-800 w-full remove-focus-styles"
            />
          </div>
        </div>

        {/* Filter controls group */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <TypeToggle value={filters.type} onChange={setType} />
          <SortDropdown value={filters.sort} onChange={setSort} />
          <FilterButton
            selectedTools={filters.selectedTools}
            onSelectedToolsChange={setSelectedTools}
          />
        </div>
      </div>
    </div>
  );
}
