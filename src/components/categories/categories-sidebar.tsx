'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/use-categories';
import { useTheme } from '@/lib/theme';
import { Input } from '@/components/ui/input';

export function CategoriesSidebar() {
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { categories, isLoading, error, getCategoryName } = useCategories();
  const { language } = useTheme();

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  };

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!categories || !searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.filter(category => {
      const categoryName = getCategoryName(category).toLowerCase();
      const hasMatchingSubcategories = category.subcategories?.some(
        sub => getCategoryName(sub).toLowerCase().includes(query)
      );

      // If category or its subcategories match, auto-expand it
      if (categoryName.includes(query) || hasMatchingSubcategories) {
        if (hasMatchingSubcategories && !expandedCategories.includes(category.id)) {
          setExpandedCategories(prev => [...prev, category.id]);
        }
        return true;
      }
      return false;
    });
  }, [categories, searchQuery, getCategoryName]);

  // Reset expanded categories when search is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setExpandedCategories([]);
    }
  }, [searchQuery]);

  return (
    <>
      {/* Mobile Categories Bar - Fixed below navbar */}
      <div className="fixed top-16 left-0 right-0 h-12 bg-[#0A0A0A] border-b border-[#1F1F1F] z-40 lg:hidden">
        <div className="flex items-center h-full px-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-zinc-800 flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-4 w-4" />
            <span>{language === 'en' ? 'Categories' : 'الفئات'}</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar & Mobile Dropdown */}
      <aside
        className={cn(
          // Desktop styles
          'lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:bg-[#0A0A0A] lg:border-r lg:border-[#1F1F1F] lg:mt-16 lg:translate-x-0',
          // Mobile styles
          'fixed top-28 left-4 right-4 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg shadow-lg z-50 lg:rounded-none lg:shadow-none',
          'transition-all duration-200 ease-in-out',
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto lg:translate-y-0'
        )}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#1F1F1F]">
          <h2 className="text-lg font-semibold text-white">
            {language === 'en' ? 'Categories' : 'الفئات'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white hover:bg-zinc-800"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-[#1F1F1F]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder={language === 'en' ? "Search categories..." : "البحث في الفئات..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 w-full"
            />
          </div>
        </div>

        {/* Categories List */}
        <ScrollArea className="lg:h-[calc(100vh-8rem)] h-[60vh] lg:h-full">
          <div className="p-4 space-y-2">
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
            ) : filteredCategories && filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div key={category.id} className="space-y-1">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
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
                    <div className="ml-4 space-y-1">
                      {category.subcategories
                        .filter(sub => 
                          !searchQuery.trim() || 
                          getCategoryName(sub).toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((subcategory) => (
                          <button
                            key={subcategory.id}
                            className="w-full text-left p-2 text-sm text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                            onClick={() => {
                              // Close mobile menu and handle subcategory selection
                              setIsMobileMenuOpen(false);
                            }}
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
                  ? searchQuery.trim() 
                    ? 'No matching categories found.'
                    : 'No categories available.'
                  : searchQuery.trim()
                    ? 'لم يتم العثور على فئات مطابقة.'
                    : 'لا توجد فئات متاحة.'
                }
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
