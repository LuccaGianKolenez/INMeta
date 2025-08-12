import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export function logger(req: Request, _res: Response, next: NextFunction) {
  (req as any).requestId = (req.headers['x-request-id'] as string) || randomUUID();
  console.log(`[API] ${req.method} ${req.originalUrl} id=${(req as any).requestId}`);
  next();
}
