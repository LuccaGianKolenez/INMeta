import { query } from '../../db/db.js';

export async function listPending(page: number, pageSize: number, filters: { employeeId?: number; documentTypeId?: number }) {
  const where: string[] = [`ed.status = 'PENDING'`];
  const params: any[] = [];
  let i = 1;

  if (filters.employeeId) { where.push(`ed.employee_id = $${i++}`); params.push(filters.employeeId); }
  if (filters.documentTypeId) { where.push(`ed.document_type_id = $${i++}`); params.push(filters.documentTypeId); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = await query<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM employee_documents ed ${whereSql}`,
    params
  );

  const data = await query(
    `SELECT ed.employee_id,
            e.name AS employee_name,
            ed.document_type_id,
            dt.name AS document_type,
            ed.status
       FROM employee_documents ed
       JOIN employees e ON e.id = ed.employee_id
       JOIN document_types dt ON dt.id = ed.document_type_id
       ${whereSql}
       ORDER BY e.name ASC
       LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
    params
  );

  return { data: data.rows, page, pageSize, total: Number(total.rows[0].total) };
}

export async function linkExists(employeeId: number, documentTypeId: number) {
  const { rows } = await query(
    `SELECT 1 FROM employee_documents WHERE employee_id=$1 AND document_type_id=$2`,
    [employeeId, documentTypeId]
  );
  return rows.length > 0;
}

export async function markSent(employeeId: number, documentTypeId: number) {
  const { rows } = await query(
    `UPDATE employee_documents
        SET status = 'SENT', sent_at = NOW(), updated_at = NOW()
      WHERE employee_id = $1 AND document_type_id = $2
      RETURNING employee_id, document_type_id, status, sent_at`,
    [employeeId, documentTypeId]
  );
  return rows[0];
}
