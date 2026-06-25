import express from 'express';
import dotenv from 'dotenv';
import apiRouter from '../server/routes';

// Load environment variables
dotenv.config();

const app = express();

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

// Export the Express app as a Vercel Serverless Function
export default app;
