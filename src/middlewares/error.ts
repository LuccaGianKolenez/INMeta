import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let message = 'internal';
  let details: any;

  if (err?.code === '23505') { status = 409; message = 'duplicate'; }
  if (err?.name === 'ZodError') { status = 400; message = 'validation'; details = err.issues; }
  if (err?.type === 'entity.too.large') { status = 413; message = 'request entity too large'; }

  console.error('[ERROR]', req.method, req.originalUrl, { code: (err as any)?.code, message: err?.message });
  res.status(status).json({ error: message, details });
}
