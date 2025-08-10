import request from 'supertest';
import app from '../src/app';
import { resetDb } from './setup';
import { closePool } from '../src/db/db';

// Reseta o banco antes de cada teste para isolamento
beforeEach(async () => { await resetDb(); });
// Fecha o pool ao final da suíte
afterAll(async () => { await closePool(); });

describe('Health & Readiness', () => {
  it('GET /api/health deve responder 200', async () => {
    const res = await request(app).get('/api/health').expect(200);
    // Opcional: validar payload
    expect(res.body).toHaveProperty('ok');
  });

  it('GET /api/readyz deve responder 200 e pingar o DB', async () => {
    const res = await request(app).get('/api/readyz').expect(200);
    // Se você retornou { ready: true }
    expect(res.body).toHaveProperty('ready');
  });
});
