'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SegmentOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  // Track the container width for the sliding animation
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeWidth, setActiveWidth] = React.useState(0);
  const [activeLeft, setActiveLeft] = React.useState(0);

  // Update active segment position and width
  React.useEffect(() => {
    const activeIndex = options.findIndex(option => option.value === value);
    if (containerRef.current && activeIndex !== -1) {
      const buttons = containerRef.current.querySelectorAll('button');
      const activeButton = buttons[activeIndex];
      if (activeButton) {
        setActiveWidth(activeButton.offsetWidth);
        setActiveLeft(activeButton.offsetLeft);
      }
    }
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex p-1 bg-zinc-900 rounded-lg",
        className
      )}
    >
      {/* Animated background */}
      <div
        className="absolute h-8 bg-zinc-800 rounded-md transition-all duration-300 ease-[cubic-bezier(0.785, 0.135, 0.15, 0.86)]"
        style={{
          width: activeWidth,
          left: activeLeft,
        }}
      />

      {/* Buttons */}
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "relative z-10 px-4 h-8 text-sm font-medium rounded-md transition-colors duration-200",
            value === option.value ? "text-white" : "text-zinc-400 hover:text-zinc-300"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
