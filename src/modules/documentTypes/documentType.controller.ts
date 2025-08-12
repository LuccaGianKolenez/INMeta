import { Request, Response, NextFunction } from 'express';
import { DocumentTypeService } from './documentType.service.js';
import { HttpError } from '../../utils/httpError.js';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    if (!name?.trim()) throw new HttpError(400, 'name is required', { field: 'name' }, 'VALIDATION');
    const created = await DocumentTypeService.create(name.trim());
    res.status(201).json(created);
  } catch (e: any) {
    if (e?.code === '23505') return next(new HttpError(409, 'Document type already exists', { name: req.body?.name }, 'DUPLICATE'));
    next(e);
  }
}

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await DocumentTypeService.list();
    res.json(data);
  } catch (e) { next(e); }
}
