'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiCombobox } from '@/components/ui/multi-combobox';
import { categorySchema, type CreateCategoryInput } from '@/types/category';
import { toast } from 'sonner';

interface CategoryFormProps {
  initialData?: Partial<CreateCategoryInput>;
  parentCategories: Array<{ label: string; value: string }>;
  onSubmit: (data: CreateCategoryInput) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({
  initialData,
  parentCategories,
  onSubmit,
  onCancel
}: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedParents, setSelectedParents] = useState<Array<{ label: string; value: string }>>(
    initialData?.parent_category_id 
      ? parentCategories.filter(cat => cat.value === initialData.parent_category_id.toString())
      : []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name_en: initialData?.name_en || '',
      name_ar: initialData?.name_ar || '',
      description: initialData?.description || '',
      order: initialData?.order || 1,
      parent_category_id: initialData?.parent_category_id || null,
    }
  });

  const onFormSubmit = async (data: CreateCategoryInput) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast.success('Category saved successfully');
      onCancel();
    } catch (error) {
      toast.error('Failed to save category');
      console.error('Error saving category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Order</label>
        <Input
          type="number"
          min={1}
          {...register('order', { valueAsNumber: true })}
          className="w-full bg-[#151521] border-[#2D2D3B] text-white"
        />
        {errors.order && (
          <p className="text-xs text-red-400">{errors.order.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Category Name (EN)</label>
        <Input
          {...register('name_en')}
          placeholder="Enter category name in English"
          className="bg-[#151521] border-[#2D2D3B] text-white"
        />
        {errors.name_en && (
          <p className="text-xs text-red-400">{errors.name_en.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Category Name (AR)</label>
        <Input
          {...register('name_ar')}
          placeholder="Enter category name in Arabic"
          className="bg-[#151521] border-[#2D2D3B] text-white text-right"
          dir="rtl"
        />
        {errors.name_ar && (
          <p className="text-xs text-red-400">{errors.name_ar.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Parent Category</label>
        <MultiCombobox
          options={parentCategories}
          selected={selectedParents}
          onChange={(selected) => {
            setSelectedParents(selected);
            setValue(
              'parent_category_id',
              selected.length > 0 ? parseInt(selected[0].value) : null
            );
          }}
          placeholder="Search and select a parent category..."
        />
        {selectedParents.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            This will be a subcategory under the selected category
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Description (Optional)</label>
        <textarea
          {...register('description')}
          className="w-full min-h-[100px] rounded-md bg-[#151521] border border-[#2D2D3B] text-white p-3"
          placeholder="Enter category description"
        />
        {errors.description && (
          <p className="text-xs text-red-400">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-[#2D2D3B] text-gray-400 hover:bg-[#2D2D3B] hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          {isSubmitting ? 'Saving...' : 'Save Category'}
        </Button>
      </div>
    </form>
  );
}
