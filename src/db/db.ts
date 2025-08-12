import { Pool, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;

function buildConnectionString() {
  const user = process.env.DB_USER ?? 'inmeta_user';
  const pass = process.env.DB_PASS ?? 'inmeta_pass';
  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.DB_PORT ?? '5432';
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

export async function endPool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[DB] pool ended');
  }
}
