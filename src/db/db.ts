// src/db/db.ts
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';

let pool: Pool | null = null;

function buildConnectionString(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.DB_PORT ?? '5432';
  const user = process.env.DB_USER ?? 'inmeta_user';
  const pass = process.env.DB_PASSWORD ?? 'inmeta_pass';
  const db   = process.env.DB_NAME ?? 'inmeta';
  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${db}`;
}

export function ensurePool(): Pool {
  if (!pool) {
    const connectionString = buildConnectionString();
    pool = new Pool({ connectionString });
    console.log(`[DB] connected -> ${connectionString}`);
  }
  return pool!;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return ensurePool().query<T>(text, params);
}

export async function getClient(): Promise<PoolClient> {
  return ensurePool().connect();
}

export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await getClient();
  try {
    await c.query('BEGIN');
    const result = await fn(c);
    await c.query('COMMIT');
    return result;
  } catch (e) {
    try { await c.query('ROLLBACK'); } catch {}
    throw e;
  } finally {
    c.release();
  }
}

/** Limpa tabelas de teste sem apagar schema_migrations */
export async function resetDb(): Promise<void> {
  await query(`
    DO $$
    DECLARE r RECORD;
    BEGIN
      FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename <> 'schema_migrations'
      ) LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
      END LOOP;
    END $$;
  `);
}

export async function closePool(): Promise<void> {
  if (pool) {
    const p = pool;
    pool = null;
    try { await p.end(); } finally { console.log('[DB] pool ended'); }
  }
}
