import { query } from '../../db/db.js';

export async function employeeStatus(employeeId: number) {
  const allTypes = await query<{ id: number; name: string }>(
    `SELECT id, name FROM document_types ORDER BY id ASC`
  );
  const links = await query<{ document_type_id: number; status: 'PENDING'|'SENT'; sent_at: string | null }>(
    `SELECT document_type_id, status, sent_at
       FROM employee_documents
      WHERE employee_id = $1`,
    [employeeId]
  );

  const linkedMap = new Map<number, { status: 'PENDING'|'SENT'; sent_at: string | null }>();
  for (const r of links.rows) linkedMap.set(r.document_type_id, { status: r.status, sent_at: r.sent_at });

  const pending: { documentTypeId: number; documentType: string }[] = [];
  const sent: { documentTypeId: number; documentType: string; sentAt: string | null }[] = [];

  for (const t of allTypes.rows) {
    const link = linkedMap.get(t.id);
    if (!link || link.status === 'PENDING') {
      pending.push({ documentTypeId: t.id, documentType: t.name });
    } else {
      sent.push({ documentTypeId: t.id, documentType: t.name, sentAt: link.sent_at });
    }
  }
  return { pending, sent };
}
