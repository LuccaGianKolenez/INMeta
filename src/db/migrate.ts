// src/db/migrate.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensurePool } from './db.js';

type Mig = { id: string; file: string; sql: string };

async function ensureSchemaMigrations() {
  await ensurePool().query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

function getMigrationsDir(): string {
  // 1) variável explícita, se quiser customizar
  const fromEnv = process.env.MIGRATIONS_DIR;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;

  // 2) mesma pasta do arquivo atual (src/db/) + migrations
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dirHere = path.resolve(__dirname, 'migrations');
  if (fs.existsSync(dirHere)) return dirHere;

  // 3) fallback para execução a partir do projeto
  const dirCwd = path.resolve(process.cwd(), 'src/db/migrations');
  if (fs.existsSync(dirCwd)) return dirCwd;

  throw new Error(
    `Pasta de migrations não encontrada. Procurei em:\n` +
    `- ${fromEnv ?? '(MIGRATIONS_DIR não definido)'}\n` +
    `- ${dirHere}\n` +
    `- ${dirCwd}`
  );
}

function loadMigrationsDir(): Mig[] {
  const dir = getMigrationsDir();
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // 001_..., 002_..., 003_...
  if (!files.length) {
    throw new Error(`Nenhum .sql encontrado em ${dir}`);
  }
  return files.map(file => ({
    id: file.replace(/\.sql$/i, ''),
    file,
    sql: fs.readFileSync(path.join(dir, file), 'utf8'),
  }));
}

async function appliedIds(): Promise<Set<string>> {
  const { rows } = await ensurePool().query<{ id: string }>('SELECT id FROM schema_migrations');
  return new Set(rows.map(r => r.id));
}

async function tableExists(name: string): Promise<boolean> {
  const { rows } = await ensurePool().query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema='public' AND table_name=$1
     ) AS exists`,
    [name]
  );
  return !!rows[0]?.exists;
}

async function sanityRepair(currentApplied: Set<string>): Promise<Set<string>> {
  // Se faltar alguma tabela essencial, limpamos o state para reaplicar todas
  const required = ['employees', 'document_types', 'employee_documents'];
  const missing: string[] = [];
  for (const t of required) if (!(await tableExists(t))) missing.push(t);

  if (!missing.length) return currentApplied;

  console.log('[DB] sanity: tabelas ausentes detectadas ->', missing.join(', '));
  const { rowCount } = await ensurePool().query('DELETE FROM schema_migrations');
  console.log('[DB] schema_migrations limpo (', rowCount, 'linhas )');
  return new Set();
}

async function migrate() {
  console.log('[DB] running migrations...');
  await ensureSchemaMigrations();

  const migs = loadMigrationsDir();
  let applied = await appliedIds();
  applied = await sanityRepair(applied);

  let count = 0;
  for (const m of migs) {
    if (applied.has(m.id)) continue;
    console.log(`→ applying ${m.file} ...`);
    await ensurePool().query('BEGIN');
    try {
      await ensurePool().query(m.sql);
      await ensurePool().query('INSERT INTO schema_migrations (id) VALUES ($1)', [m.id]);
      await ensurePool().query('COMMIT');
      count++;
      console.log(`✓ ${m.file} applied`);
    } catch (e) {
      await ensurePool().query('ROLLBACK');
      console.error(`✗ ${m.file} failed`, e);
      throw e;
    }
  }

  console.log(count ? `[DB] ${count} migration(s) applied` : '[DB] migrations up to date');

  // Sanidade final
  for (const t of ['employees', 'document_types', 'employee_documents']) {
    if (!await tableExists(t)) {
      throw new Error(`Sanity check falhou - tabela ausente: ${t}`);
    }
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('migrate failed', err);
    process.exit(1);
  });
