import { z } from 'zod';

export const sendDocumentSchema = z.object({
  employeeId: z.coerce.number().int().positive(),
  documentTypeId: z.coerce.number().int().positive(),
  name: z.string().min(1).optional()
});
export type SendDocumentInput = z.infer<typeof sendDocumentSchema>;
