import { z } from 'zod';

export const upsertLinksSchema = z.object({
  employeeId: z.number().int().positive(),
  add: z.array(z.number().int().positive()).optional(),
  remove: z.array(z.number().int().positive()).optional()
});
export type UpsertLinksInput = z.infer<typeof upsertLinksSchema>;
