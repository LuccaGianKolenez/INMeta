import request from 'supertest';
import app from '../src/app.js';
import { resetDb } from './setup.js';

describe('Document Types', () => {
  beforeAll(resetDb);

  it('create and list', async () => {
    const created = await request(app).post('/api/document-types').send({ name: 'CPF' });
    expect(created.status).toBe(201);
    const listed = await request(app).get('/api/document-types');
    expect(listed.status).toBe(200);
    expect(listed.body.length).toBe(1);
  });
});
