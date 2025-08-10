import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | ${duration}ms`);

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      console.log('[BODY]', JSON.stringify(req.body));
    }
  });

  next();
}
