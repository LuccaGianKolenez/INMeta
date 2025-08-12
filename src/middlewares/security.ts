import helmet from 'helmet';
import cors from 'cors';
import type { Express } from 'express';

export function applySecurity(app: Express) {
  app.use(helmet());
  app.use(cors());
}
