import express from 'express';
import routes from './routes.js';
import { errorHandler } from './middlewares/error.js';
import { logger } from './middlewares/logger.js'; 
import './db/index.js'; 

const app = express();

app.use(express.json());

app.use(logger);

app.use('/api', routes);

app.use(errorHandler);

export default app;
