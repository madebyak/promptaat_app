'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tool, toolSchema, CreateToolInput } from '@/types/tool';
import { Loader2 } from 'lucide-react';

interface ToolFormProps {
  defaultValues?: Tool;
  onSubmit: (data: CreateToolInput) => Promise<void>;
  onCancel: () => void;
}

export function ToolForm({ defaultValues, onSubmit, onCancel }: ToolFormProps) {
  const form = useForm<CreateToolInput>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name_en: defaultValues?.name_en || '',
      icon_url: defaultValues?.icon_url || '',
    },
  });

  const handleSubmit = async (data: CreateToolInput) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Error is handled by the parent component
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Name (English)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter tool name"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Icon URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter icon URL"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {defaultValues ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
