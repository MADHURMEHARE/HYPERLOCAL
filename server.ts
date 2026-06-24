/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
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

// ==========================================
// VITE CLIENT DEV MIDDLEWARE & PRODUCTION INTEGRATION
// ==========================================

const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    
    // Mount Vite middleware
    app.use(vite.middlewares);
    console.log('Vite development server mounted as middleware.');
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Serve index.html for all non-API GET requests
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`Serving static files from ${distPath} in production.`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(` COMMUNITY HERO FULL-STACK REPOSITORIES RUNNING`);
    console.log(` Address: http://localhost:${PORT}`);
    console.log(` Mode:    ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`=================================================`);
  });
}

startServer();
export default app;
