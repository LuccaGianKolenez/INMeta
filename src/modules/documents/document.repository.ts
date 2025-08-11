import type { PoolClient } from 'pg';
import { query } from '../../db/db.js';
import { HttpError } from '../../middlewares/error.js';

export async function send(c: PoolClient, employeeId: number, documentTypeId: number, name: string) {
  // tentativa otimista (garante concorrência): só atualiza se ainda estiver PENDING
  const upd = await c.query(
    `UPDATE employee_documents
        SET status='SENT', name=$3, sent_at=NOW()
      WHERE employee_id=$1 AND document_type_id=$2 AND status='PENDING'
      RETURNING employee_id AS "employeeId", document_type_id AS "documentTypeId", status, name, sent_at AS "sentAt"`,
    [employeeId, documentTypeId, name]
  );

  if (upd.rowCount === 1) return upd.rows[0];

  // se não atualizou, checa o motivo
  const { rows } = await c.query(
    `SELECT status FROM employee_documents WHERE employee_id=$1 AND document_type_id=$2`,
    [employeeId, documentTypeId]
  );

  if (!rows.length) {
    throw new HttpError(400, 'Document type not linked to employee');
  }
  if (rows[0].status === 'SENT') {
    throw new HttpError(409, 'Document already sent');
  }
  throw new HttpError(500, 'Unexpected state');
}

export async function listPending(page: number, pageSize: number, filters: { employeeId?: number; documentTypeId?: number }) {
  const off = (page - 1) * pageSize;
  const where: string[] = [`ed.status='PENDING'`];
  const params: any[] = [];
  let p = 1;

  if (filters.employeeId) {
    where.push(`ed.employee_id = $${p++}`);
    params.push(filters.employeeId);
  }
  if (filters.documentTypeId) {
    where.push(`ed.document_type_id = $${p++}`);
    params.push(filters.documentTypeId);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*)::int AS total
                      FROM employee_documents ed
                      ${whereSql}`;
  const dataSql = `SELECT ed.employee_id AS "employeeId",
                          ed.document_type_id AS "documentTypeId",
                          dt.name AS "documentTypeName",
                          ed.status
                     FROM employee_documents ed
                     JOIN document_types dt ON dt.id = ed.document_type_id
                     ${whereSql}
                     ORDER BY ed.employee_id, ed.document_type_id
                     LIMIT ${pageSize} OFFSET ${off}`;

  const [count, data] = await Promise.all([
    query<{ total: number }>(countSql, params),
    query(dataSql, params),
  ]);

  return { data: data.rows, page, pageSize, total: count.rows[0].total };
}
