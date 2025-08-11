import { Request, Response, NextFunction } from 'express';
import { query } from '../../db/db.js';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const name = (req.body?.name ?? '').trim();
    if (!name) return res.status(400).json({ error: 'name required' });
    const { rows } = await query<{ id: number }>(
      `INSERT INTO document_types (name) VALUES ($1) RETURNING id`, [name]
    );
    res.status(201).json({ id: rows[0].id, name });
  } catch (e: any) {
    if (e?.code === '23505') return res.status(409).json({ error: 'duplicate' });
    next(e);
  }
}

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await query(`SELECT id, name FROM document_types ORDER BY id`);
    res.json(rows);
  } catch (e) { next(e); }
}
