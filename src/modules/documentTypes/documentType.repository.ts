import { query } from '../../db/db.js';

export const DocumentTypeRepo = {
  async create(name: string) {
    const { rows } = await query<{ id: number }>(
      `INSERT INTO document_types (name) VALUES ($1) RETURNING id`,
      [name]
    );
    return rows[0]?.id;
  },

  async listAll() {
    const { rows } = await query(`SELECT id, name FROM document_types ORDER BY name ASC`);
    return rows;
  }
};
