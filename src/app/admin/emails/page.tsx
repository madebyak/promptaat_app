'use client';

import { useState, Suspense, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  useQuery, 
  QueryClient, 
  QueryClientProvider 
} from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Create a client
const queryClient = new QueryClient();

interface EmailLog {
  id: number;
  type: string;
  recipient: string;
  status: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  dailyStats: {
    date: string;
    count: number;
  }[];
  typeStats: {
    type: string;
    count: number;
  }[];
}

function EmailDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState({
    type: 'all',
    status: 'all',
    search: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return null;
  }

  const { data: emailLogs, isLoading: logsLoading } = useQuery<EmailLog[]>({
    queryKey: ['emailLogs', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.type !== 'all') params.append('type', filter.type);
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);
      
      const response = await fetch(`/api/admin/emails?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch email logs');
      return response.json();
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery<EmailStats>({
    queryKey: ['emailStats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/emails/stats');
      if (!response.ok) throw new Error('Failed to fetch email stats');
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Email Dashboard</h1>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Emails</CardTitle>
              <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Success Rate</CardTitle>
              <CardDescription>Sent vs Failed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {((stats.sent / stats.total) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Today's Emails</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {stats.dailyStats[stats.dailyStats.length - 1]?.count || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by email..."
          className="max-w-xs"
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
        <Select
          value={filter.type}
          onValueChange={(value) => setFilter({ ...filter, type: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="verification">Verification</SelectItem>
            <SelectItem value="reset_password">Password Reset</SelectItem>
            <SelectItem value="welcome">Welcome</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filter.status}
          onValueChange={(value) => setFilter({ ...filter, status: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Email Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Logs</CardTitle>
          <CardDescription>
            View and filter all email communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!logsLoading &&
                emailLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {log.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.recipient}</TableCell>
                    <TableCell>
                      {log.user.firstName} {log.user.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmailDashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }>
        <EmailDashboardContent />
      </Suspense>
    </QueryClientProvider>
  );
}
