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
    console.log('Categories - Session:', session); // Debug log
    console.log('Categories - Status:', status); // Debug log

    if (status === 'unauthenticated') {
      console.log('Categories - Not authenticated, redirecting to login'); // Debug log
      router.replace('/admin/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      console.log('Categories - Not admin, redirecting to home'); // Debug log
      router.replace('/');
      return;
    }
  }, [status, session, router]);

  // Show loading state while checking session
  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#151521]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Show categories only if authenticated as admin
  if (session?.user?.role === 'admin') {
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
    const handleUpdateCategory = async (data: CreateCategoryInput) => {
      if (!selectedCategory) return;

      try {
        const response = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
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

    // Handle order update
    const handleOrderUpdate = async (updates: Array<{ id: number; order: number }>) => {
      try {
        const response = await fetch('/api/admin/categories/order', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ updates }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success('Category order updated successfully');
          fetchCategories();
        } else {
          toast.error(result.error || 'Failed to update category order');
        }
      } catch (error) {
        console.error('Error updating category order:', error);
        toast.error('Failed to update category order');
      }
    };

    // Handle search input change
    const handleSearchChange = debounce((value: string) => {
      setSearchQuery(value);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Categories</h1>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white text-black hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              className="pl-10 bg-[#151521] border-[#2D2D3B] text-white"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-[#151521] border-[#2D2D3B] text-white">
                {pageSize} per page <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1C1C28] border-[#2D2D3B]">
              {[10, 20, 30, 40, 50].map((size) => (
                <DropdownMenuItem
                  key={size}
                  className="text-white hover:bg-[#2D2D3B]"
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                >
                  {size} per page
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="bg-[#1C1C28] rounded-lg border border-[#2D2D3B] overflow-hidden">
          <CategoryTable
            categories={categories}
            onEdit={setSelectedCategory}
            onDelete={handleDeleteCategory}
            onOrderChange={handleOrderUpdate}
          />
        </div>

        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </div>

        <Dialog open={isAddModalOpen || !!selectedCategory} onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setSelectedCategory(null);
          }
        }}>
          <DialogContent className="bg-[#1C1C28] border-[#2D2D3B] text-white">
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Category' : 'Add Category'}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              initialData={selectedCategory || undefined}
              parentCategories={parentCategoryOptions}
              onSubmit={selectedCategory ? handleUpdateCategory : handleCreateCategory}
              onCancel={() => {
                setIsAddModalOpen(false);
                setSelectedCategory(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Redirect to login for any other case
  router.replace('/admin/login');
  return null;
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#151521]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
}
