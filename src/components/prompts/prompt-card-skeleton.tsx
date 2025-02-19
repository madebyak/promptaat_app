'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function PromptCardSkeleton() {
  return (
    <Card className="h-full bg-zinc-900 border-zinc-800 rounded-[var(--radius-lg)] overflow-hidden hover:border-zinc-700 transition-all">
      <CardContent className="p-[var(--space-4)] space-y-[var(--space-4)]">
        {/* Type Badge and Favorite Button */}
        <div className="flex items-start justify-between">
          <div className="h-6 w-16 bg-zinc-800 rounded-[var(--radius-sm)] animate-pulse" />
          <div className="h-8 w-8 bg-zinc-800 rounded-full animate-pulse" />
        </div>

        {/* Title and Description */}
        <div>
          <div className="h-6 w-3/4 bg-zinc-800 rounded mb-[var(--space-2)] animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-6 w-20 bg-zinc-800 rounded-full animate-pulse"
            />
          ))}
        </div>

        {/* Tools */}
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-6 w-24 bg-zinc-800 rounded-full animate-pulse"
            />
          ))}
        </div>
      </CardContent>

      <CardFooter className="mt-auto px-[var(--space-4)] py-[var(--space-3)] bg-zinc-900/50 border-t border-zinc-800 gap-[var(--space-4)]">
        <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse" />
        <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse ml-auto" />
      </CardFooter>
    </Card>
  );
}
