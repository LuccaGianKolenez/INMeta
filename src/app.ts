import express from 'express';
import { applySecurity } from './middlewares/security.js';
import { logger } from './middlewares/logger.js';
import { errorHandler } from './middlewares/error.js';
import r from './routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from './swagger.json' assert { type: 'json' };

export function createApp() {
  const app = express();
  app.use(express.json());
  applySecurity(app);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
  app.use(logger);
  app.use('/api', r);
  app.use(errorHandler);
  return app;
}

const app = createApp();
export default app;
