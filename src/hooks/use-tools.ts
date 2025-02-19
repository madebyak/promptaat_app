'use client';

import { useState, useEffect } from 'react';

export interface Tool {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
}

// This will be replaced with actual API call later
const mockTools: Tool[] = [
  { id: 'chatgpt', name: 'ChatGPT', nameAr: 'تشات جي بي تي', icon: 'message-square' },
  { id: 'dalle', name: 'DALL·E', nameAr: 'دالي', icon: 'image' },
  { id: 'midjourney', name: 'Midjourney', nameAr: 'ميدجورني', icon: 'compass' },
  { id: 'claude', name: 'Claude', nameAr: 'كلود', icon: 'bot' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', nameAr: 'ستيبل ديفيوجن', icon: 'wand-2' },
  { id: 'bard', name: 'Bard', nameAr: 'بارد', icon: 'message-circle' },
];

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        // TODO: Replace with actual API call
        setTools(mockTools);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch tools'));
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []);

  return { tools, isLoading, error };
}
