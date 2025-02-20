'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-zinc-400">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button
          onClick={reset}
          className="bg-white text-black hover:bg-zinc-200"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
