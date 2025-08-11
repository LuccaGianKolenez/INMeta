import { Request, Response, NextFunction } from 'express';
import { tx } from '../../db/db.js';

export async function send(req: Request, res: Response, next: NextFunction) {
  try {
    const employeeId = Number(req.params.id);
    const documentTypeId = Number(req.body?.documentTypeId);
    const name = (req.body?.name ?? '').trim();
    if (!Number.isFinite(employeeId) || !Number.isFinite(documentTypeId) || !name)
      return res.status(400).json({ error: 'invalid' });

    const out = await tx(async c => {
      const { rows } = await c.query(
        `SELECT id, status FROM employee_documents
         WHERE employee_id=$1 AND document_type_id=$2
         FOR UPDATE`,
        [employeeId, documentTypeId]
      );
      if (!rows.length) return { code: 400 as const };
      if (rows[0].status === 'SENT') return { code: 409 as const };

      const updated = await c.query(
        `UPDATE employee_documents
           SET status='SENT', sent_at=NOW(), name=$3, updated_at=NOW()
         WHERE employee_id=$1 AND document_type_id=$2
         RETURNING employee_id AS "employeeId", document_type_id AS "documentTypeId",
                   status, name, sent_at AS "sentAt"`,
        [employeeId, documentTypeId, name]
      );
      return { code: 201 as const, body: updated.rows[0] };
    });

    if (out.code === 400) return res.status(400).json({ error: 'not linked' });
    if (out.code === 409) return res.status(409).json({ error: 'already sent' });
    res.status(201).json(out.body);
  } catch (e) { next(e); }
}

export async function listPending(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.max(1, Math.min(50, Number(req.query.pageSize ?? 10)));
    const employeeId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
    const documentTypeId = req.query.documentTypeId ? Number(req.query.documentTypeId) : undefined;

    const filters: string[] = [`d.status='PENDING'`];
    const params: any[] = [];
    if (employeeId) { params.push(employeeId); filters.push(`d.employee_id = $${params.length}`); }
    if (documentTypeId) { params.push(documentTypeId); filters.push(`d.document_type_id = $${params.length}`); }
    const where = `WHERE ${filters.join(' AND ')}`;

    const result = await tx(async c => {
      const total = await c.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM employee_documents d ${where}`, params
      );
      const off = (page - 1) * pageSize;
      const data = await c.query(
        `SELECT d.employee_id AS "employeeId",
                e.name        AS "employeeName",
                d.document_type_id AS "documentTypeId",
                t.name        AS "documentTypeName",
                d.status
         FROM employee_documents d
         JOIN employees e ON e.id = d.employee_id
         JOIN document_types t ON t.id = d.document_type_id
         ${where}
         ORDER BY d.employee_id, d.document_type_id
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pageSize, off]
      );
      return { total: Number(total.rows[0].count), data: data.rows };
    });

    res.set('X-Total-Count', String(result.total));
    res.json({ items: result.data, page, pageSize });
  } catch (e) { next(e); }
}
