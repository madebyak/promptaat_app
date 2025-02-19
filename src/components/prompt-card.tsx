'use client';

import { Button } from '@/components/ui/button';
import { Copy, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTheme } from '@/lib/theme';
import { SaveToCatalogDialog } from '@/app/account/components/save-to-catalog-dialog';

interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    description: string;
    type: 'free' | 'pro';
    tags: string[];
    tools: string[];
    uses: number;
    content?: string;
  };
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const { language } = useTheme();

  const handleCopy = async () => {
    if (!prompt.content) return;
    
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="group rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span 
            className={cn(
              "text-xs font-medium px-2 py-1 rounded",
              prompt.type === 'free' 
                ? "text-emerald-500 bg-emerald-500/10" 
                : "text-purple-500 bg-purple-500/10"
            )}
          >
            {prompt.type.charAt(0).toUpperCase() + prompt.type.slice(1)}
          </span>
          {prompt.tags.map((tag) => (
            <span key={tag} className="text-xs text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-white"
            onClick={() => setSaveDialogOpen(true)}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          {prompt.content && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <h3 className="font-semibold text-card-foreground">{prompt.title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{prompt.description}</p>
      <div className="flex items-center gap-2 mt-4">
        {prompt.tools.map((tool) => (
          <span key={tool} className="text-xs text-muted-foreground">
            {tool}
          </span>
        ))}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {prompt.uses.toLocaleString()} {language === 'en' ? 'uses' : 'استخدام'}
      </div>

      <SaveToCatalogDialog
        promptId={prompt.id}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />
    </div>
  );
}
