import { Request, Response, NextFunction } from 'express';
import { query, tx } from '../../db/db.js';
const digits = (s: string) => (s ?? '').replace(/\D+/g, '');

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const name = (req.body?.name ?? '').trim();
    const cpf = digits(req.body?.cpf);
    const hiredAt = req.body?.hiredAt;
    if (!name || cpf.length !== 11 || !hiredAt) return res.status(400).json({ error: 'invalid' });
    const { rows } = await query<{ id: number }>(
      `INSERT INTO employees (name, cpf, hired_at) VALUES ($1,$2,$3) RETURNING id`,
      [name, cpf, hiredAt]
    );
    res.status(201).json({ id: rows[0].id, name, cpf, hiredAt });
  } catch (e: any) {
    if (e?.code === '23505') return res.status(409).json({ error: 'duplicate' });
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const name = (req.body?.name ?? '').trim();
    if (!Number.isFinite(id) || !name) return res.status(400).json({ error: 'invalid' });
    const { rowCount } = await query(`UPDATE employees SET name=$1 WHERE id=$2`, [name, id]);
    if (!rowCount) return res.status(404).json({ error: 'not found' });
    res.json({ id, name });
  } catch (e) { next(e); }
}

export async function linkUnlink(req: Request, res: Response, next: NextFunction) {
  try {
    const employeeId = Number(req.params.id);
    const add: number[] = Array.isArray(req.body?.add) ? req.body.add.map(Number) : [];
    const remove: number[] = Array.isArray(req.body?.remove) ? req.body.remove.map(Number) : [];
    if (!Number.isFinite(employeeId)) return res.status(400).json({ error: 'invalid' });

    await tx(async c => {
      if (add.length) {
        await c.query(
          `INSERT INTO employee_documents (employee_id, document_type_id, status)
           SELECT $1, dt.id, 'PENDING' FROM document_types dt
           WHERE dt.id = ANY($2::int[])
           ON CONFLICT (employee_id, document_type_id) DO NOTHING`,
          [employeeId, add]
        );
      }
      if (remove.length) {
        await c.query(
          `DELETE FROM employee_documents
           WHERE employee_id = $1 AND document_type_id = ANY($2::int[]) AND status = 'PENDING'`,
          [employeeId, remove]
        );
      }
    });

    const { rows } = await query<{ documentTypeId: number }>(
      `SELECT document_type_id AS "documentTypeId"
       FROM employee_documents
       WHERE employee_id = $1 AND status = 'PENDING'
       ORDER BY document_type_id`,
      [employeeId]
    );
    res.json({ pending: rows });
  } catch (e) { next(e); }
}

export async function status(req: Request, res: Response, next: NextFunction) {
  try {
    const employeeId = Number(req.params.id);
    if (!Number.isFinite(employeeId)) return res.status(400).json({ error: 'invalid' });

    const { rows: pending } = await query(
      `SELECT d.document_type_id AS "documentTypeId", t.name AS "documentTypeName"
       FROM employee_documents d
       JOIN document_types t ON t.id = d.document_type_id
       WHERE d.employee_id = $1 AND d.status = 'PENDING'
       ORDER BY d.document_type_id`,
      [employeeId]
    );
    const { rows: sent } = await query(
      `SELECT d.document_type_id AS "documentTypeId", t.name AS "documentTypeName",
              d.name, d.sent_at AS "sentAt"
       FROM employee_documents d
       JOIN document_types t ON t.id = d.document_type_id
       WHERE d.employee_id = $1 AND d.status = 'SENT'
       ORDER BY d.sent_at NULLS LAST`,
      [employeeId]
    );
    res.json({ pending, sent });
  } catch (e) { next(e); }
}
