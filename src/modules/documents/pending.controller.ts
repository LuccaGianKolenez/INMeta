import type { Request, Response } from 'express';
import { z } from 'zod';
import * as repo from './pending.repository.js';

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  employeeId: z.coerce.number().int().positive().optional().nullable(),
  documentTypeId: z.coerce.number().int().positive().optional().nullable(),
});

export async function listPending(req: Request, res: Response) {
  const parse = querySchema.safeParse(req.query);
  if (!parse.success) return res.status(400).json({ error: 'Invalid query params' });

  const data = await repo.listPending(parse.data);
  return res.json(data);
}
