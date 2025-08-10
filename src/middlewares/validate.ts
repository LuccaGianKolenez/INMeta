import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from './error';

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) {
      return next(new HttpError(400, 'Validation error', result.error.flatten()));
    }
    Object.assign(req, result.data);
    next();
  };
