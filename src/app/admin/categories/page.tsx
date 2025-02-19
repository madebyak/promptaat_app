'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { Search, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { CategoryTable } from '@/components/categories/CategoryTable';
import { Category, CreateCategoryInput } from '@/types/category';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import { Loader2 } from 'lucide-react';

function CategoriesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

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

  // Transform categories for parent selection
  const parentCategoryOptions = categories
    .filter(cat => !cat.parent_category_id) // Only top-level categories
    .map(cat => ({
      label: cat.name_en,
      value: cat.id.toString()
    }));

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/categories?page=${currentPage}&pageSize=${pageSize}&search=${searchQuery}`
      );
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data.categories);
        setTotalItems(data.data.total);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  // Fetch categories on mount and when pagination/search changes
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle category creation
  const handleCreateCategory = async (data: CreateCategoryInput) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Category created successfully');
        setIsAddModalOpen(false);
        fetchCategories();
      } else {
        toast.error(result.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  // Handle category update
  const handleUpdateCategory = async (id: number, data: Partial<Category>) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Category updated successfully');
        setSelectedCategory(null);
        fetchCategories();
      } else {
        toast.error(result.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        toast.error(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  // Handle order change
  const handleOrderChange = async (updates: Array<{ id: number; order: number }>) => {
    try {
      const response = await fetch(`/api/admin/categories/order`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to update order');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
      fetchCategories();
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Debounced search handler
  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, 300);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-green-500 hover:bg-green-600">
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search categories..."
            className="pl-10"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2">
              Sort by
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
            <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
            <DropdownMenuItem>Latest</DropdownMenuItem>
            <DropdownMenuItem>Oldest</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <>
          <CategoryTable
            categories={categories}
            onEdit={setSelectedCategory}
            onDelete={handleDeleteCategory}
            onOrderChange={handleOrderChange}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / pageSize)}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleCreateCategory}
            onCancel={() => setIsAddModalOpen(false)}
            parentCategories={parentCategoryOptions}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <CategoryForm
              onSubmit={(data) => handleUpdateCategory(selectedCategory.id, data)}
              onCancel={() => setSelectedCategory(null)}
              initialData={selectedCategory}
              parentCategories={parentCategoryOptions.filter(opt => opt.value !== selectedCategory.id.toString())}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
}
