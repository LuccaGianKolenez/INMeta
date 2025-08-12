// src/middlewares/error.ts
import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpError.js'; 

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let message = 'internal';
  let details: any;

  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
    details = err.details;
  } else if (err?.code === '23505') {
    status = 409; message = 'duplicate';
  } else if (err?.name === 'ZodError') {
    status = 400; message = 'validation'; details = err.issues;
  } else if (err?.type === 'entity.too.large') {
    status = 413; message = 'request entity too large';
  }

  console.error('[ERROR]', req.method, req.originalUrl, { code: err?.code, message: err?.message });
  res.status(status).json({ error: message, details });
}

export { HttpError } from '../utils/httpError.js';
