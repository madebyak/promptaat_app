'use client';

import { SegmentedControl } from '@/components/ui/segmented-control';
import { PromptType } from '@/hooks/use-prompt-filters';
import { useTheme } from '@/lib/theme';

interface TypeToggleProps {
  value: PromptType;
  onChange: (value: PromptType) => void;
}

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  const { language } = useTheme();

  const options = [
    {
      value: 'all',
      label: language === 'en' ? 'All' : 'الكل',
    },
    {
      value: 'free',
      label: language === 'en' ? 'Free' : 'مجاني',
    },
    {
      value: 'pro',
      label: language === 'en' ? 'Pro' : 'مدفوع',
    },
  ];

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(v) => onChange(v as PromptType)}
      className="min-w-[200px]"
    />
  );
}
