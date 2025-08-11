import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`API listening on :${port}`);
  });
}

export default app;
