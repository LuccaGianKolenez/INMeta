import { z } from 'zod';

export const createEmployeeSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos numéricos'),
    hiredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  })
});

export const updateEmployeeSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body: z.object({
    name: z.string().min(2).optional(),
    hiredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  })
});

export const linkUnlinkSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body: z.object({
    add: z.array(z.number().int().positive()).optional(),
    remove: z.array(z.number().int().positive()).optional()
  }).refine(b => (b.add?.length || 0) + (b.remove?.length || 0) > 0, 'Informe add ou remove')
});
