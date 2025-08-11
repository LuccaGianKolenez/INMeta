import { tx } from '../../db/db.js';
import * as Repo from './document.repository.js';

export const DocumentService = {
  async send(employeeId: number, body: { documentTypeId: number; name: string }) {
    return tx((c) => Repo.send(c, employeeId, body.documentTypeId, body.name));
  },

  async listPending(params: { page: number; pageSize: number; employeeId?: number; documentTypeId?: number }) {
    return Repo.listPending(params.page, params.pageSize, params);
  },
};
