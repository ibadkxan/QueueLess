import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5001),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/queueless',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminName: process.env.ADMIN_NAME || 'QueueLess Admin',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 18000)
};

if (!env.jwtSecret && env.nodeEnv === 'production') {
  throw new Error('JWT_SECRET must be set in production.');
}
