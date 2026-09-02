import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createApp } from './src/server/createApp';

dotenv.config();

const PORT = 3000;

// All route handlers live in ./src/server/createApp.ts so they can be
// exercised in isolation with supertest (no Vite/HTTP server required).
const app = createApp();

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RKGIT Safe Companion server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
