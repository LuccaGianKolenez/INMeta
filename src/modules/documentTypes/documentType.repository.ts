import { query } from '../../db/db.js';

export async function createDocumentType(name: string) {
  const { rows } = await query(
    `INSERT INTO document_types (name) VALUES ($1) RETURNING id, name`,
    [name]
  );
  return rows[0];
}

export async function listDocumentTypes() {
  const { rows } = await query(
    `SELECT id, name FROM document_types ORDER BY id ASC`
  );
  return rows;
}
