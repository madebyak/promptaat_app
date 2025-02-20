import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserBulkActionsProps {
  selectedUsers: number[];
  onSuccess: () => void;
}

export function UserBulkActions({ selectedUsers, onSuccess }: UserBulkActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'export':
          response = await fetch('/api/admin/users/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userIds: selectedUsers }),
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'users-export.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Users exported successfully');
          } else {
            throw new Error('Failed to export users');
          }
          break;

        case 'add-pro':
          response = await fetch('/api/admin/users/bulk-membership', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userIds: selectedUsers,
              action: 'add',
              planName: '1_month'
            }),
          });
          if (response.ok) {
            toast.success('Pro membership added successfully');
            onSuccess();
          } else {
            throw new Error('Failed to add pro membership');
          }
          break;

        case 'remove-pro':
          response = await fetch('/api/admin/users/bulk-membership', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userIds: selectedUsers,
              action: 'remove'
            }),
          });
          if (response.ok) {
            toast.success('Pro membership removed successfully');
            onSuccess();
          } else {
            throw new Error('Failed to remove pro membership');
          }
          break;
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading || selectedUsers.length === 0}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Bulk Actions ({selectedUsers.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleBulkAction('export')}>
          Export Selected
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleBulkAction('add-pro')}>
          Add Pro Membership
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleBulkAction('remove-pro')}>
          Remove Pro Membership
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
