import express from 'express';
import routes from './routes.js';
import { applySecurity } from './middlewares/security.js';
import { logger } from './middlewares/logger.js';
import { errorHandler } from './middlewares/error.js';

export function createApp() {
  const app = express();
  applySecurity(app);
  app.use(logger);
  app.use('/api', routes);
  app.use(errorHandler);
  return app;
}

const app = createApp();
export default app;
