import { query } from '../src/db/db';

export async function resetDb() {
  await query('TRUNCATE employee_documents RESTART IDENTITY CASCADE');
  await query('TRUNCATE document_types RESTART IDENTITY CASCADE');
  await query('TRUNCATE employees RESTART IDENTITY CASCADE');
}
