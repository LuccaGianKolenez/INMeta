import { Request, Response, NextFunction } from 'express';
import { EmployeeLinksService } from './employee.links.service.js';

export async function upsertLinks(req: Request, res: Response, next: NextFunction) {
  try {
    const { employeeId, add, remove } = req.body;
    const result = await EmployeeLinksService.upsert({ employeeId, add, remove });
    res.json(result);
  } catch (e) { next(e); }
}
