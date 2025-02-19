'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortOption } from '@/hooks/use-prompt-filters';
import { useTheme } from '@/lib/theme';
import { ArrowDownWideNarrow } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const { language } = useTheme();
  const [width, setWidth] = useState<string>('240px');

  const options: { value: SortOption; label: string }[] = [
    {
      value: 'popular',
      label: language === 'en' ? 'Most Popular' : 'الأكثر شعبية',
    },
    {
      value: 'recent',
      label: language === 'en' ? 'Recently Added' : 'أضيف حديثاً',
    },
    {
      value: 'trending',
      label: language === 'en' ? 'Trending' : 'الأكثر رواجاً',
    },
  ];

  // Update width based on selected option
  useEffect(() => {
    const selectedOption = options.find(opt => opt.value === value);
    if (selectedOption) {
      // Calculate width based on content length
      const baseWidth = 140; // Base width for "Sort by" text and icons
      const contentWidth = selectedOption.label.length * 8; // Approximate width per character
      const newWidth = Math.max(240, baseWidth + contentWidth); // Minimum width of 240px
      setWidth(`${newWidth}px`);
    }
  }, [value, language, options]);

  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger 
        className={`bg-zinc-900 border-zinc-800 remove-focus-styles transition-all duration-200`}
        style={{ width }}
      >
        <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
          <ArrowDownWideNarrow className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-500 flex-shrink-0">
            {language === 'en' ? 'Sort by' : 'ترتيب حسب'}
          </span>
          <SelectValue className="text-sm truncate" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-zinc-900 border-zinc-800 min-w-[240px]">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white whitespace-nowrap remove-focus-styles"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
