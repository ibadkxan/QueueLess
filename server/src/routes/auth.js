import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

const router = Router();
const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, enterpriseName: user.enterpriseName || '' });
function issueToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret || 'development-only-change-me', { expiresIn: env.jwtExpiresIn });
}

async function register(req, res, role) {
  const { name, email, password, enterpriseName } = req.body || {};
  if (!name?.trim() || !email?.trim() || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Name, valid email, and a password of at least 8 characters are required.' });
  }
  if (role === 'ENTERPRISE' && !enterpriseName?.trim()) {
    return res.status(400).json({ message: 'Enterprise/business name is required.' });
  }
  try {
    const user = new User({
      name: name.trim(), email: email.trim().toLowerCase(), role,
      enterpriseName: role === 'ENTERPRISE' ? enterpriseName.trim() : undefined
    });
    await user.setPassword(password);
    await user.save();
    return res.status(201).json({ token: issueToken(user), user: safeUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
    throw error;
  }
}

router.post('/register/customer', async (req, res, next) => {
  try { await register(req, res, 'CUSTOMER'); } catch (error) { next(error); }
});
router.post('/register/enterprise', async (req, res, next) => {
  try { await register(req, res, 'ENTERPRISE'); } catch (error) { next(error); }
});
// There is deliberately no public admin-registration endpoint.
router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = req.body?.password;
    if (!email || typeof password !== 'string') return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.verifyPassword(password))) return res.status(401).json({ message: 'Invalid email or password.' });
    return res.json({ token: issueToken(user), user: safeUser(user) });
  } catch (error) { next(error); }
});
export default router;
