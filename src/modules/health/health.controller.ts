import { Request, Response } from 'express';
import { query } from '../../db/db.js';

export function health(_req: Request, res: Response) {
  res.json({ ok: true });
}

export async function readyz(_req: Request, res: Response) {
  await query('SELECT 1');
  res.json({ ready: true });
}
