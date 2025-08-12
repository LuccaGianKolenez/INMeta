import { ensurePool, query, endPool } from '../src/db/db.js';

export async function resetDb() {
  ensurePool();
  await query(`TRUNCATE employee_documents RESTART IDENTITY CASCADE;`);
  await query(`TRUNCATE document_types RESTART IDENTITY CASCADE;`);
  await query(`TRUNCATE employees RESTART IDENTITY CASCADE;`);
}

afterAll(async () => { await endPool(); });
