import { z } from 'zod';
export const createDocTypeSchema = z.object({
  body: z.object({ name: z.string().min(2) })
});
