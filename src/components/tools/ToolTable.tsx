'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Tool } from '@/types/tool';

interface ToolTableProps {
  tools: Tool[];
  onEdit: (tool: Tool) => void;
  onDelete: (tool: Tool) => void;
}

export function ToolTable({ tools, onEdit, onDelete }: ToolTableProps) {
  return (
    <div className="rounded-md border border-zinc-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-zinc-400">Tool Name</TableHead>
            <TableHead className="text-zinc-400">Icon URL</TableHead>
            <TableHead className="text-zinc-400">Created At</TableHead>
            <TableHead className="text-zinc-400">Last Updated</TableHead>
            <TableHead className="text-zinc-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tools.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-zinc-500"
              >
                No tools found.
              </TableCell>
            </TableRow>
          ) : (
            tools.map((tool) => (
              <TableRow key={tool.id}>
                <TableCell className="font-medium text-white">
                  {tool.name_en}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {tool.icon_url || '-'}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {new Date(tool.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {new Date(tool.updated_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(tool)}
                      className="h-8 w-8 text-zinc-400 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(tool)}
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
