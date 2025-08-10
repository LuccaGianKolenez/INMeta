import { query } from '../../db/db';

export const EmployeeRepo = {
  async create(data: { name: string; cpf: string; hiredAt: string }) {
    const { rows } = await query<{ id: number }>(
      `INSERT INTO employees (name, cpf, hired_at) VALUES ($1,$2,$3) RETURNING id`,
      [data.name, data.cpf, data.hiredAt]
    );
    return rows[0]?.id;
  },

  async update(id: number, data: { name?: string; hiredAt?: string }) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (data.name) { fields.push(`name = $${i++}`); values.push(data.name); }
    if (data.hiredAt) { fields.push(`hired_at = $${i++}`); values.push(data.hiredAt); }
    if (!fields.length) return 0;

    fields.push(`updated_at = now()`);
    const sql = `UPDATE employees SET ${fields.join(', ')} WHERE id = $${i}`;
    values.push(id);
    const { rowCount } = await query(sql, values);
    return rowCount ?? 0;
  },

  async getById(id: number) {
    const { rows } = await query(`SELECT * FROM employees WHERE id = $1`, [id]);
    return rows[0];
  }
};
