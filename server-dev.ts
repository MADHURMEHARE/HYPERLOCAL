/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger limits for base64 image uploads (crucial for AI Vision)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Mount consolidated API router under /api
app.use('/api', apiRouter);

async function startServer() {
  // Development mode using Vite dev server middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  
  // Mount Vite middleware
  app.use(vite.middlewares);
  console.log('Vite development server mounted as middleware.');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(` COMMUNITY HERO LOCAL DEV SERVER RUNNING`);
    console.log(` Address: http://localhost:${PORT}`);
    console.log(` Mode:    DEVELOPMENT`);
    console.log(`=================================================`);
  });
}

startServer();
export default app;
