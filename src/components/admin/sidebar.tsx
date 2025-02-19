'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Folder, Wrench, FileText, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Categories', href: '/admin/categories', icon: Folder },
  { name: 'Tools', href: '/admin/tools', icon: Wrench },
  { name: 'Prompts', href: '/admin/prompts', icon: FileText },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#1C1C28] border-r border-[#2D2D3B] flex flex-col">
      <div className="h-14 flex items-center px-6 border-b border-[#2D2D3B]">
        <Image
          src="/Promptaat_logo_white.svg"
          alt="Promptaat Logo"
          width={120}
          height={30}
          className="h-6 w-auto"
        />
      </div>
      <nav className="flex-1 py-4">
        {navItems.map(({ name, href, icon: Icon }) => (
          <Link key={name} href={href}>
            <div
              className={cn(
                "flex items-center h-10 px-4 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-[#2D2D3B] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#2D2D3B]"
              )}
            >
              <Icon className="w-4 h-4 mr-3" />
              {name}
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
