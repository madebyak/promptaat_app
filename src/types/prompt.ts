import { z } from 'zod';

export enum PromptType {
  Free = 'Free',
  Pro = 'Pro',
}

export const promptSchema = z.object({
  title_en: z.string().min(1, 'Title in English is required'),
  title_ar: z.string().min(1, 'Title in Arabic is required'),
  description_en: z.string().min(1, 'Description in English is required'),
  description_ar: z.string().min(1, 'Description in Arabic is required'),
  instructions_en: z.string().min(1, 'Instructions in English is required'),
  instructions_ar: z.string().min(1, 'Instructions in Arabic is required'),
  type: z.enum(['Free', 'Pro'], {
    required_error: 'Type is required',
    invalid_type_error: 'Type must be either Free or Pro',
  }),
  initial_uses_counter: z.coerce.number().min(0, 'Initial uses counter must be greater than or equal to 0'),
  category_ids: z.array(z.number()).min(1, 'At least one category is required'),
  tool_ids: z.array(z.number()).min(1, 'At least one tool is required'),
});

export type PromptFormValues = z.infer<typeof promptSchema>;

export interface Prompt extends PromptFormValues {
  id: number;
  created_at: string;
  updated_at: string;
  categories?: Array<{
    id: number;
    name_en: string;
    name_ar: string;
  }>;
  tools?: Array<{
    id: number;
    name_en: string;
    name_ar: string;
    icon_url: string;
  }>;
}
