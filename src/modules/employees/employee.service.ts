import { query, tx } from '../../db/db.js';
import { HttpError } from '../../middlewares/error.js';

export const EmployeeService = {
  async linkDocs(employeeId: number, toAdd: number[] = [], toRemove: number[] = []) {
    const emp = await query(`SELECT id FROM employees WHERE id = $1`, [employeeId]);
    if (!emp.rowCount) throw new HttpError(404, 'Employee not found');

    await tx(async (c) => {
      if (toAdd.length) {
        const placeholders = toAdd.map((_, i) => `$${i+1}`).join(',');
        const { rows } = await c.query<{ id: number }>(
          `SELECT id FROM document_types WHERE id IN (${placeholders})`,
          toAdd
        );
        const valid = new Set(rows.map((r:any) => r.id));
        for (const dtId of toAdd) {
          if (!valid.has(dtId)) continue;
          await c.query(
            `INSERT INTO employee_documents (employee_id, document_type_id, status)
             VALUES ($1,$2,'PENDING')
             ON CONFLICT (employee_id, document_type_id) DO NOTHING`,
            [employeeId, dtId]
          );
        }
      }

      if (toRemove.length) {
        const base = [employeeId, ...toRemove];
        const placeholders = toRemove.map((_, i) => `$${i+2}`).join(',');
        await c.query(
          `DELETE FROM employee_documents
          WHERE employee_id = $1
            AND document_type_id IN (${placeholders})
            AND status = 'PENDING'`,
          base
        );
      }
    });

    return this.status(employeeId);
  },

  async status(employeeId: number) {
    const emp = await query(`SELECT id FROM employees WHERE id = $1`, [employeeId]);
    if (!emp.rowCount) throw new HttpError(404, 'Employee not found');

    const { rows } = await query(`
      SELECT dt.id as "documentTypeId",
             dt.name as "documentTypeName",
             ed.status,
             ed.name,
             ed.sent_at as "sentAt"
      FROM employee_documents ed
      JOIN document_types dt ON dt.id = ed.document_type_id
      WHERE ed.employee_id = $1
      ORDER BY dt.name ASC
    `, [employeeId]);

    return {
      employeeId,
      sent: rows.filter((r:any) => r.status === 'SENT'),
      pending: rows.filter((r:any) => r.status === 'PENDING')
    };
  }
};
