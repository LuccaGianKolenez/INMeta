import { query } from '../../db/db.js';

export interface PendingFilters {
  page: number;
  pageSize: number;
  employeeId?: number | null;
  documentTypeId?: number | null;
}

export interface PendingItem {
  link_id: number;
  employee_id: number;
  employee_name: string;
  document_type_id: number;
  document_type_name: string;
  linked_at: string;
}

export async function listPending(filters: PendingFilters): Promise<{
  items: PendingItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const { page, pageSize, employeeId, documentTypeId } = filters;
  const offset = (page - 1) * pageSize;

  const where: string[] = ['ed.status = $1'];
  const paramsWhere: any[] = ['PENDING'];
  let i = 2;

  if (employeeId) {
    where.push(`ed.employee_id = $${i++}`);
    paramsWhere.push(employeeId);
  }
  if (documentTypeId) {
    where.push(`ed.document_type_id = $${i++}`);
    paramsWhere.push(documentTypeId);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const dataSql = `
    SELECT
      ed.id         AS link_id,
      e.id          AS employee_id,
      e.name        AS employee_name,
      dt.id         AS document_type_id,
      dt.name       AS document_type_name,
      ed.created_at AS linked_at
    FROM employee_documents ed
    JOIN employees e       ON e.id  = ed.employee_id
    JOIN document_types dt ON dt.id = ed.document_type_id
    ${whereSql}
    ORDER BY ed.created_at DESC
    LIMIT $${i} OFFSET $${i + 1};
  `;
  const dataParams = [...paramsWhere, pageSize, offset];

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM employee_documents ed
    ${whereSql};
  `;

  const [rowsRes, countRes] = await Promise.all([
    query<PendingItem>(dataSql, dataParams),
    query<{ total: number }>(countSql, paramsWhere),
  ]);

  return {
    items: rowsRes.rows,
    total: countRes.rows[0]?.total ?? 0,
    page,
    pageSize,
  };
}
