import { Request, Response, NextFunction } from 'express';
import { DocumentListService } from './document.list.service.js';
import { listPendingQuerySchema } from './document.list.schemas.js';

export async function listPending(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, pageSize, employeeId, documentTypeId } = listPendingQuerySchema.parse(req.query);
    const result = await DocumentListService.listPending({ page, pageSize, employeeId, documentTypeId });
    res.json(result);
  } catch (e) { next(e); }
}
