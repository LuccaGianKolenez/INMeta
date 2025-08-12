import * as Repo from './document.list.repository.js';
export const DocumentListService = {
  listPending: (args: { page: number; pageSize: number; employeeId?: number; documentTypeId?: number }) =>
    Repo.listPending(args.page, args.pageSize, { employeeId: args.employeeId, documentTypeId: args.documentTypeId })
};
