import request from 'supertest';
import app from '../src/app';
import { resetDb } from './setup';
import { closePool } from '../src/db/db';

// Isolamento por teste
beforeEach(async () => { await resetDb(); });
// Fecha conexões ao final
afterAll(async () => { await closePool(); });

describe('Documents (envio e pendentes)', () => {
  it('Envia documento (PENDING -> SENT) e lista pendentes com paginação', async () => {
    const dt = await request(app).post('/api/document-types').send({ name: 'RG' }).expect(201);
    const docTypeId = Number(dt.body.id);

    const emp = await request(app).post('/api/employees')
      .send({ name: 'User Y', cpf: '15350946056', hiredAt: '2024-02-01' })
      .expect(201);
    const employeeId = Number(emp.body.id);

    // Vincula RG
    await request(app).post(`/api/employees/${employeeId}/required-docs`)
      .send({ add: [docTypeId] }).expect(200);

    // Envia (deve virar SENT)
    await request(app).post(`/api/employees/${employeeId}/documents`)
      .send({ documentTypeId: docTypeId, name: 'rg_frente.pdf' })
      .expect(201);

    // Status: sent=1, pending=0
    const status = await request(app).get(`/api/employees/${employeeId}/status`).expect(200);
    expect(status.body.sent).toHaveLength(1);
    expect(status.body.pending).toHaveLength(0);

    // Pendentes: deve trazer header X-Total-Count
    const pending = await request(app).get('/api/documents/pending?page=1&pageSize=10').expect(200);
    expect(pending.headers['x-total-count']).toBeDefined();
    expect(Array.isArray(pending.body.items)).toBe(true);
  });

  it('Não deve reenviar o mesmo documento (409)', async () => {
    const dt = await request(app).post('/api/document-types').send({ name: 'CPF' }).expect(201);
    const docTypeId = Number(dt.body.id);

    const emp = await request(app).post('/api/employees')
      .send({ name: 'User Z', cpf: '52998224725', hiredAt: '2024-01-10' })
      .expect(201);
    const employeeId = Number(emp.body.id);

    await request(app).post(`/api/employees/${employeeId}/required-docs`)
      .send({ add: [docTypeId] }).expect(200);

    await request(app).post(`/api/employees/${employeeId}/documents`)
      .send({ documentTypeId: docTypeId, name: 'cpf.pdf' })
      .expect(201);

    // Segundo envio → deve falhar (status já não é PENDING)
    await request(app).post(`/api/employees/${employeeId}/documents`)
      .send({ documentTypeId: docTypeId, name: 'cpf2.pdf' })
      .expect(409);
  });

  it('Não deve enviar se o tipo de documento não estiver vinculado (400)', async () => {
    const dt = await request(app).post('/api/document-types').send({ name: 'CTPS' }).expect(201);
    const docTypeId = Number(dt.body.id);

    const emp = await request(app).post('/api/employees')
      .send({ name: 'User W', cpf: '14538220620', hiredAt: '2024-01-01' })
      .expect(201);
    const employeeId = Number(emp.body.id);

    // Não vinculamos CTPS ao employee
    await request(app).post(`/api/employees/${employeeId}/documents`)
      .send({ documentTypeId: docTypeId, name: 'ctps.pdf' })
      .expect(400);
  });

  it('Concorrência: dois envios ao mesmo tempo -> um ganha (201), outro 409', async () => {
    const dt = await request(app).post('/api/document-types').send({ name: 'CPF' }).expect(201);
    const docTypeId = Number(dt.body.id);

    const emp = await request(app).post('/api/employees')
      .send({ name: 'User C', cpf: '11144477735', hiredAt: '2024-02-01' })
      .expect(201);
    const employeeId = Number(emp.body.id);

    await request(app).post(`/api/employees/${employeeId}/required-docs`)
      .send({ add: [docTypeId] }).expect(200);

    // Dispara duas requisições simultâneas
    const p1 = request(app).post(`/api/employees/${employeeId}/documents`)
      .send({ documentTypeId: docTypeId, name: 'cpf1.pdf' });
    const p2 = request(app).post(`/api/employees/${employeeId}/documents`)
      .send({ documentTypeId: docTypeId, name: 'cpf2.pdf' });

    const [r1, r2] = await Promise.all([p1, p2]);
    const codes = [r1.status, r2.status].sort();
    expect(codes).toEqual([201, 409]); // exatamente um sucesso, um conflito
  });

  it('Filtros em /documents/pending por employeeId e documentTypeId', async () => {
    // Tipos
    const t1 = await request(app).post('/api/document-types').send({ name: 'CPF' }).expect(201);
    const t2 = await request(app).post('/api/document-types').send({ name: 'RG' }).expect(201);
    const docTypeId1 = Number(t1.body.id);
    const docTypeId2 = Number(t2.body.id);

    // Employees com nomes válidos e CPFs válidos
    const e1 = await request(app).post('/api/employees')
      .send({ name: 'Alice', cpf: '15350946056', hiredAt: '2024-01-01' }).expect(201);
    const e2 = await request(app).post('/api/employees')
      .send({ name: 'Bruno', cpf: '11144477735', hiredAt: '2024-01-01' }).expect(201);
    const emp1 = Number(e1.body.id);
    const emp2 = Number(e2.body.id);

    // Vincula pendências
    await request(app).post(`/api/employees/${emp1}/required-docs`).send({ add: [docTypeId1, docTypeId2] }).expect(200);
    await request(app).post(`/api/employees/${emp2}/required-docs`).send({ add: [docTypeId1] }).expect(200);

    // Lista geral com paginação
    const res = await request(app).get('/api/documents/pending?page=1&pageSize=2').expect(200);
    expect(res.headers['x-total-count']).toBeDefined();
    expect(Array.isArray(res.body.items)).toBe(true);

    // Filtro por employeeId
    const byEmp = await request(app)
      .get(`/api/documents/pending?page=1&pageSize=10&employeeId=${emp2}`)
      .expect(200);
    expect(byEmp.body.items.every((x: any) => x.employeeId === emp2)).toBe(true);

    // Filtro por documentTypeId (RG)
    const byType = await request(app)
      .get(`/api/documents/pending?page=1&pageSize=10&documentTypeId=${docTypeId2}`)
      .expect(200);
    expect(byType.body.items.every((x: any) => x.documentTypeId === docTypeId2)).toBe(true);
  });
});
