import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpError.js';

function isPgError(err: any): err is { code?: string; detail?: string; constraint?: string } {
  return err && typeof err === 'object' && 'code' in err;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        status: err.status,
        message: err.message,
        code: err.code ?? null,
        details: err.details ?? null
      }
    });
  }

  if (isPgError(err)) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: {
          status: 409,
          message: 'Conflict: duplicate value',
          code: 'DUPLICATE',
          details: { constraint: err.constraint, detail: err.detail ?? null }
        }
      });
    }
    if (err.code === '23503') {
      return res.status(400).json({
        error: {
          status: 400,
          message: 'Bad Request: foreign key violation',
          code: 'FK_VIOLATION',
          details: { constraint: err.constraint, detail: err.detail ?? null }
        }
      });
    }
  }

  console.error(err);
  return res.status(500).json({
    error: { status: 500, message: 'Internal server error', code: 'INTERNAL', details: null }
  });
}
