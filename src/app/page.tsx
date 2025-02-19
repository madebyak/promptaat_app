'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategoriesSidebar } from '@/components/categories/categories-sidebar';
import { PromptCard } from '@/components/prompts/prompt-card';
import { useSession } from 'next-auth/react';
import { usePrompts } from '@/hooks/use-prompts';
import { useTheme } from '@/lib/theme';
import { PromptCardSkeleton } from '@/components/prompts/prompt-card-skeleton';
import { SearchFilterBar } from '@/components/prompts/search/search-filter-bar';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: session } = useSession();
  const { prompts, pagination, isLoading, error, mutate } = usePrompts(currentPage);
  const { language } = useTheme();

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleCopyPrompt = async (promptId: string) => {
    try {
      const prompt = prompts.find(p => p.id === promptId);
      if (prompt) {
        await navigator.clipboard.writeText(prompt.instructions[language]);
        // TODO: Increment usage count via API
      }
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-black_main">
      {/* Sidebar */}
      <CategoriesSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen pb-[var(--space-8-rem)]">
        {/* Banner Section */}
        <section className="relative mx-[var(--space-6-rem)] mt-[var(--space-6-rem)]">
          <div className="relative h-[300px] md:h-[350px] lg:h-[400px] overflow-hidden rounded-[var(--radius-2xl)]">
            <div className="absolute inset-0 w-full h-full transform translate-y-0 transition-transform duration-[8000ms] hover:translate-y-[-10%]">
              <img
                src="/banner_01.png"
                alt="Banner landscape"
                className="w-full h-[120%] object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 flex flex-col justify-center px-8">
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white opacity-0 animate-[slideUp_1s_ease-in-out_forwards]"
                style={{ animationDelay: '0.3s' }}
              >
                Discover AI Prompts
              </h1>
              <p 
                className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl opacity-0 animate-[slideUp_1s_ease-in-out_forwards]"
                style={{ animationDelay: '0.6s' }}
              >
                Explore and share powerful prompts that unlock the full potential of AI. Find the perfect prompt for your next project.
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <SearchFilterBar />

        {/* Prompts Grid */}
        <div className="px-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <PromptCardSkeleton key={index} />
              ))
            ) : (
              prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onCopy={() => handleCopyPrompt(prompt.id)}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
