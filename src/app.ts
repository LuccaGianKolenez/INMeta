import express from 'express';
import routes from './routes.js';
import { errorHandler } from './middlewares/error.js';
import { logger } from './middlewares/logger.js'; 
import './db/index.js'; 
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
}));
app.use(rateLimit({ windowMs: 60_000, max: 120 })); // 120 req/min por IP

app.use(express.json());

app.use(logger);

app.use('/api', routes);

app.use(errorHandler);

export default app;
