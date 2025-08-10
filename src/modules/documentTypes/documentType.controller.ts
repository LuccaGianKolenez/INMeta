import { Request, Response } from 'express';
import { DocumentTypeRepo } from './documentType.repository.js';
import { ah } from '../../utils/async-handler.js';

export const DocumentTypeController = {
  create: ah(async (req: Request, res: Response) => {
    const { name } = (req as any).body;
    const id = await DocumentTypeRepo.create(name);
    res.status(201).json({ id });
  }),

  list: ah(async (_req, res) => {
    const items = await DocumentTypeRepo.listAll();
    res.json({ items });
  })
};
