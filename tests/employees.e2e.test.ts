import request from 'supertest';
import app from '../src/app';
import { resetDb } from './setup';
import { query, closePool } from '../src/db/db';

beforeAll(async () => { });
beforeEach(async () => { await resetDb(); });
afterAll(async () => { await closePool(); });

describe('Employees', () => {
  it('should create employee and link documents', async () => {
    await request(app).post('/api/document-types').send({ name: 'CPF' }).expect(201);
    await request(app).post('/api/document-types').send({ name: 'CTPS' }).expect(201);

    const emp = await request(app).post('/api/employees')
      .send({ name: 'Colaborador X', cpf: '12345678901', hiredAt: '2024-01-01' })
      .expect(201);

    const id = emp.body.id;

    const linkRes = await request(app)
      .post(`/api/employees/${id}/required-docs`)
      .send({ add: [1, 2] })
      .expect(200);

    expect(Array.isArray(linkRes.body.pending)).toBe(true);
    expect(linkRes.body.pending.length).toBe(2);
  });
});
