'use client';

import { useEffect, useState, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { promptSchema } from '@/types/prompt';
import type { PromptFormValues } from '@/types/prompt';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { ChevronsUpDown } from 'lucide-react';
import ReactSelect from "react-select";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name_en: string;
  name_ar: string;
  subcategories?: Category[];
}

interface Tool {
  id: number;
  name_en: string;
  name_ar: string;
  icon_url: string;
}

interface PromptFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function PromptForm({
  initialData,
  onSuccess,
}: PromptFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);

  // Initialize form with initial data
  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      title_en: "",
      title_ar: "",
      description_en: "",
      description_ar: "",
      instructions_en: "",
      instructions_ar: "",
      type: "Free",
      initial_uses_counter: 0,
      category_ids: [],
      tool_ids: [],
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    console.log('Initial Data received:', initialData); // Debug log

    if (initialData) {
      // Extract category and tool IDs from the initial data
      const categoryIds = initialData.categories?.map((cat: any) => cat.id) || [];
      const toolIds = initialData.tools?.map((tool: any) => tool.id) || [];

      // Set selected categories and tools
      setSelectedCategories(initialData.categories || []);
      setSelectedTools(initialData.tools || []);

      form.reset({
        title_en: initialData.title_en,
        title_ar: initialData.title_ar,
        description_en: initialData.description_en,
        description_ar: initialData.description_ar,
        instructions_en: initialData.instructions_en,
        instructions_ar: initialData.instructions_ar,
        type: initialData.type,
        initial_uses_counter: initialData.uses_counter,
        category_ids: categoryIds,
        tool_ids: toolIds,
      });
    }
  }, [initialData, form]);

  // Fetch categories and tools
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [categoriesRes, toolsRes] = await Promise.all([
          fetch('/api/admin/categories?pageSize=100'), // Get all categories
          fetch('/api/admin/tools')
        ]);

        if (!categoriesRes.ok || !toolsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const categoriesData = await categoriesRes.json();
        const toolsData = await toolsRes.json();

        console.log('Fetched categories:', categoriesData); // Debug log
        console.log('Fetched tools:', toolsData); // Debug log

        if (categoriesData.success) {
          setCategories(categoriesData.data.categories || []);
        }
        if (toolsData.success) {
          setTools(toolsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast.error('Failed to load form data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform categories for the select component
  const categoryOptions = useMemo(() => {
    const flattenCategories = (categories: Category[], prefix = '') => {
      return categories.reduce<any[]>((acc, category) => {
        // Add main category
        acc.push({
          value: category.id,
          label: prefix + category.name_en,
          data: category
        });

        // Add subcategories if they exist
        if (category.subcategories?.length) {
          acc.push(...flattenCategories(category.subcategories, `${prefix}↳ `));
        }

        return acc;
      }, []);
    };

    return flattenCategories(categories);
  }, [categories]);

  // Transform tools for the select component
  const toolOptions = useMemo(() => {
    return tools.map((tool) => ({
      value: tool.id,
      label: tool.name_en,
      data: tool
    }));
  }, [tools]);

  const onSubmit = async (data: PromptFormValues) => {
    try {
      setIsLoading(true);
      console.log('Submitting form data:', data); // Debug log

      const endpoint = initialData 
        ? `/api/admin/prompts/${initialData.id}`
        : '/api/admin/prompts';

      const response = await fetch(endpoint, {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save prompt');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(initialData ? 'Prompt updated successfully' : 'Prompt created successfully');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(result.error || 'Failed to save prompt');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save prompt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Title (English)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter title in English"
                    className="bg-[#151521] border-[#2D2D3B] text-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Title (Arabic)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter title in Arabic"
                    className="bg-[#151521] border-[#2D2D3B] text-white text-right"
                    dir="rtl"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="description_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Description (English)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter description in English"
                    className="bg-[#151521] border-[#2D2D3B] text-white min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Description (Arabic)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter description in Arabic"
                    className="bg-[#151521] border-[#2D2D3B] text-white text-right min-h-[100px]"
                    dir="rtl"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="instructions_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Instructions (English)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter instructions in English"
                    className="bg-[#151521] border-[#2D2D3B] text-white min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instructions_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Instructions (Arabic)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter instructions in Arabic"
                    className="bg-[#151521] border-[#2D2D3B] text-white text-right min-h-[100px]"
                    dir="rtl"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Type</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="bg-[#151521] border-[#2D2D3B] text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#1C1C28] border-[#2D2D3B]">
                    <SelectItem value="Free" className="text-white hover:bg-[#2D2D3B]">Free</SelectItem>
                    <SelectItem value="Premium" className="text-white hover:bg-[#2D2D3B]">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="initial_uses_counter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Initial Uses Counter</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="bg-[#151521] border-[#2D2D3B] text-white"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category_ids"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Categories</FormLabel>
                <FormControl>
                  <ReactSelect
                    isMulti
                    options={categoryOptions}
                    value={categoryOptions.filter(option => 
                      field.value.includes(option.value)
                    )}
                    onChange={(newValue) => {
                      field.onChange(newValue ? newValue.map(item => item.value) : []);
                    }}
                    className="bg-[#151521] border-[#2D2D3B]"
                    classNames={{
                      control: (state) => 
                        cn(
                          "!bg-[#151521] !border-[#2D2D3B] !text-white hover:!border-[#2D2D3B]",
                          state.isFocused && "!border-[#2D2D3B] !shadow-none"
                        ),
                      menu: () => "!bg-[#1C1C28] !border !border-[#2D2D3B]",
                      option: (state) => 
                        cn(
                          "!text-white",
                          state.isFocused && "!bg-[#2D2D3B]",
                          state.isSelected && "!bg-[#2D2D3B]"
                        ),
                      multiValue: () => "!bg-[#2D2D3B] !text-white",
                      multiValueLabel: () => "!text-white",
                      multiValueRemove: () => "!text-white hover:!bg-[#3D3D4B]",
                      placeholder: () => "!text-gray-400",
                    }}
                    isLoading={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tool_ids"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Tools</FormLabel>
                <FormControl>
                  <ReactSelect
                    isMulti
                    options={toolOptions}
                    value={toolOptions.filter(option => 
                      field.value.includes(option.value)
                    )}
                    onChange={(newValue) => {
                      field.onChange(newValue ? newValue.map(item => item.value) : []);
                    }}
                    className="bg-[#151521] border-[#2D2D3B]"
                    classNames={{
                      control: (state) => 
                        cn(
                          "!bg-[#151521] !border-[#2D2D3B] !text-white hover:!border-[#2D2D3B]",
                          state.isFocused && "!border-[#2D2D3B] !shadow-none"
                        ),
                      menu: () => "!bg-[#1C1C28] !border !border-[#2D2D3B]",
                      option: (state) => 
                        cn(
                          "!text-white",
                          state.isFocused && "!bg-[#2D2D3B]",
                          state.isSelected && "!bg-[#2D2D3B]"
                        ),
                      multiValue: () => "!bg-[#2D2D3B] !text-white",
                      multiValueLabel: () => "!text-white",
                      multiValueRemove: () => "!text-white hover:!bg-[#3D3D4B]",
                      placeholder: () => "!text-gray-400",
                    }}
                    isLoading={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-white text-black hover:bg-zinc-200"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update' : 'Create'} Prompt
          </Button>
        </div>
      </form>
    </Form>
  );
}
