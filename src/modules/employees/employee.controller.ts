import { Request, Response, NextFunction } from 'express';
import { EmployeeRepo } from './employee.repository.js';
import { EmployeeService } from './employee.service.js';

export const EmployeeController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, cpf, hiredAt } = (req as any).body;
      const id = await EmployeeRepo.create({ name, cpf, hiredAt });
      return res.status(201).json({ id });
    } catch (e) { next(e); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number((req as any).params.id);
      const { name, hiredAt } = (req as any).body;
      const updated = await EmployeeRepo.update(id, { name, hiredAt });
      if (!updated) return res.status(404).json({ error: 'Employee not found' });
      return res.json({ message: 'Employee updated' });
    } catch (e) { next(e); }
  },

  linkUnlink: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number((req as any).params.id);
      const { add = [], remove = [] } = (req as any).body;
      const status = await EmployeeService.linkDocs(id, add, remove);
      return res.json(status);
    } catch (e) { next(e); }
  },

  status: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number((req as any).params.id);
      const status = await EmployeeService.status(id);
      return res.json(status);
    } catch (e) { next(e); }
  }
};
