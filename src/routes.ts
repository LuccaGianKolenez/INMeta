import { Router } from 'express';
import * as DocTypes from './modules/documentTypes/documentType.controller.js';
import * as Employees from './modules/employees/employee.controller.js';
import * as Docs from './modules/documents/document.controller.js';
import { health, readyz } from './modules/health/health.controller.js';

const r = Router();

r.get('/health', health);
r.get('/readyz', readyz);

r.post('/document-types', DocTypes.create);
r.get('/document-types', DocTypes.list);

r.post('/employees', Employees.create);
r.put('/employees/:id', Employees.update);
r.post('/employees/:id/link-documents', Employees.linkUnlink);
r.get('/employees/:id/status', Employees.status);

r.post('/employees/:id/documents/send', Docs.send);
r.get('/documents/pending', Docs.listPending);

export default r;
