import fs from 'fs';
import path from 'path';
import { pool } from './db.js';

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function applied() {
  const { rows } = await pool.query<{ version: number }>('SELECT version FROM schema_migrations');
  return new Set(rows.map(r => r.version));
}

async function apply(version: number, sql: string) {
  await pool.query('BEGIN');
  try {
    await pool.query(sql);
    await pool.query('INSERT INTO schema_migrations(version) VALUES ($1)', [version]);
    await pool.query('COMMIT');
    console.log(`✔ migration ${version} applied`);
  } catch (e) {
    await pool.query('ROLLBACK');
    throw e;
  }
}

(async () => {
  await ensureTable();

  const dir = path.join(process.cwd(), 'src', 'db', 'migrations');
  const files = fs.readdirSync(dir)
    .filter(f => /^\d+_.+\.sql$/.test(f))
    .sort();

  const done = await applied();

  for (const f of files) {
    const version = Number(f.split('_')[0]);
    if (!done.has(version)) {
      const sql = fs.readFileSync(path.join(dir, f), 'utf8');
      await apply(version, sql);
    }
  }

  console.log('Migrations up to date.');
  await pool.end();
})();
