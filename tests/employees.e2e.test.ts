import request from 'supertest';
import app from '../src/app';
import { resetDb } from './setup';
import { closePool } from '../src/db/db';

// Reseta o banco antes de cada teste para isolar os cenários
beforeEach(async () => { await resetDb(); });
// Fecha o pool ao final da suíte
afterAll(async () => { await closePool(); });

describe('Employees', () => {
  it('Cria employee e vincula documentos (idempotente)', async () => {
    // Cria dois tipos e captura os ids retornados
    const t1 = await request(app).post('/api/document-types').send({ name: 'CPF' }).expect(201);
    const t2 = await request(app).post('/api/document-types').send({ name: 'CTPS' }).expect(201);
    const docTypeId1 = Number(t1.body.id);
    const docTypeId2 = Number(t2.body.id);

    // CPF válido (com DV correto)
    const emp = await request(app).post('/api/employees')
      .send({ name: 'Colaborador X', cpf: '52998224725', hiredAt: '2024-01-01' })
      .expect(201);
    const employeeId = Number(emp.body.id);

    // Vincula ambos os tipos
    const link = await request(app)
      .post(`/api/employees/${employeeId}/required-docs`)
      .send({ add: [docTypeId1, docTypeId2] })
      .expect(200);

    expect(Array.isArray(link.body.pending)).toBe(true);
    expect(link.body.pending.length).toBe(2);

    // Vincula de novo (idempotente): não deve duplicar
    const again = await request(app)
      .post(`/api/employees/${employeeId}/required-docs`)
      .send({ add: [docTypeId1, docTypeId2] })
      .expect(200);

    const countDoc1 = again.body.pending.filter((d: any) => d.documentTypeId === docTypeId1).length;
    const countDoc2 = again.body.pending.filter((d: any) => d.documentTypeId === docTypeId2).length;
    expect(countDoc1).toBe(1);
    expect(countDoc2).toBe(1);
  });

  it('Valida CPF e duplicidade', async () => {
    // CPF inválido (curto) -> 400 do Zod
    await request(app).post('/api/employees')
      .send({ name: 'Invalido', cpf: '123', hiredAt: '2024-01-01' })
      .expect(400);

    // Cria um employee com CPF válido e nome >= 2/3 chars
    await request(app).post('/api/employees')
      .send({ name: 'Pessoa A', cpf: '15350946056', hiredAt: '2024-01-01' })
      .expect(201);

    // Tenta duplicar o mesmo CPF -> 409
    await request(app).post('/api/employees')
      .send({ name: 'Pessoa B', cpf: '15350946056', hiredAt: '2024-02-01' })
      .expect(409);
  });

  it('Atualiza employee (PUT) e retorna mensagem', async () => {
    const emp = await request(app).post('/api/employees')
      .send({ name: 'Colaborador Y', cpf: '11144477735', hiredAt: '2024-02-01' })
      .expect(201);
    const employeeId = Number(emp.body.id);

    const upd = await request(app).put(`/api/employees/${employeeId}`)
      .send({ name: 'Colaborador Y Atualizado' })
      .expect(200);

    // O controller do projeto retorna { message: "Employee updated" }
    expect(upd.body).toHaveProperty('message', 'Employee updated');
  });

  it('Não deve desvincular documento já SENT', async () => {
    const dt = await request(app).post('/api/document-types').send({ name: 'RG' }).expect(201);
    const docTypeId = Number(dt.body.id);

    const emp = await request(app).post('/api/employees')
      .send({ name: 'Colaborador Z', cpf: '15350946056', hiredAt: '2024-03-01' })
      .expect(201);
    const employeeId = Number(emp.body.id);

    await request(app).post(`/api/employees/${employeeId}/required-docs`)
      .send({ add: [docTypeId] })
      .expect(200);

    // Envia (vira SENT)
    await request(app).post(`/api/employees/${employeeId}/documents`)
      .send({ documentTypeId: docTypeId, name: 'rg.pdf' })
      .expect(201);

    // Tenta remover após enviar → regra: manter SENT
    await request(app).post(`/api/employees/${employeeId}/required-docs`)
      .send({ remove: [docTypeId] })
      .expect(200);

    // Confere status: sent=1, pending=0
    const status = await request(app).get(`/api/employees/${employeeId}/status`).expect(200);
    expect(status.body.sent).toHaveLength(1);
    expect(status.body.pending).toHaveLength(0);
  });
});
