import { Router } from 'express';
import { health, readyz } from './modules/health/health.controller.js';

const r = Router();
r.get('/health', health);
r.get('/readyz', readyz);

export default r;
