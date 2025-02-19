'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTools } from '@/hooks/use-tools';
import { useTheme } from '@/lib/theme';
import { Loader2, X } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ToolSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTools: string[];
  onSelectedToolsChange: (tools: string[]) => void;
}

export function ToolSelectionModal({
  open,
  onOpenChange,
  selectedTools,
  onSelectedToolsChange,
}: ToolSelectionModalProps) {
  const { tools, isLoading } = useTools();
  const { language } = useTheme();
  const [localSelection, setLocalSelection] = useState<string[]>(selectedTools);

  // Reset local selection when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalSelection(selectedTools);
    }
    onOpenChange(newOpen);
  };

  const handleToolToggle = (toolId: string) => {
    setLocalSelection((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleApply = () => {
    onSelectedToolsChange(localSelection);
    onOpenChange(false);
  };

  const handleClear = () => {
    setLocalSelection([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {language === 'en' ? 'Filter by Tools' : 'تصفية حسب الأدوات'}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : (
          <>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {tools.map((tool) => {
                  const Icon = Icons[tool.icon as keyof typeof Icons] || Icons.Box;
                  return (
                    <div
                      key={tool.id}
                      className="flex items-center space-x-3 rtl:space-x-reverse"
                    >
                      <Checkbox
                        id={tool.id}
                        checked={localSelection.includes(tool.id)}
                        onCheckedChange={() => handleToolToggle(tool.id)}
                        className="border-zinc-700 data-[state=checked]:bg-zinc-700 data-[state=checked]:border-zinc-700"
                      />
                      <label
                        htmlFor={tool.id}
                        className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <Icon className="h-4 w-4 text-zinc-400" />
                        <span>{language === 'en' ? tool.name : tool.nameAr}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex justify-between mt-6 gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Clear' : 'مسح'}
              </Button>
              <Button size="sm" onClick={handleApply}>
                {language === 'en' ? 'Apply Filters' : 'تطبيق التصفية'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
