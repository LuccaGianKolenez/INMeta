import { z } from 'zod';

export const sendDocSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body: z.object({
    documentTypeId: z.number().int().positive(),
    name: z.string().min(1)
  })
});

export const listPendingSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    pageSize: z.string().regex(/^\d+$/).transform(Number).optional(),
    employeeId: z.string().regex(/^\d+$/).transform(Number).optional(),
    documentTypeId: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});
