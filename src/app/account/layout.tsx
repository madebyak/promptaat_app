import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { User, Settings, Bookmark, CreditCard, LogOut } from 'lucide-react';

const sidebarItems = [
  {
    title: 'MY ACCOUNT',
    icon: User,
    href: '/account',
  },
  {
    title: 'MY PROMPTS',
    icon: Bookmark,
    href: '/account/prompts',
  },
  {
    title: 'SUBSCRIPTION',
    icon: CreditCard,
    href: '/account/subscription',
  },
  {
    title: 'SETTINGS',
    icon: Settings,
    href: '/account/settings',
  },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <div className="w-full px-4 bg-black_main">
      <div className="flex gap-4">
        {/* Sidebar */}
        <aside className="w-64 shrink-0">
          <div className="rounded-lg bg-dark_grey p-4 mt-4">
            <div className="mb-2">
              <h2 className="text-sm font-medium text-light_grey px-3 py-2">MY ACCOUNT</h2>
            </div>
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-light_grey transition-all hover:text-white hover:bg-mid_grey"
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
              <div className="pt-4">
                <Link
                  href="/auth/signout"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-all hover:text-red-300 hover:bg-mid_grey"
                >
                  <LogOut className="h-4 w-4" />
                  LOG OUT
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="h-full rounded-lg bg-dark_grey p-6 mt-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
