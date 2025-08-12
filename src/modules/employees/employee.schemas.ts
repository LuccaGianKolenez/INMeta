import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(1),
  document: z.string().min(3).optional(),
  hiredAt: z.string().datetime().optional()
});
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  document: z.string().min(3).optional(),
  hiredAt: z.string().datetime().optional()
});
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
