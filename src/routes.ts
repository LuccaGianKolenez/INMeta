import { Router } from 'express';
import { health, readyz } from './modules/health/health.controller.js';
import * as DocTypes from './modules/documentTypes/documentType.controller.js';
import { validate } from './middlewares/validate.js';
import { createDocumentTypeSchema } from './modules/documentTypes/documentType.schemas.js';
import * as Employees from './modules/employees/employee.controller.js';
import { createEmployeeSchema, updateEmployeeSchema } from './modules/employees/employee.schemas.js';

const r = Router();

r.get('/health', health);
r.get('/readyz', readyz);

r.post('/document-types', validate(createDocumentTypeSchema), DocTypes.create);
r.get('/document-types', DocTypes.list);

r.post('/employees', validate(createEmployeeSchema), Employees.create);
r.put('/employees/:id', validate(updateEmployeeSchema), Employees.update);

export default r;


