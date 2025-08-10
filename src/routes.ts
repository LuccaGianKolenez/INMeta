import { Router } from 'express';
import { validate } from './middlewares/validate.js';

import { createEmployeeSchema, linkUnlinkSchema, updateEmployeeSchema } from './modules/employees/employee.schemas.js';
import { EmployeeController } from './modules/employees/employee.controller.js';

import { createDocTypeSchema } from './modules/documentTypes/documentType.schemas.js';
import { DocumentTypeController } from './modules/documentTypes/documentType.controller.js';

import { sendDocSchema, listPendingSchema } from './modules/documents/document.schemas.js';
import { DocumentController } from './modules/documents/document.controller.js';

import { query } from './db/db.js';

const r = Router();

r.get('/health', (_req, res) => res.json({ ok: true }));
r.get('/readyz', async (_req, res, next) => {
  try {
    await query('SELECT 1');
    res.json({ ready: true });
  } catch (e) { next(e); }
});

// Employees
r.post('/employees', validate(createEmployeeSchema), EmployeeController.create);
r.put('/employees/:id', validate(updateEmployeeSchema), EmployeeController.update);
r.post('/employees/:id/required-docs', validate(linkUnlinkSchema), EmployeeController.linkUnlink);
r.get('/employees/:id/status', EmployeeController.status);

// Document types
r.post('/document-types', validate(createDocTypeSchema), DocumentTypeController.create);
r.get('/document-types', DocumentTypeController.list); // 👈 novo

// Documents
r.post('/employees/:id/documents', validate(sendDocSchema), DocumentController.send);
r.get('/documents/pending', validate(listPendingSchema), DocumentController.listPending);

export default r;
