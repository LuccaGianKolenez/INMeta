import 'dotenv/config';
import app from './app.js';
import { closePool } from './db/db.js';

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});

// Evita sockets zumbis em proxies/load balancers
server.keepAliveTimeout = 65_000; 
server.headersTimeout = 66_000;   

async function shutdown(sig: string) {
  console.log(`[SYS] ${sig} received. Shutting down...`);
  server.close(async () => {
    try {
      await closePool();
      console.log('[SYS] DB pool closed');
    } finally {
      process.exit(0);
    }
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
