import * as Repo from './documentType.repository.js';
export const DocumentTypeService = {
  create: (name: string) => Repo.create(name),
  list: () => Repo.list()
};
