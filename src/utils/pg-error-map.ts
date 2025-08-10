// src/utils/pg-error-map.ts
import { HttpError } from '../middlewares/error.js';

type PgErr = NodeJS.ErrnoException & {
  code?: string;
  detail?: string;
  constraint?: string;
  table?: string;
  column?: string;
};

export function mapPgError(err: PgErr): HttpError {
  // Erros de conexão/transiente
  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
    return new HttpError(503, 'Database unavailable', { code: err.code });
  }

  // Erros de schema/migration
  if (err.code === '42P01') { // relation does not exist
    return new HttpError(500, 'Database schema missing (run migrations)', { code: err.code });
  }

  // Violação de UNIQUE
  if (err.code === '23505') {
    return new HttpError(409, 'Unique constraint violation', {
      code: err.code,
      detail: err.detail,
      constraint: err.constraint
    });
  }

  // Violação de FK
  if (err.code === '23503') {
    return new HttpError(400, 'Foreign key violation', {
      code: err.code,
      detail: err.detail,
      constraint: err.constraint
    });
  }

  // NOT NULL
  if (err.code === '23502') {
    return new HttpError(400, 'Null value in column', {
      code: err.code,
      column: (err as any).column
    });
  }

  // Erros de casting/entrada inválida
  if (err.code === '22P02') { // invalid_text_representation
    return new HttpError(400, 'Invalid input syntax', { code: err.code, detail: err.detail });
  }

  // Tamanho de campo
  if (err.code === '22001') {
    return new HttpError(400, 'String data right truncation', { code: err.code, detail: err.detail });
  }

  // Coluna inválida
  if (err.code === '42703') {
    return new HttpError(400, 'Undefined column', { code: err.code, detail: err.detail });
  }

  // Conflitos/concorrência
  if (err.code === '40001' || err.code === '55P03') {
    return new HttpError(409, 'Transaction conflict, retry', { code: err.code });
  }

  // Fallback
  return new HttpError(500, 'Database error', {
    code: err.code,
    detail: err.detail,
    message: err.message
  });
}
