'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/use-categories';
import { useTheme } from '@/lib/theme';

export function CategoriesSidebar() {
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { categories, isLoading, error, getCategoryName } = useCategories();
  const { language } = useTheme();

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-[var(--space-4)] left-[var(--space-4)] z-50 lg:hidden text-white hover:bg-zinc-800"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-72 bg-[#0A0A0A] border-r border-[#1F1F1F] transition-transform duration-300 ease-in-out z-40',
          'lg:translate-x-0 lg:mt-16',
          isSidebarOpen ? 'translate-x-0 mt-16' : '-translate-x-full mt-16'
        )}
      >
        <ScrollArea className="h-full py-[var(--space-4)]">
          <div className="px-[var(--space-4)] space-y-[var(--space-2)]">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-red-500">
                {language === 'en' 
                  ? 'Error loading categories. Please try again.' 
                  : 'خطأ في تحميل الفئات. يرجى المحاولة مرة أخرى.'
                }
              </div>
            ) : categories && categories.length > 0 ? (
              categories.map((category) => (
                <div key={category.id} className="space-y-[var(--space-1)]">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-[var(--space-2)] text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-[var(--radius-md)] transition-colors"
                  >
                    <span>{getCategoryName(category)}</span>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <>
                        {expandedCategories.includes(category.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>

                  {category.subcategories && expandedCategories.includes(category.id) && (
                    <div className="ml-[var(--space-4)] space-y-[var(--space-1)]">
                      {category.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          className="w-full text-left p-[var(--space-2)] text-sm text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-[var(--radius-md)] transition-colors"
                        >
                          {getCategoryName(subcategory)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'No categories available.'
                  : 'لا توجد فئات متاحة.'
                }
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
