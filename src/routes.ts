import { Router } from 'express';
import { health, readyz } from './modules/health/health.controller.js';
import * as DocTypes from './modules/documentTypes/documentType.controller.js';
import { validate } from './middlewares/validate.js';
import { createDocumentTypeSchema } from './modules/documentTypes/documentType.schemas.js';

const r = Router();

r.get('/health', health);
r.get('/readyz', readyz);

r.post('/document-types', validate(createDocumentTypeSchema), DocTypes.create);
r.get('/document-types', DocTypes.list);

export default r;
