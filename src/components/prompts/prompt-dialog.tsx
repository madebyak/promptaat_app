import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Copy } from 'lucide-react';
import { Prompt } from '@/types';
import { useTheme } from '@/lib/theme';

interface PromptDialogProps {
  prompt: Prompt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: () => void;
}

export function PromptDialog({
  prompt,
  open,
  onOpenChange,
  onCopy,
}: PromptDialogProps) {
  const { language } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{prompt.title[language]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="mb-2 font-medium">Category</h4>
            <p className="text-sm text-muted-foreground">
              {prompt.category} / {prompt.subcategory}
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">
              {prompt.description[language]}
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Prompt</h4>
            <div className="relative rounded-lg bg-muted p-4">
              <pre className="text-sm">{prompt.promptText}</pre>
              <Button
                size="sm"
                className="absolute right-2 top-2"
                onClick={onCopy}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Instructions</h4>
            <p className="text-sm text-muted-foreground">
              {prompt.instructions[language]}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex-1">
              <h4 className="mb-2 font-medium">Tools</h4>
              <div className="flex flex-wrap gap-2">
                {prompt.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <h4 className="mb-2 font-medium">Usage</h4>
              <p className="text-sm text-muted-foreground">
                Used {prompt.usageCount} times
              </p>
            </div>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Created: {prompt.createdAt.toLocaleDateString()}</span>
            <span>Updated: {prompt.updatedAt.toLocaleDateString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
