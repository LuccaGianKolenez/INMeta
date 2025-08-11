import type { RequestHandler } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      next(e);
    }
  };
}
