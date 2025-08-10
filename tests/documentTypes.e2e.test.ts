import request from 'supertest';
import app from '../src/app';
import { resetDb } from './setup';
import { closePool } from '../src/db/db';

beforeEach(async () => { await resetDb(); });
afterAll(async () => { await closePool(); });

describe('Document Types', () => {
  it('POST /api/document-types cria um tipo (201) e retorna id', async () => {
    const res = await request(app)
      .post('/api/document-types')
      .send({ name: 'CPF' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(Number(res.body.id)).toBeGreaterThan(0);
  });

  it('POST /api/document-types com nome duplicado deve dar 409', async () => {
    await request(app).post('/api/document-types').send({ name: 'RG' }).expect(201);
    await request(app).post('/api/document-types').send({ name: 'RG' }).expect(409);
  });

  it('POST /api/document-types sem name deve dar 400 (Zod)', async () => {
    await request(app).post('/api/document-types').send({}).expect(400);
  });

  it('GET /api/document-types lista os tipos', async () => {
    await request(app).post('/api/document-types').send({ name: 'CTPS' }).expect(201);
    const list = await request(app).get('/api/document-types').expect(200);
    expect(Array.isArray(list.body.items) || Array.isArray(list.body)).toBe(true);
  });
});
