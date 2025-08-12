import { query } from '../../db/db.js';

export async function create(input: { name: string; document?: string; hiredAt?: string }) {
  const { rows } = await query(
    `INSERT INTO employees (name, document, hired_at) VALUES ($1,$2,$3)
     RETURNING id, name, document, hired_at, created_at, updated_at`,
    [input.name, input.document ?? null, input.hiredAt ?? null]
  );
  return rows[0];
}

export async function update(id: number, input: { name?: string; document?: string; hiredAt?: string }) {
  const { rows } = await query(
    `UPDATE employees
        SET name = COALESCE($2, name),
            document = COALESCE($3, document),
            hired_at = COALESCE($4, hired_at),
            updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, document, hired_at, created_at, updated_at`,
    [id, input.name ?? null, input.document ?? null, input.hiredAt ?? null]
  );
  return rows[0];
}
