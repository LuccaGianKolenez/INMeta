import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

function maskCPF(str: string) {
  return str.replace(/\b(\d{3})(\d{3})(\d{3})(\d{2})\b/g, '***.***.***-**');
}

export function logger(req: Request, res: Response, next: NextFunction) {
  (req as any).requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const rid = (req as any).requestId;
    console.log(`[API] ${rid} ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms`);

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const body = maskCPF(JSON.stringify(req.body ?? {}));
      console.log(`[BODY] ${rid} ${body}`);
    }
  });

  next();
}
