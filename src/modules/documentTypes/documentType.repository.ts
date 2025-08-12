import { query } from '../../db/db.js';

export async function create(name: string) {
  const { rows } = await query(
    `INSERT INTO document_types (name) VALUES ($1) RETURNING id, name, created_at, updated_at`,
    [name]
  );
  return rows[0];
}

export async function list() {
  const { rows } = await query(`SELECT id, name, created_at, updated_at FROM document_types ORDER BY id ASC`);
  return rows;
}
