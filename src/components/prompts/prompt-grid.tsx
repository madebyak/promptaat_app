'use client';

import { usePrompts } from '@/hooks/usePrompts';
import { PromptCard } from './prompt-card';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { PromptCardSkeleton } from './prompt-card-skeleton';

export function PromptGrid() {
  const { prompts, loading, error, fetchNextPage, incrementUsesCount, pagination } = usePrompts();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !loading && pagination.currentPage < pagination.pages) {
      fetchNextPage();
    }
  }, [inView, loading, pagination.currentPage, pagination.pages, fetchNextPage]);

  if (error) {
    return (
      <div className="flex h-[200px] items-center justify-center text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Prompts */}
      {Array.isArray(prompts) && prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onCopy={incrementUsesCount}
        />
      ))}
      
      {/* Loading skeletons */}
      {loading && (
        <>
          {Array.from({ length: 6 }).map((_, index) => (
            <PromptCardSkeleton key={index} />
          ))}
        </>
      )}
      
      {/* Empty state */}
      {!loading && prompts.length === 0 && (
        <div className="col-span-3 flex h-[200px] items-center justify-center text-muted-foreground">
          <p>No prompts found</p>
        </div>
      )}
      
      {/* Infinite scroll trigger */}
      <div ref={ref} className="h-20" />
    </div>
  );
}
