import { z } from 'zod';

export const createDocumentTypeSchema = z.object({
  name: z.string().min(1),
});
export type CreateDocumentType = z.infer<typeof createDocumentTypeSchema>;
