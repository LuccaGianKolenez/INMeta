import request from 'supertest';
import app from '../src/app.js';
import { resetDb } from './setup.js';

describe('Flow', () => {
  beforeAll(resetDb);

  it('employee -> link -> send -> status -> pending', async () => {
    await request(app).post('/api/document-types').send({ name: 'CPF' });
    await request(app).post('/api/document-types').send({ name: 'CTPS' });

    const emp = await request(app).post('/api/employees').send({ name: 'John' });
    const empId = emp.body.id;

    await request(app).post('/api/employees/links').send({ employeeId: empId, add: [1,2] });

    const pending1 = await request(app).get('/api/documents/pending?page=1&pageSize=10');
    expect(pending1.status).toBe(200);
    expect(pending1.body.total).toBe(2);

    const sent = await request(app).post('/api/documents/send').send({ employeeId: empId, documentTypeId: 1 });
    expect(sent.status).toBe(200);
    expect(sent.body.status).toBe('SENT');

    const status = await request(app).get(`/api/employees/${empId}/documents-status`);
    expect(status.status).toBe(200);
    expect(status.body.sent.length).toBe(1);
    expect(status.body.pending.length).toBe(1);

    const pending2 = await request(app).get('/api/documents/pending?page=1&pageSize=10');
    expect(pending2.body.total).toBe(1);
  });
});
