'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, FileText, Wrench } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1C1C28] border-[#2D2D3B] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <Users className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-semibold">1,234</span>
          </CardContent>
        </Card>

        <Card className="bg-[#1C1C28] border-[#2D2D3B] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Prompts</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <FileText className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-semibold">567</span>
          </CardContent>
        </Card>

        <Card className="bg-[#1C1C28] border-[#2D2D3B] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Tools</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <Wrench className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-semibold">24</span>
          </CardContent>
        </Card>

        <Card className="bg-[#1C1C28] border-[#2D2D3B] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Engagement</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <BarChart className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-semibold">82%</span>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-[#1C1C28] border-[#2D2D3B] text-white">
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Activity items will go here */}
            <p className="text-sm text-gray-400">Coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
