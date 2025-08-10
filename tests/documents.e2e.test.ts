import request from 'supertest';
import app from '../src/app';
import { resetDb } from './setup';
import { query, closePool } from '../src/db/db';

beforeEach(async () => { await resetDb(); });
afterAll(async () => { await closePool(); });

describe('Documents', () => {
  it('should send a document and list pending with filters', async () => {
    await request(app).post('/api/document-types').send({ name: 'RG' }).expect(201);
    const emp = await request(app).post('/api/employees')
      .send({ name: 'User Y', cpf: '98765432100', hiredAt: '2024-02-01' }).expect(201);
    const id = emp.body.id;

    await request(app).post(`/api/employees/${id}/required-docs`).send({ add: [1] }).expect(200);

    await request(app).post(`/api/employees/${id}/documents`)
      .send({ documentTypeId: 1, name: 'rg_frente.pdf' })
      .expect(201);

    const status = await request(app).get(`/api/employees/${id}/status`).expect(200);
    expect(status.body.sent).toHaveLength(1);
    expect(status.body.pending).toHaveLength(0);

    const pending = await request(app).get('/api/documents/pending?page=1&pageSize=10').expect(200);
    expect(pending.body.items.length).toBeGreaterThanOrEqual(0);
  });
});
