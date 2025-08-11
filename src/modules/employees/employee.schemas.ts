import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(1),
  cpf: z.string().min(11),
  hiredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1),
});

export const linkDocsSchema = z.object({
  add: z.array(z.number().int().positive()).optional(),
  remove: z.array(z.number().int().positive()).optional(),
});
