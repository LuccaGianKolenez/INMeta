import { Pool } from 'pg';

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
});

pool.on('connect', () => {
  console.log(`[DB] ✅ Conectado ao banco: ${process.env.DB_NAME}`);
});

pool.on('error', (err) => {
  console.error(`[DB] ❌ Erro de conexão:`, err.message);
});

export default pool;
