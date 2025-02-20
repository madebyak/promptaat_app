'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { UserDetailsModal } from '@/components/users/UserDetailsModal';
import { UserStatsPanel } from '@/components/users/UserStatsPanel';
import { UserFilters, type UserFilters as UserFiltersType } from '@/components/users/UserFilters';
import { UserBulkActions } from '@/components/users/UserBulkActions';
import { Checkbox } from '@/components/ui/checkbox';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string | null;
  emailVerified: boolean;
  createdAt: string;
  membership: {
    status: 'active' | 'expired' | null;
    planName: string | null;
    endDate: string | null;
  } | null;
}

interface UserStats {
  total: number;
  proUsers: number;
  freeUsers: number;
  verifiedUsers: number;
  countriesDistribution: { [key: string]: number };
  recentSignups: {
    date: string;
    count: number;
  }[];
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [filters, setFilters] = useState<UserFiltersType>({
    search: "",
    membership: "all",
    verificationStatus: "all",
    country: "all",
    dateRange: {
      from: null,
      to: null,
    },
    sortBy: "newest",
  });

  // Protect route
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          search: filters.search,
          membership: filters.membership,
          verificationStatus: filters.verificationStatus,
          country: filters.country,
          sort: filters.sortBy,
          includeStats: 'true',
          ...(filters.dateRange.from && { dateFrom: filters.dateRange.from.toISOString() }),
          ...(filters.dateRange.to && { dateTo: filters.dateRange.to.toISOString() }),
        });

        const response = await fetch(`/api/admin/users?${params}`);
        const data = await response.json();

        if (data.success) {
          setUsers(data.data.users);
          setTotalPages(Math.ceil(data.data.total / data.data.pageSize));
          setStats(data.data.stats);
          setCountries(data.data.countries);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, filters]);

  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setPage(1); // Reset to first page when filters change
    setFilters(newFilters);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkActionSuccess = () => {
    setSelectedUsers([]);
    fetchUsers();
  };

  const handleUserClick = async (userId: number) => {
    console.log('Opening user details:', userId); // Debug log
    setSelectedUserId(userId);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <UserBulkActions
          selectedUsers={selectedUsers}
          onSuccess={handleBulkActionSuccess}
        />
      </div>

      <UserStatsPanel stats={stats} loading={loading} />
      
      <Card className="p-6">
        <UserFilters
          onFiltersChange={handleFiltersChange}
          countries={countries}
        />
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleSelectUser(user.id, checked)}
                    />
                  </TableCell>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{user.email}</span>
                      <Badge variant={user.emailVerified ? "success" : "destructive"} className="w-fit">
                        {user.emailVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{user.country || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={user.emailVerified ? "success" : "destructive"}>
                      {user.emailVerified ? "Active" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.membership?.status === 'active' ? "success" : "secondary"}>
                      {user.membership?.status === 'active' ? `Pro (${user.membership.planName})` : 'Free'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUserClick(user.id)}
                      >
                        Manage
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {users.length} users shown
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <UserDetailsModal
        userId={selectedUserId}
        open={selectedUserId !== null}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}
