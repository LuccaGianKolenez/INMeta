import type { Request, Response } from 'express';
import { z } from 'zod';
import * as repo from './employee.status.repository.js';

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function documentsStatus(req: Request, res: Response) {
  const parse = paramsSchema.safeParse(req.params);
  if (!parse.success) return res.status(400).json({ error: 'Invalid employee id' });
  const { id } = parse.data;

  const data = await repo.employeeStatus(id);
  return res.json(data);
}
