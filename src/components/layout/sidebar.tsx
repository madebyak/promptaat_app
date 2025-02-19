'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Category } from '@/types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme';

interface SidebarProps {
  categories?: Category[];
  className?: string;
}

export function Sidebar({ categories = [], className }: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { language } = useTheme();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <aside className={cn("w-64 hidden border-r bg-background lg:block", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {language === 'en' ? 'Categories' : 'الفئات'}
          </h2>
          <div className="space-y-1">
            {categories.map((category) => (
              <div key={category.id} className="space-y-1">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                    expandedCategories.includes(category.id) && "bg-accent"
                  )}
                >
                  <span>{language === 'en' ? category.nameEn : category.nameAr}</span>
                  {category.children?.length ? (
                    expandedCategories.includes(category.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  ) : null}
                </button>
                
                {category.children && expandedCategories.includes(category.id) && (
                  <div className="ml-4 space-y-1">
                    {category.children.map((subCategory) => (
                      <Link
                        key={subCategory.id}
                        href={`/category/${category.slug}/${subCategory.slug}`}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                      >
                        {language === 'en' ? subCategory.nameEn : subCategory.nameAr}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
