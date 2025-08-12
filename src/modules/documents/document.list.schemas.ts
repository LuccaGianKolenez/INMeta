import { z } from 'zod';
export const listPendingQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  employeeId: z.coerce.number().int().positive().optional(),
  documentTypeId: z.coerce.number().int().positive().optional()
});
export type ListPendingQuery = z.infer<typeof listPendingQuerySchema>;
