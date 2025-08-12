import { query } from '../../db/db.js';

export async function addLinks(employeeId: number, docTypeIds: number[]) {
  if (!docTypeIds?.length) return [];
  for (const id of docTypeIds) {
    await query(
      `INSERT INTO employee_documents (employee_id, document_type_id, status)
       VALUES ($1,$2,'PENDING')
       ON CONFLICT (employee_id, document_type_id) DO NOTHING`,
      [employeeId, id]
    );
  }
  return docTypeIds;
}

export async function removeLinks(employeeId: number, docTypeIds: number[]) {
  if (!docTypeIds?.length) return 0;
  const { rowCount } = await query(
    `DELETE FROM employee_documents
      WHERE employee_id = $1
        AND document_type_id = ANY($2::int[])`,
    [employeeId, docTypeIds]
  );
  return rowCount ?? 0;
}

export async function employeeExists(id: number) {
  const { rows } = await query('SELECT 1 FROM employees WHERE id=$1', [id]);
  return rows.length > 0;
}

export async function docTypesExist(ids: number[]) {
  if (!ids.length) return true;
  const { rows } = await query('SELECT id FROM document_types WHERE id = ANY($1::int[])', [ids]);
  const found = new Set(rows.map(r => r.id as number));
  return ids.every(i => found.has(i));
}