import { Request, Response, NextFunction } from 'express';
import { DocumentService } from './document.service.js';

export const DocumentController = {
  send: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employeeId = Number((req as any).params.id);
      const { documentTypeId, name } = (req as any).body;
      const out = await DocumentService.send(employeeId, documentTypeId, name);
      return res.status(201).json(out);
    } catch (e) { next(e); }
  },

  listPending: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, employeeId, documentTypeId } = (req as any).query;
      const result = await DocumentService.listPending({ page, pageSize, employeeId, documentTypeId });
      return res.json(result);
    } catch (e) { next(e); }
  }
};
