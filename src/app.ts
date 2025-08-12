import express from 'express';
import { applySecurity } from './middlewares/security.js';
import { logger } from './middlewares/logger.js';
import { errorHandler } from './middlewares/error.js';
import r from './routes.js';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import path from 'path';

const swaggerPath = path.join(process.cwd(), 'src', 'swagger.json');
const swagger = JSON.parse(readFileSync(swaggerPath, 'utf8'));

export function createApp() {
  const app = express();

  app.use(express.json());
  applySecurity(app);

  // Swagger
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swagger));

  // Logger
  app.use(logger);

  // Rotas da API
  app.use('/api', r);

  // 404 para qualquer rota não atendida acima
  app.use((_req, res) => {
    res.status(404).json({
      error: { status: 404, message: 'Not Found', code: 'NOT_FOUND', details: null }
    });
  });

  app.use(errorHandler);

  return app;
}

const app = createApp();
export default app;
