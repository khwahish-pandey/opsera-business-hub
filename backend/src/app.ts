import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/error';
import { config } from './config';

import path from 'path';
import fs from 'fs';

const app = express();

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);
      const allowedOrigins = [config.frontendUrl, 'http://localhost:5173', 'http://localhost:3000'];
      if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'NEXORA ERP API Server Active' });
});

// API Routes
app.use('/api', routes);

// Serve Frontend Static Assets if available (Production / Single Docker deployment)
const possibleFrontendPaths = [
  path.join(__dirname, '../public_frontend'),
  path.join(__dirname, '../../frontend/dist'),
];

const frontendPath = possibleFrontendPaths.find((p) => fs.existsSync(p));
if (frontendPath) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

export default app;
