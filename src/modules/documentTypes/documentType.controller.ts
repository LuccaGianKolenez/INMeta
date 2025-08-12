import { Request, Response, NextFunction } from 'express';
import { DocumentTypeService } from './documentType.service.js';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const created = await DocumentTypeService.create(name);
    res.status(201).json(created);
  } catch (e) { next(e); }
}

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await DocumentTypeService.list();
    res.json(data);
  } catch (e) { next(e); }
}
