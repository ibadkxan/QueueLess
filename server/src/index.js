import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import authRoutes from './routes/auth.js';
import serviceRoutes from './routes/services.js';
import tokenRoutes from './routes/tokens.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: '100kb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'QueueLess API', port: env.port }));
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  console.error(`[API] ${error.message}`);
  const status = error.status || (error.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ message: status === 500 ? 'An unexpected server error occurred.' : error.message });
});

try {
  await mongoose.connect(env.mongoUri);
  console.log('[DB] MongoDB connected.');
  app.listen(env.port, () => console.log(`[API] QueueLess listening at http://localhost:${env.port}`));
} catch (error) {
  console.error(`[DB] Could not connect to MongoDB: ${error.message}`);
  process.exit(1);
}
