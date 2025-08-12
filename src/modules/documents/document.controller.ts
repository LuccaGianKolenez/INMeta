import { Request, Response, NextFunction } from 'express';
import { DocumentService } from './document.service.js';

export async function sendDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { employeeId, documentTypeId, name } = req.body;
    const result = await DocumentService.send({ employeeId, documentTypeId, name });
    res.json(result);
  } catch (e) { next(e); }
}
