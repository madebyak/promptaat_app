'use client';

import { useEffect, useState } from 'react';
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
}

export function PromptForm({
  initialData,
}: PromptFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      title_en: initialData?.title_en || "",
      title_ar: initialData?.title_ar || "",
      description_en: initialData?.description_en || "",
      description_ar: initialData?.description_ar || "",
      instructions_en: initialData?.instructions_en || "",
      instructions_ar: initialData?.instructions_ar || "",
      type: initialData?.type || "Free",
      initial_uses_counter: initialData?.initial_uses_counter || 0,
      category_ids: initialData?.category_ids || [],
      tool_ids: initialData?.tool_ids || [],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, toolsRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/tools'),
        ]);

        if (!categoriesRes.ok || !toolsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const categoriesData = await categoriesRes.json();
        const toolsData = await toolsRes.json();

        if (categoriesData.success) {
          // Get the categories array from the correct path in the response
          const mainCategories = categoriesData.data?.categories || [];
          setCategories(mainCategories);

          // If editing, set initial selected categories
          if (initialData?.categories) {
            const selectedCats = initialData.categories.map((cat: any) => ({
              id: cat.id,
              name_en: cat.name_en,
              name_ar: cat.name_ar,
              value: cat.id,
              label: cat.name_en
            }));
            setSelectedCategories(selectedCats);
          }
        }

        if (toolsData.success) {
          const tools = toolsData.data || [];
          setTools(tools);

          // If editing, set initial selected tools
          if (initialData?.tools) {
            const selectedTools = initialData.tools.map((tool: any) => ({
              id: tool.id,
              name_en: tool.name_en,
              name_ar: tool.name_ar,
              icon_url: tool.icon_url,
              value: tool.id,
              label: tool.name_en
            }));
            setSelectedTools(selectedTools);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch categories and tools');
      }
    };

    fetchData();
  }, [initialData]);

  // Update form values when selections change
  useEffect(() => {
    form.setValue('category_ids', selectedCategories.map(c => c.id));
  }, [selectedCategories, form]);

  useEffect(() => {
    form.setValue('tool_ids', selectedTools.map(t => t.id));
  }, [selectedTools, form]);

  const onSubmit = async (data: PromptFormValues) => {
    try {
      setIsLoading(true);
      console.log('Form data being sent:', data);
      
      if (initialData) {
        // Update prompt
        const response = await fetch(`/api/admin/prompts/${initialData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update prompt");
        }
      } else {
        // Create prompt
        const response = await fetch("/api/admin/prompts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create prompt");
        }
      }

      router.refresh();
      router.push("/admin/prompts");
      toast.success(initialData ? "Prompt updated!" : "Prompt created!");
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const customStyles = {
    control: (base: any) => ({
      ...base,
      background: '#18181b',
      borderColor: '#27272a',
      '&:hover': {
        borderColor: '#3f3f46'
      }
    }),
    menu: (base: any) => ({
      ...base,
      background: '#18181b',
      border: '1px solid #27272a'
    }),
    group: (base: any) => ({
      ...base,
      padding: 0,
      '& > div:first-of-type': {
        padding: '8px 12px',
        color: 'white',
        fontWeight: 600,
        fontSize: '0.95rem',
        backgroundColor: '#27272a',
        marginBottom: 0
      }
    }),
    groupHeading: (base: any) => ({
      ...base,
      marginBottom: 0,
      cursor: 'default',
      userSelect: 'none'
    }),
    option: (base: any, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected ? '#3f3f46' : state.isFocused ? '#27272a' : undefined,
      color: 'white',
      padding: '8px 12px',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#3f3f46'
      }
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: '#27272a'
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: 'white'
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: 'white',
      '&:hover': {
        backgroundColor: '#ef4444',
        color: 'white'
      }
    }),
    input: (base: any) => ({
      ...base,
      color: 'white'
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#71717a'
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'white'
    })
  };

  // Transform categories into grouped options
  const groupedCategories = categories.reduce((acc: any[], category: Category) => {
    if (category.subcategories && category.subcategories.length > 0) {
      acc.push({
        label: category.name_en,
        options: category.subcategories.map(sub => ({
          id: sub.id,
          name_en: `${sub.name_en}`,
          name_ar: sub.name_ar,
          value: sub.id,
          label: sub.name_en
        }))
      });
    }
    return acc;
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="title_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title (English)</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="Enter title in English"
                    {...field}
                    className="bg-zinc-900 border-zinc-800 text-white"
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
                <FormLabel>Title (Arabic)</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="Enter title in Arabic"
                    {...field}
                    className="bg-zinc-900 border-zinc-800 text-white text-right"
                    dir="rtl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        defaultValue={field.value}
                        placeholder="Select a type"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
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
                <FormLabel>Initial Uses Counter</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="0"
                    {...field}
                    type="number"
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </FormControl>
                <FormDescription className="text-zinc-400">
                  The number to start counting copies from (e.g., 300,000)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="description_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (English)</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    placeholder="Enter description in English"
                    {...field}
                    className="bg-zinc-900 border-zinc-800 text-white resize-none"
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
                <FormLabel>Description (Arabic)</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    placeholder="Enter description in Arabic"
                    {...field}
                    className="bg-zinc-900 border-zinc-800 text-white resize-none text-right"
                    dir="rtl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="instructions_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions (English)</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    placeholder="Enter instructions in English"
                    {...field}
                    className="bg-zinc-900 border-zinc-800 text-white resize-none"
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
                <FormLabel>Instructions (Arabic)</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    placeholder="Enter instructions in Arabic"
                    {...field}
                    className="bg-zinc-900 border-zinc-800 text-white resize-none text-right"
                    dir="rtl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="category_ids"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categories</FormLabel>
                <FormControl>
                  <ReactSelect
                    isMulti
                    isDisabled={isLoading}
                    options={groupedCategories}
                    value={selectedCategories}
                    onChange={(selected) => setSelectedCategories(selected as Category[])}
                    getOptionLabel={(option: Category) => option.name_en}
                    getOptionValue={(option: Category) => option.id.toString()}
                    placeholder="Select categories..."
                    styles={customStyles}
                    className="text-white"
                    formatGroupLabel={(data) => (
                      <div className="font-semibold text-white">
                        {data.label}
                      </div>
                    )}
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
                <FormLabel>Tools</FormLabel>
                <FormControl>
                  <ReactSelect
                    isMulti
                    isDisabled={isLoading}
                    options={tools}
                    value={selectedTools}
                    onChange={(selected) => setSelectedTools(selected as Tool[])}
                    getOptionLabel={(option: Tool) => option.name_en}
                    getOptionValue={(option: Tool) => option.id.toString()}
                    placeholder="Select tools..."
                    styles={customStyles}
                    className="text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            onClick={() => router.push("/admin/prompts")}
            className="bg-zinc-800 text-white hover:bg-zinc-700"
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            type="submit"
            className="bg-white text-black hover:bg-zinc-200"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Prompt" : "Create Prompt"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
