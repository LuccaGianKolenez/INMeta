import * as Repo from './employee.links.repository.js';
import { HttpError } from '../../utils/httpError.js';

export const EmployeeLinksService = {
  async upsert(input: { employeeId: number; add?: number[]; remove?: number[] }) {
    const okEmp = await Repo.employeeExists(input.employeeId);
    if (!okEmp) throw new HttpError(404, 'Employee not found', { employeeId: input.employeeId }, 'NOT_FOUND');

    if (input.add?.length) {
      const okTypes = await Repo.docTypesExist(input.add);
      if (!okTypes) throw new HttpError(400, 'Some documentTypeId do not exist', { add: input.add }, 'INVALID_REFERENCE');
    }
    if (input.remove?.length) {
      const okTypes = await Repo.docTypesExist(input.remove);
      if (!okTypes) throw new HttpError(400, 'Some documentTypeId do not exist', { remove: input.remove }, 'INVALID_REFERENCE');
    }

    const added = await Repo.addLinks(input.employeeId, input.add ?? []);
    const removed = await Repo.removeLinks(input.employeeId, input.remove ?? []);
    return { added, removed };
  }
};
