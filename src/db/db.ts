import 'dotenv/config';
import { Pool, PoolClient, QueryResult } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
  // ssl: { rejectUnauthorized: false } // habilite se precisar
});

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
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
