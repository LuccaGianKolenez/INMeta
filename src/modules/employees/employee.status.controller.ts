import { Request, Response, NextFunction } from 'express';
import { EmployeeStatusService } from './employee.status.service.js';

export async function documentsStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const employeeId = Number(req.params.id); 
    const result = await EmployeeStatusService.status(employeeId);
    res.json({ employeeId, ...result });
  } catch (e) { next(e); }
}
