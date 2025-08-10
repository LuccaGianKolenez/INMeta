import { query } from '../../db/db.js';
import { HttpError } from '../../middlewares/error.js';
import { DocumentRepo } from './document.repository.js';

export const DocumentService = {
  async send(employeeId: number, documentTypeId: number, name: string) {
    const emp = await query(`SELECT 1 FROM employees WHERE id = $1`, [employeeId]);
    if (!emp.rowCount) throw new HttpError(404, 'Employee not found');

    const dt = await query(`SELECT 1 FROM document_types WHERE id = $1`, [documentTypeId]);
    if (!dt.rowCount) throw new HttpError(404, 'Document type not found');

    const link = await query(
      `SELECT 1 FROM employee_documents WHERE employee_id = $1 AND document_type_id = $2`,
      [employeeId, documentTypeId]
    );
    if (!link.rowCount) throw new HttpError(400, 'Document type not linked to employee');

    const result = await DocumentRepo.send(employeeId, documentTypeId, name);
    if (!result.updated) {
      throw new HttpError(409, 'Document already sent');
    }
    if (!result.updated) throw new HttpError(500, 'Unexpected: failed to update document record');

    return { message: 'Document sent' };
  },

  listPending: DocumentRepo.listPending
};
