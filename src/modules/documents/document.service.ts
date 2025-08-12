import * as Repo from './document.repository.js';
import { HttpError } from '../../utils/httpError.js';

export const DocumentService = {
  async send(input: { employeeId: number; documentTypeId: number; name?: string }) {
    const exists = await Repo.linkExists(input.employeeId, input.documentTypeId);
    if (!exists) throw new HttpError(404, 'Link not found for employee/documentType', input, 'NOT_FOUND');

    const updated = await Repo.markSent(input.employeeId, input.documentTypeId);
    if (!updated) throw new HttpError(500, 'Failed to update status', input, 'INTERNAL');
    return updated;
  }
};
