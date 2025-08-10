import { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

function isPgError(err: any): err is { code?: string; detail?: string; constraint?: string } {
  return typeof err?.code === 'string';
}

function mapPgError(err: any) {
  if (err.code === '23505') return new HttpError(409, 'Conflict: duplicate', { constraint: err.constraint });
  if (err.code === '23503') return new HttpError(400, 'Invalid reference', { constraint: err.constraint });
  if (err.code === '22P02') return new HttpError(400, 'Invalid input');
  if (['ETIMEDOUT', 'ECONNREFUSED'].includes(err.code)) return new HttpError(503, 'DB unavailable', { code: err.code });
  return new HttpError(500, 'Database error', { code: err.code, message: err.message, detail: err.detail });
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  let httpErr: HttpError;

  if (err instanceof HttpError) {
    httpErr = err;
  } else if (err?.name === 'ZodError') {
    httpErr = new HttpError(400, 'Validation error', (err as any).flatten?.());
  } else if (isPgError(err)) {
    httpErr = mapPgError(err);
  } else {
    httpErr = new HttpError(500, 'Unexpected error');
  }

  // Log básico (mascare PII se necessário)
  console.error('[ERROR]', req.method, req.originalUrl, { code: (err as any)?.code, message: err?.message });

  res.status(httpErr.status).json({ error: httpErr.message, details: httpErr.details });
}
