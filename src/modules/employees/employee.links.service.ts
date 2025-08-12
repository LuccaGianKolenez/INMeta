import * as Repo from './employee.links.repository.js';

export const EmployeeLinksService = {
  async upsert(input: { employeeId: number; add?: number[]; remove?: number[] }) {
    const added = await Repo.addLinks(input.employeeId, input.add ?? []);
    const removed = await Repo.removeLinks(input.employeeId, input.remove ?? []);
    return { added, removed };
  }
};