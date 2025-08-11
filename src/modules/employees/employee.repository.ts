import type { PoolClient } from 'pg';
import { query } from '../../db/db.js';

export async function createEmployee(name: string, cpf: string, hiredAt: string) {
  const { rows } = await query(
    `INSERT INTO employees (name, cpf, hired_at) VALUES ($1,$2,$3)
     RETURNING id, name, cpf, hired_at AS "hiredAt"`,
    [name, cpf, hiredAt]
  );
  return rows[0];
}

export async function updateEmployee(id: number, name: string) {
  const { rows } = await query(
    `UPDATE employees SET name=$2 WHERE id=$1
     RETURNING id, name, cpf, hired_at AS "hiredAt"`,
    [id, name]
  );
  return rows[0];
}

export async function linkUnlinkRequiredDocs(c: PoolClient, employeeId: number, add?: number[], remove?: number[]) {
  if (add?.length) {
    // idempotente: ON CONFLICT DO NOTHING
    await c.query(
      `INSERT INTO employee_documents (employee_id, document_type_id, status)
       SELECT $1, dt.id, 'PENDING'::doc_status FROM UNNEST($2::int[]) AS dt(id)
       ON CONFLICT (employee_id, document_type_id) DO NOTHING`,
      [employeeId, add]
    );
  }

  if (remove?.length) {
    // só remove se ainda estiver PENDING
    await c.query(
      `DELETE FROM employee_documents
       WHERE employee_id=$1 AND document_type_id = ANY($2::int[]) AND status='PENDING'`,
      [employeeId, remove]
    );
  }

  const { rows } = await c.query(
    `SELECT document_type_id AS "documentTypeId", status, name, sent_at AS "sentAt"
       FROM employee_documents
      WHERE employee_id=$1
      ORDER BY document_type_id`,
    [employeeId]
  );
  return rows;
}

export async function employeeStatus(employeeId: number) {
  const { rows } = await query(
    `SELECT dt.id AS "documentTypeId", dt.name AS "documentTypeName", ed.status, ed.name, ed.sent_at AS "sentAt"
       FROM employee_documents ed
       JOIN document_types dt ON dt.id = ed.document_type_id
      WHERE ed.employee_id=$1
      ORDER BY dt.id`,
    [employeeId]
  );
  const pending = rows.filter(r => r.status === 'PENDING');
  const sent = rows.filter(r => r.status === 'SENT');
  return { pending, sent };
}
