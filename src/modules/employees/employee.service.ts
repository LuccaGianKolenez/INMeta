import * as Repo from './employee.repository.js';
import { HttpError } from '../../utils/httpError.js';

export const EmployeeService = {
  async create(input: { name: string; document?: string; hiredAt?: string }) {
    return Repo.create(input);
  },
  async update(id: number, input: { name?: string; document?: string; hiredAt?: string }) {
    const updated = await Repo.update(id, input);
    if (!updated) throw new HttpError(404, 'Employee not found');
    return updated;
  }
};
