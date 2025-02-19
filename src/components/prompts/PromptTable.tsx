'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Prompt } from '@/types/prompt';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface PromptTableProps {
  prompts: Prompt[];
  selectedPrompts: number[];
  onSelectPrompt: (id: number) => void;
  onSelectAll: () => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
}

export function PromptTable({
  prompts,
  selectedPrompts,
  onSelectPrompt,
  onSelectAll,
  onEdit,
  onDelete,
}: PromptTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="rounded-md border border-zinc-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedPrompts.length === prompts.length && prompts.length > 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead className="text-zinc-400">Title (EN)</TableHead>
            <TableHead className="text-zinc-400">Title (AR)</TableHead>
            <TableHead className="text-zinc-400">Type</TableHead>
            <TableHead className="text-zinc-400">Categories</TableHead>
            <TableHead className="text-zinc-400">Tools</TableHead>
            <TableHead className="text-zinc-400">Uses</TableHead>
            <TableHead className="text-zinc-400">Last Updated</TableHead>
            <TableHead className="text-zinc-400">Created At</TableHead>
            <TableHead className="text-right text-zinc-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="h-24 text-center text-zinc-500"
              >
                No prompts found.
              </TableCell>
            </TableRow>
          ) : (
            prompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedPrompts.includes(prompt.id)}
                    onCheckedChange={() => onSelectPrompt(prompt.id)}
                  />
                </TableCell>
                <TableCell className="font-medium text-white">
                  {prompt.title_en}
                </TableCell>
                <TableCell className="text-white">{prompt.title_ar}</TableCell>
                <TableCell className="text-zinc-400">{prompt.type}</TableCell>
                <TableCell className="text-zinc-400">
                  {prompt.categories.map((cat) => cat.name_en).join(', ')}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {prompt.tools.map((tool) => tool.name_en).join(', ')}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {prompt.uses_counter}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {formatDate(prompt.updated_at)}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {formatDate(prompt.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(prompt)}
                      className="h-8 w-8 text-zinc-400 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(prompt)}
                      className="h-8 w-8 text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
