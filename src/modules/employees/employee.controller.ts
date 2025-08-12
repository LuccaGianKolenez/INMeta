import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from './employee.service.js';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const created = await EmployeeService.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const updated = await EmployeeService.update(id, req.body);
    res.json(updated);
  } catch (e) { next(e); }
}
