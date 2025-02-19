'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Search, Plus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PromptTable } from '@/components/prompts/PromptTable';
import { PromptForm } from '@/components/prompts/PromptForm';
import { Prompt, PromptType } from '@/types/prompt';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';

export default function PromptsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedPrompts, setSelectedPrompts] = useState<number[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Fetch prompts
  const fetchPrompts = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        search: searchQuery,
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(selectedCategories.length && {
          categories: selectedCategories.join(','),
        }),
        ...(selectedTools.length && { tools: selectedTools.join(',') }),
      });

      const response = await fetch(`/api/admin/prompts?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch prompts');
      }

      setPrompts(data.data.prompts);
      setTotalItems(data.data.total);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch prompts');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedType, selectedCategories, selectedTools]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPrompts();
    }
  }, [fetchPrompts, status]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const handleSelectPrompt = (id: number) => {
    setSelectedPrompts((prev) =>
      prev.includes(id)
        ? prev.filter((promptId) => promptId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedPrompts((prev) =>
      prev.length === prompts.length ? [] : prompts.map((p) => p.id)
    );
  };

  const handleDelete = async (prompt: Prompt) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const response = await fetch(`/api/admin/prompts/${prompt.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete prompt');
      }

      toast.success('Prompt deleted successfully');
      fetchPrompts();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete prompt');
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedPrompts.length) return;
    if (!confirm('Are you sure you want to delete the selected prompts?')) return;

    try {
      const response = await fetch('/api/admin/prompts/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedPrompts }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete prompts');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete prompts');
      }

      toast.success('Prompts deleted successfully');
      setSelectedPrompts([]);
      fetchPrompts();
    } catch (error) {
      console.error('Error deleting prompts:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete prompts');
    }
  };

  const handleFormSuccess = () => {
    setIsAddModalOpen(false);
    setSelectedPrompt(null);
    fetchPrompts();
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
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search prompts..."
              className="h-9 w-[250px] bg-zinc-900 border-zinc-800 text-white"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
            <Search className="h-4 w-4 text-zinc-400" />
          </div>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[150px] bg-zinc-900 border-zinc-800 text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.values(PromptType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add Category and Tool filters here */}
        </div>

        <div className="flex items-center space-x-2">
          {selectedPrompts.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedPrompts.length})
            </Button>
          )}
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      ) : (
        <>
          <PromptTable
            prompts={prompts}
            selectedPrompts={selectedPrompts}
            onSelectPrompt={handleSelectPrompt}
            onSelectAll={handleSelectAll}
            onEdit={setSelectedPrompt}
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
        open={isAddModalOpen || !!selectedPrompt}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setSelectedPrompt(null);
          }
        }}
      >
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPrompt ? 'Edit Prompt' : 'Add New Prompt'}
            </DialogTitle>
          </DialogHeader>
          <PromptForm
            prompt={selectedPrompt || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsAddModalOpen(false);
              setSelectedPrompt(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
