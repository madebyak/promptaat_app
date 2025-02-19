import { z } from 'zod';

const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico'];

export const toolSchema = z.object({
  name_en: z.string().min(1, 'Name is required'),
  icon_url: z
    .string()
    .min(1, 'Icon URL is required')
    .url('Must be a valid URL')
    .refine(
      (url) => {
        const lowercaseUrl = url.toLowerCase();
        return ALLOWED_IMAGE_EXTENSIONS.some((ext) => lowercaseUrl.endsWith(ext));
      },
      {
        message: `Icon URL must end with one of: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
      }
    ),
});

export type CreateToolInput = z.infer<typeof toolSchema>;

export interface Tool {
  id: number;
  name_en: string;
  icon_url: string;
  created_at: Date;
  updated_at: Date;
}
