import request from 'supertest';
import app from '../src/app';
import { resetDb } from './setup';
import { closePool } from '../src/db/db';

beforeEach(async () => { await resetDb(); });
afterAll(async () => { await closePool(); });

describe('Employees', () => {
  it('should create employee and link documents', async () => {
    await request(app).post('/api/document-types').send({ name: 'CPF' }).expect(201);
    await request(app).post('/api/document-types').send({ name: 'CTPS' }).expect(201);

    const emp = await request(app)
      .post('/api/employees')
      .send({ name: 'Colaborador X', cpf: '32165498700', hiredAt: '2024-01-01' })
      .expect(201);

    const id = emp.body.id;

    const linkRes = await request(app)
      .post(`/api/employees/${id}/required-docs`)
      .send({ add: [1, 2] })
      .expect(200);

    expect(Array.isArray(linkRes.body.pending)).toBe(true);
    expect(linkRes.body.pending.length).toBe(2);
  });

  it('should NOT unlink a document that is already SENT', async () => {
    await request(app).post('/api/document-types').send({ name: 'RG' }).expect(201);

    const emp = await request(app)
      .post('/api/employees')
      .send({ name: 'Colaborador Y', cpf: '98798798700', hiredAt: '2024-03-01' })
      .expect(201);
    const id = emp.body.id;

    await request(app)
      .post(`/api/employees/${id}/required-docs`)
      .send({ add: [1] })
      .expect(200);

    await request(app)
      .post(`/api/employees/${id}/documents`)
      .send({ documentTypeId: 1, name: 'rg.pdf' })
      .expect(201);

    // Tenta remover após envio: deve permanecer SENT (regra de negócio)
    await request(app)
      .post(`/api/employees/${id}/required-docs`)
      .send({ remove: [1] })
      .expect(200);

    const status = await request(app).get(`/api/employees/${id}/status`).expect(200);
    expect(status.body.sent).toHaveLength(1);
    expect(status.body.pending).toHaveLength(0);
  });
});
