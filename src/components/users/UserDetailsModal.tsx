'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ProMembershipForm } from './ProMembershipForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

interface UserDetailsModalProps {
  userId: number | null;
  open: boolean;
  onClose: () => void;
}

interface UserDetails {
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
  activity: {
    lastLogin: string | null;
    totalLogins: number;
    lastActive: string | null;
  };
  emailLogs: {
    id: number;
    type: string;
    sentAt: string;
    status: string;
  }[];
}

export function UserDetailsModal({ userId, open, onClose }: UserDetailsModalProps) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    if (userId) {
      console.log('Fetching details for user:', userId); // Debug log
      fetchUserDetails();
    } else {
      setUser(null);
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new Error('Please log in again to continue');
          case 403:
            throw new Error('You do not have permission to view user details');
          case 404:
            throw new Error('User not found');
          default:
            throw new Error(data.error || `Error: ${response.status}`);
        }
      }
      
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch user details');
      }

      setUser(data.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast.error(error instanceof Error ? error.message : 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <p className="text-center text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => fetchUserDetails()}>
              Retry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleAction = async (action: string) => {
    if (!userId) return;

    setActionInProgress(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Action completed successfully');
        fetchUserDetails(); // Refresh user details
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;

    setActionInProgress(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        onClose();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    } finally {
      setActionInProgress(false);
      setDeleteDialogOpen(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>

          {!user ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
              <p>User not found</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="membership">Membership</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="emails">Emails</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Personal Information</h3>
                    <div className="mt-2 space-y-2">
                      <p>Name: {user.firstName} {user.lastName}</p>
                      <p>Email: {user.email}</p>
                      <p>Country: {user.country || 'N/A'}</p>
                      <p>Registered: {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Account Status</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <span>Verification:</span>
                        <Badge variant={user.emailVerified ? "success" : "destructive"}>
                          {user.emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Membership:</span>
                        <Badge variant={user.membership?.status === 'active' ? "success" : "secondary"}>
                          {user.membership?.status === 'active' ? `Pro (${user.membership.planName})` : 'Free'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <h3 className="font-medium">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {!user.emailVerified && (
                      <Button
                        variant="outline"
                        onClick={() => handleAction('verify')}
                        disabled={actionInProgress}
                      >
                        Verify Account
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleAction(user.emailVerified ? 'unverify' : 'verify')}
                      disabled={actionInProgress}
                    >
                      {user.emailVerified ? 'Remove Verification' : 'Verify Account'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={actionInProgress}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="membership">
                <ProMembershipForm
                  userId={user.id}
                  currentMembership={user.membership}
                  onSuccess={fetchUserDetails}
                />
              </TabsContent>

              <TabsContent value="activity">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Login Activity</h3>
                    <div className="mt-2 space-y-2">
                      <p>Last Login: {user.activity.lastLogin ? new Date(user.activity.lastLogin).toLocaleString() : 'Never'}</p>
                      <p>Total Logins: {user.activity.totalLogins}</p>
                      <p>Last Active: {user.activity.lastActive ? new Date(user.activity.lastActive).toLocaleString() : 'Never'}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="emails">
                <div className="space-y-4">
                  <h3 className="font-medium">Email History</h3>
                  {user.emailLogs.length === 0 ? (
                    <p className="text-muted-foreground">No email history found</p>
                  ) : (
                    <div className="space-y-2">
                      {user.emailLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{log.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(log.sentAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={log.status === 'delivered' ? 'success' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionInProgress}
            >
              {actionInProgress ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
