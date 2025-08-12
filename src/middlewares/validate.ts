import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export function validate(schema: ZodSchema<any>, from: 'body'|'query'|'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = from === 'body' ? req.body : from === 'query' ? req.query : req.params;
    const result = schema.safeParse(data);
    if (!result.success) return res.status(400).json({ error: 'ValidationError', details: result.error.format() });
    (req as any).validated = (req as any).validated || {};
    (req as any).validated[from] = result.data;
    next();
  };
}
