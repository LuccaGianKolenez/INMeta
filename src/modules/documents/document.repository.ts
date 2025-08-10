import { query } from '../../db/db.js';
import { getPagination } from '../../utils/pagination.js';

export const DocumentRepo = {
  async send(employeeId: number, documentTypeId: number, name: string) {
    const { rowCount } = await query(
      `UPDATE employee_documents
        SET name = $1, status = 'SENT', sent_at = now(), updated_at = now()
      WHERE employee_id = $2 AND document_type_id = $3 AND status = 'PENDING'`,
      [name, employeeId, documentTypeId]
    );
    return { updated: rowCount ?? 0 };
  },

  async listPending(filters: { employeeId?: number; documentTypeId?: number; page?: number; pageSize?: number }) {
    const { limit, offset } = getPagination(filters.page, filters.pageSize);

    const wh: string[] = [`ed.status = 'PENDING'`];
    const params: any[] = [];
    let i = 1;

    if (filters.employeeId) { wh.push(`ed.employee_id = $${i++}`); params.push(filters.employeeId); }
    if (filters.documentTypeId) { wh.push(`ed.document_type_id = $${i++}`); params.push(filters.documentTypeId); }
    const where = `WHERE ${wh.join(' AND ')}`;

    const itemsSql = `
      SELECT ed.id,
             e.id as "employeeId", e.name as "employeeName", e.cpf,
             dt.id as "documentTypeId", dt.name as "documentTypeName",
             ed.status
      FROM employee_documents ed
      JOIN employees e ON e.id = ed.employee_id
      JOIN document_types dt ON dt.id = ed.document_type_id
      ${where}
      ORDER BY ed.id ASC
      LIMIT $${i++} OFFSET $${i++}
    `;
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM employee_documents ed
      JOIN employees e ON e.id = ed.employee_id
      JOIN document_types dt ON dt.id = ed.document_type_id
      ${where}
    `;

    const [{ rows: items }, { rows: [c] }] = await Promise.all([
      query(itemsSql, [...params, limit, offset]),
      query<{ total: number }>(countSql, params)
    ]);

    return { items, page: filters.page ?? 1, pageSize: limit, total: c?.total ?? 0 };
  }
};
