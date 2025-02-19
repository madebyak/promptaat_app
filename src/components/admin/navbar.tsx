'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-[#1C1C28] border-b border-[#2D2D3B]">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-medium text-gray-200">Dashboard</h1>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-gray-400 hover:text-white hover:bg-[#2D2D3B] transition-colors"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </header>
  );
}
