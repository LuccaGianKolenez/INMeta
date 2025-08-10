import fs from 'fs';
import path from 'path';
import { pool } from './db.js';

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function appliedVersions(): Promise<Set<number>> {
  const { rows } = await pool.query<{ version: number }>('SELECT version FROM schema_migrations');
  return new Set(rows.map(r => r.version));
}

async function applyMigration(version: number, sql: string) {
  await pool.query('BEGIN');
  try {
    await pool.query(sql);
    await pool.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
    await pool.query('COMMIT');
    console.log(`Applied migration ${version}`);
  } catch (e) {
    await pool.query('ROLLBACK');
    console.error(`Failed migration ${version}`, e);
    process.exitCode = 1;
    throw e;
  }
}

(async () => {
  await ensureMigrationsTable();

  const dir = path.resolve('src/db/migrations');
  const files = fs.readdirSync(dir)
    .filter(f => /^\d+_.+\.sql$/.test(f))
    .sort((a, b) => Number(a.split('_')[0]) - Number(b.split('_')[0]));

  const done = await appliedVersions();

  for (const f of files) {
    const v = Number(f.split('_')[0]);
    if (!done.has(v)) {
      const sql = fs.readFileSync(path.join(dir, f), 'utf8');
      await applyMigration(v, sql);
    }
  }

  console.log('Migrations up to date.');
  await pool.end();
})();
