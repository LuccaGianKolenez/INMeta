import type { Request, Response, NextFunction } from 'express';

function maskPII(obj: any) {
  try {
    if (!obj || typeof obj !== 'object') return obj;
    const clone = JSON.parse(JSON.stringify(obj));
    if (clone.cpf) clone.cpf = '***.***.***-**';
    return clone;
  } catch { return obj; }
}

export function logger(req: Request, res: Response, next: NextFunction) {
  const id = crypto.randomUUID();
  const start = process.hrtime.bigint();

  (res as any).id = id;

  const done = () => {
    const ms = Number((process.hrtime.bigint() - start) / 1000000n);
    console.log(`[API] ${id} ${req.method} ${req.originalUrl} | ${res.statusCode} | ${ms}ms`);
    res.removeListener('finish', done);
    res.removeListener('close', done);
  };

  res.on('finish', done);
  res.on('close', done);

  // log body depois do handler escrever
  const oldJson = res.json.bind(res);
  res.json = (body: any) => {
    console.log(`[BODY] ${id} ${JSON.stringify(maskPII(req.body))}`);
    return oldJson(body);
  };

  next();
}
