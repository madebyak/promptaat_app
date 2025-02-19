'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-foreground hover:bg-accent"
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border">
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={`text-sm ${language === 'en' ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground hover:bg-accent cursor-pointer`}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('ar')}
          className={`text-sm ${language === 'ar' ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground hover:bg-accent cursor-pointer`}
        >
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
