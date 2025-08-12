import { query } from '../../db/db.js';

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
