'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { ToolSelectionModal } from './tool-selection-modal';

interface FilterButtonProps {
  selectedTools: string[];
  onSelectedToolsChange: (tools: string[]) => void;
}

export function FilterButton({
  selectedTools,
  onSelectedToolsChange,
}: FilterButtonProps) {
  const [open, setOpen] = useState(false);
  const { language } = useTheme();

  return (
    <>
      <Button
        variant="outline"
        size="default"
        onClick={() => setOpen(true)}
        className={`
          flex items-center gap-2 bg-zinc-900 border-zinc-800 
          hover:bg-zinc-800 hover:text-white remove-focus-styles
          ${selectedTools.length > 0 ? 'text-white' : 'text-zinc-400'}
        `}
      >
        <Filter className="h-4 w-4" />
        <span>
          {language === 'en' ? 'Filter' : 'تصفية'}
          {selectedTools.length > 0 && ` (${selectedTools.length})`}
        </span>
      </Button>

      <ToolSelectionModal
        open={open}
        onOpenChange={setOpen}
        selectedTools={selectedTools}
        onSelectedToolsChange={onSelectedToolsChange}
      />
    </>
  );
}
