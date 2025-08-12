import * as Repo from './document.repository.js';
import { HttpError } from '../../utils/httpError.js';

export const DocumentService = {
  async send(input: { employeeId: number; documentTypeId: number; name?: string }) {
    const updated = await Repo.markSent(input.employeeId, input.documentTypeId);
    if (!updated) throw new HttpError(404, 'Link not found for employee/documentType');
    return updated;
  }
};
