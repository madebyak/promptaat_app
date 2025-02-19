'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, BarChart2, Copy } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface Category {
  id: number;
  name: {
    en: string;
    ar: string;
  };
  isSubcategory: boolean;
}

interface Tool {
  id: string;
  name: string;
  iconUrl: string;
}

interface PromptCardProps {
  prompt: {
    id: string;
    title: {
      en: string;
      ar: string;
    };
    description: {
      en: string;
      ar: string;
    };
    type: 'FREE' | 'PRO';
    categories?: Category[];
    tools?: Tool[];
    usesCount: number;
  };
  onCopy?: (promptId: string) => Promise<void>;
}

export function PromptCard({ prompt, onCopy }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { language } = useTheme();

  const handleCopy = async () => {
    try {
      if (onCopy) {
        await onCopy(prompt.id);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt: ', err);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
  };

  // For demo purposes
  const dummyPrompt = {
    id: '1',
    title: {
      en: 'Write a blog post about AI',
      ar: 'اكتب مقالاً عن الذكاء الاصطناعي'
    },
    description: {
      en: 'Write a comprehensive blog post about artificial intelligence, covering its history, current applications, and future implications for society.',
      ar: 'اكتب مقالاً شاملاً عن الذكاء الاصطناعي، يغطي تاريخه وتطبيقاته الحالية وتأثيراته المستقبلية على المجتمع.'
    },
    type: 'FREE' as const,
    categories: [
      { id: 1, name: { en: 'Writing', ar: 'كتابة' }, isSubcategory: false },
      { id: 2, name: { en: 'Technology', ar: 'تكنولوجيا' }, isSubcategory: true }
    ],
    tools: [
      { id: '1', name: 'ChatGPT', iconUrl: '/icons/chatgpt.png' },
      { id: '2', name: 'Claude', iconUrl: '/icons/claude.png' }
    ],
    usesCount: 128
  };

  const activePrompt = prompt || dummyPrompt;

  return (
    <Card className="h-full bg-dark_grey border-mid_grey rounded-[var(--radius-lg)] overflow-hidden hover:border-light_grey transition-all">
      <CardContent className="p-[var(--space-4)] space-y-[var(--space-4)]">
        {/* Type Badge and Favorite Button */}
        <div className="flex items-start justify-between">
          <Badge
            variant={activePrompt.type === 'PRO' ? 'premium' : 'secondary'}
            className="rounded-[var(--radius-sm)]"
          >
            {activePrompt.type}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={handleToggleFavorite}
          >
            <Star
              className={cn('h-4 w-4', isFavorite && 'fill-yellow-500 text-yellow-500')}
            />
          </Button>
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-[var(--space-2)]">
            {activePrompt.title[language]}
          </h3>
          <p className="text-sm text-zinc-400 line-clamp-3">
            {activePrompt.description[language]}
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {activePrompt.categories?.map((category) => (
            <Badge
              key={category.id}
              variant="secondary"
              className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            >
              {category.name[language]}
            </Badge>
          ))}
        </div>

        {/* Tools */}
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {activePrompt.tools?.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center gap-[var(--space-1)] rounded-full border border-zinc-800 bg-zinc-900 px-[var(--space-2)] py-[var(--space-1)] text-xs text-zinc-400"
            >
              <img
                src={tool.iconUrl}
                alt={tool.name}
                className="h-4 w-4 rounded-full"
              />
              <span>{tool.name}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="mt-auto px-[var(--space-4)] py-[var(--space-3)] bg-zinc-900/50 border-t border-zinc-800 gap-[var(--space-4)]">
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <BarChart2 className="h-4 w-4 mr-[var(--space-1)]" />
          <span>{activePrompt.usesCount}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-zinc-400 hover:text-white hover:bg-zinc-800 ml-auto",
            copied && "text-green-500"
          )}
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4 mr-[var(--space-1)]" />
          <span>{copied ? (language === 'en' ? 'Copied!' : 'تم النسخ!') : (language === 'en' ? 'Copy' : 'نسخ')}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
