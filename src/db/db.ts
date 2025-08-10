import 'dotenv/config';
import { Pool, PoolClient, QueryResultRow } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log(`[DB] connected -> ${process.env.DATABASE_URL}`);
});
pool.on('error', (err) => {
  console.error('[DB] pool error:', err);
});

export async function query<T extends QueryResultRow = QueryResultRow>(sql: string, params?: any[]) {
  return pool.query<T>(sql, params);
}

export async function tx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function closePool() {
  await pool.end();
  console.log('[DB] pool ended');
}
