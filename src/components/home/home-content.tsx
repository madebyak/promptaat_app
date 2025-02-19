'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { PromptGrid } from '@/components/prompts/prompt-grid';
import { CategoriesSidebar } from '@/components/categories/categories-sidebar';
import { cn } from '@/lib/utils';

export function HomeContent() {
  const { language } = useTheme();
  const [promptSearch, setPromptSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'free' | 'pro'>('all');

  return (
    <div className="flex min-h-screen bg-background">
      {/* Categories Sidebar */}
      <CategoriesSidebar />

      {/* Main Content */}
      <main className="flex-1 pl-72">
        {/* Hero Section with Background */}
        <div 
          className="relative min-h-[60vh] flex items-center justify-center bg-[url('/Banner_img_01.png')] bg-cover bg-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/95" />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {language === 'en' ? 'Discover AI Prompts' : 'اكتشف موجهات الذكاء الاصطناعي'}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {language === 'en' 
                ? 'Browse and copy high-quality prompts for various AI tools'
                : 'تصفح وانسخ موجهات عالية الجودة لمختلف أدوات الذكاء الاصطناعي'
              }
            </p>
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={language === 'en' ? 'Search prompts...' : 'البحث عن النصوص...'}
                    value={promptSearch}
                    onChange={(e) => setPromptSearch(e.target.value)}
                    className="w-full h-10 pl-10"
                  />
                </div>
                {['all', 'free', 'pro'].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? 'default' : 'outline'}
                    onClick={() => setSelectedFilter(filter as 'all' | 'free' | 'pro')}
                    className={cn(
                      "h-10",
                      selectedFilter === filter 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {filter === 'all' 
                      ? (language === 'en' ? 'All' : 'الكل')
                      : filter === 'free'
                        ? (language === 'en' ? 'Free' : 'مجاني')
                        : (language === 'en' ? 'Pro' : 'مدفوع')
                    }
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Prompts Grid with Padding */}
        <div className="p-8">
          <PromptGrid />
        </div>
      </main>
    </div>
  );
}
