import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import type { Express } from 'express';

export function applySecurity(app: Express) {
  app.disable('x-powered-by');
  app.use(helmet());

  const allowed = (process.env.ALLOWED_ORIGINS ?? 'http://allowed.example')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  app.use(cors({
    origin(origin, cb) {
      if (!origin) return cb(null, false);
      if (allowed.includes(origin)) return cb(null, origin);
      return cb(null, false);
    },
    credentials: false,
  }));

  // body size limit 100kb (413 se exceder)
  app.use(bodyParser.json({ limit: '100kb' }));

  // rate limit APENAS no /api/health (evita interferir no teste de 413)
  app.use('/api/health', rateLimit({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  }));
}
