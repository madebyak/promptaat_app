'use client';

import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronRight, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Category } from '@/types/category';

interface DraggableCategoryRowProps {
  category: Category;
  level: number;
  hasSubcategories: boolean;
  isExpanded: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onToggleExpand: (id: number) => void;
}

export function DraggableCategoryRow({
  category,
  level,
  hasSubcategories,
  isExpanded,
  onEdit,
  onDelete,
  onToggleExpand,
}: DraggableCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'bg-accent/50' : undefined}
    >
      <TableCell className="w-[100px]">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-6 w-6 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
          <span className="text-sm text-muted-foreground">{category.order}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <div style={{ marginLeft: `${level * 24}px` }} className="flex items-center">
            {hasSubcategories && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6 w-6"
                onClick={() => onToggleExpand(category.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            {!hasSubcategories && <div className="w-6" />}
            <span>{category.name_en}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>{category.name_ar}</TableCell>
      <TableCell>{category.description}</TableCell>
      <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
      <TableCell>{new Date(category.updated_at).toLocaleDateString()}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category.id)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
