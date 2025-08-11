import { tx } from '../../db/db.js';
import * as Repo from './employee.repository.js';

export const EmployeeService = {
  async create(data: { name: string; cpf: string; hiredAt: string }) {
    return Repo.createEmployee(data.name, data.cpf, data.hiredAt);
  },

  async update(id: number, data: { name: string }) {
    return Repo.updateEmployee(id, data.name);
  },

  async linkDocs(employeeId: number, data: { add?: number[]; remove?: number[] }) {
    return tx(async (c) => {
      const list = await Repo.linkUnlinkRequiredDocs(c, employeeId, data.add, data.remove);
      // retornamos apenas os pendentes para o teste validar contagem
      return { pending: list.filter(i => i.status === 'PENDING') };
    });
  },

  async status(employeeId: number) {
    return Repo.employeeStatus(employeeId);
  },
};
