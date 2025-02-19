'use client';

import * as React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Category } from '@/types/category';
import { toast } from 'sonner';
import { DraggableCategoryRow } from './DraggableCategoryRow';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => Promise<void>;
  onOrderChange: (updates: Array<{ id: number; order: number }>) => Promise<void>;
}

interface CategoryWithSubcategories extends Category {
  subcategories?: CategoryWithSubcategories[];
  isExpanded?: boolean;
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  onOrderChange,
}: CategoryTableProps) {
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [expandedCategories, setExpandedCategories] = React.useState<Set<number>>(new Set());
  const [activeId, setActiveId] = React.useState<number | null>(null);
  const [items, setItems] = React.useState<CategoryWithSubcategories[]>(categories);

  // Update items when categories prop changes
  React.useEffect(() => {
    setItems(categories);
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await onDelete(deleteId);
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const toggleExpand = (categoryId: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Create new array with updated orders
    const updates = items.map((item, index) => {
      if (index === oldIndex) {
        return { ...item, order: items[newIndex].order };
      }
      if (index === newIndex) {
        return { ...item, order: items[oldIndex].order };
      }
      return item;
    });

    // Update local state
    setItems(updates);

    // Send updates to server
    try {
      await onOrderChange(
        updates.map(item => ({
          id: item.id,
          order: item.order,
        }))
      );
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
      // Revert to original order
      setItems(categories);
    }

    setActiveId(null);
  };

  const renderCategoryRow = (category: CategoryWithSubcategories, level: number = 0) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <React.Fragment key={category.id}>
        <DraggableCategoryRow
          category={category}
          level={level}
          hasSubcategories={hasSubcategories}
          isExpanded={isExpanded}
          onEdit={onEdit}
          onDelete={setDeleteId}
          onToggleExpand={toggleExpand}
        />
        {hasSubcategories && isExpanded && (
          category.subcategories?.map(subcategory => 
            renderCategoryRow(subcategory, level + 1)
          )
        )}
      </React.Fragment>
    );
  };

  return (
    <>
      <div className="rounded-md border border-[#2D2D3B] bg-[#1C1C28]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <Table>
            <TableHeader>
              <TableRow className="border-[#2D2D3B] hover:bg-transparent">
                <TableHead className="w-[100px]">Order</TableHead>
                <TableHead>Category Name (EN)</TableHead>
                <TableHead>Category Name (AR)</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map(category => renderCategoryRow(category as CategoryWithSubcategories))}
              </SortableContext>
            </TableBody>
          </Table>

          <DragOverlay>
            {activeId ? (
              <div className="rounded-md border bg-background shadow-lg">
                <Table>
                  <TableBody>
                    {renderCategoryRow(
                      items.find(item => item.id === activeId) as CategoryWithSubcategories
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#1C1C28] border-[#2D2D3B] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-[#2D2D3B] text-gray-400 hover:bg-[#2D2D3B] hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
