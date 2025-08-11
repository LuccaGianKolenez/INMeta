import { z } from 'zod';

export const sendDocumentSchema = z.object({
  documentTypeId: z.number().int().positive(),
  name: z.string().min(1),
});

export const listPendingSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  employeeId: z.coerce.number().int().positive().optional(),
  documentTypeId: z.coerce.number().int().positive().optional(),
});
