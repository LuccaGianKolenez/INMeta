// src/middlewares/error.ts
import { NextFunction, Request, Response } from 'express';
import { mapPgError } from '../utils/pg-error-map.js';

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  let httpErr: HttpError;

  // Mapear erros do Postgres por code
  if (err && typeof err === 'object' && 'code' in err && err.code) {
    httpErr = mapPgError(err);
  } else if (err instanceof HttpError) {
    httpErr = err;
  } else {
    httpErr = new HttpError(500, 'Internal Server Error');
  }

  // Log detalhado sempre
  console.error('[ERROR]', req.method, req.originalUrl);
  if (err?.message) console.error(' message:', err.message);
  if (err?.code) console.error(' code:', err.code);
  if (err?.detail) console.error(' detail:', err.detail);
  if (err?.stack) console.error(err.stack);

  res.status(httpErr.status).json({
    error: httpErr.message,
    details: httpErr.details
  });
}
