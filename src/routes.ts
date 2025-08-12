import { Router } from 'express';
import { health, readyz } from './modules/health/health.controller.js';
import * as DocTypes from './modules/documentTypes/documentType.controller.js';
import { validate, idParamSchema } from './middlewares/validate.js';
import { createDocumentTypeSchema } from './modules/documentTypes/documentType.schemas.js';
import * as Employees from './modules/employees/employee.controller.js';
import { createEmployeeSchema, updateEmployeeSchema } from './modules/employees/employee.schemas.js';
import * as EmpLinks from './modules/employees/employee.links.controller.js';
import { upsertLinksSchema } from './modules/employees/employee.links.schemas.js';
import * as Docs from './modules/documents/document.controller.js';
import { sendDocumentSchema } from './modules/documents/document.schemas.js';
import * as EmpStatus from './modules/employees/employee.status.controller.js';
import * as DocList from './modules/documents/document.list.controller.js';
import { listPending as listPendingCtrl } from './modules/documents/pending.controller.js';

const r = Router();

r.get('/health', health);
r.get('/readyz', readyz);

r.post('/document-types', validate(createDocumentTypeSchema), DocTypes.create);
r.get('/document-types', DocTypes.list);

r.post('/employees', validate(createEmployeeSchema), Employees.create);
r.put('/employees/:id', validate(updateEmployeeSchema), Employees.update);
r.post('/employees/links', validate(upsertLinksSchema), EmpLinks.upsertLinks);
r.get('/employees/:id/documents-status', validate(idParamSchema, 'params'), EmpStatus.documentsStatus);

r.post('/documents/send', validate(sendDocumentSchema), Docs.sendDocument);
r.get('/documents/pending', DocList.listPending);

r.get('/api/documents/pending', listPendingCtrl);


export default r;




