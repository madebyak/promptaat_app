'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ToolForm } from '@/components/tools/ToolForm';
import { ToolTable } from '@/components/tools/ToolTable';
import { Tool, CreateToolInput } from '@/types/tool';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';

export default function ToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Fetch tools
  const fetchTools = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/tools?page=${currentPage}&pageSize=${pageSize}&search=${searchQuery}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tools');
      }

      setTools(data.data);
      setTotalItems(data.total);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch tools');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTools();
    }
  }, [fetchTools, status]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  const handleCreate = async (data: CreateToolInput) => {
    try {
      const response = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create tool');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to create tool');
      }

      toast.success('Tool created successfully');
      setIsAddModalOpen(false);
      fetchTools();
    } catch (error) {
      console.error('Error creating tool:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create tool');
    }
  };

  const handleEdit = async (data: CreateToolInput) => {
    if (!selectedTool) return;

    try {
      const response = await fetch(`/api/admin/tools/${selectedTool.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update tool');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update tool');
      }

      toast.success('Tool updated successfully');
      setSelectedTool(null);
      fetchTools();
    } catch (error) {
      console.error('Error updating tool:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update tool');
    }
  };

  const handleDelete = async (tool: Tool) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    try {
      const response = await fetch(`/api/admin/tools/${tool.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tool');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete tool');
      }

      toast.success('Tool deleted successfully');
      fetchTools();
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete tool');
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search tools..."
            className="h-9 w-[250px] bg-zinc-900 border-zinc-800 text-white"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-zinc-800 hover:bg-zinc-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      ) : (
        <>
          <ToolTable
            tools={tools}
            onEdit={setSelectedTool}
            onDelete={handleDelete}
          />
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <Dialog
        open={isAddModalOpen || !!selectedTool}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setSelectedTool(null);
          }
        }}
      >
        <DialogContent className="bg-zinc-900 text-white border-zinc-800">
          <DialogHeader>
            <DialogTitle>
              {selectedTool ? 'Edit Tool' : 'Add New Tool'}
            </DialogTitle>
          </DialogHeader>
          <ToolForm
            defaultValues={selectedTool || undefined}
            onSubmit={selectedTool ? handleEdit : handleCreate}
            onCancel={() => {
              setIsAddModalOpen(false);
              setSelectedTool(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
