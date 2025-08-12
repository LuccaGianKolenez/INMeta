import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensurePool, query, endPool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, './migrations');

async function touchUpdatedAtFunction() {
  await query(`
    CREATE OR REPLACE FUNCTION touch_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
  `);
}

async function run() {
  ensurePool();
  console.log('[DB] running migrations...');
  await touchUpdatedAtFunction();

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf8');
    console.log(`[DB] > ${f}`);
    await query(sql);
  }
  console.log('[DB] migrations up to date');
}

run().then(endPool).catch(async (e) => { console.error(e); await endPool(); process.exit(1); });
