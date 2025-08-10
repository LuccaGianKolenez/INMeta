import { AnyZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from './error.js';

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({ body: req.body, params: req.params, query: req.query });
      (req as any).body = parsed.body ?? req.body;
      (req as any).params = parsed.params ?? req.params;
      (req as any).query = parsed.query ?? req.query;
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const flat = e.flatten();
        return next(new HttpError(400, 'Validation error', flat));
      }
      next(e);
    }
  };
