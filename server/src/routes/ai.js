import { Router } from 'express';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { Service } from '../models/Service.js';
import { Token } from '../models/Token.js';
import { answerWithFallback } from '../services/aiService.js';

const router = Router();
router.post('/chat', authenticate, allowRoles('CUSTOMER', 'ENTERPRISE'), async (req, res, next) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ message: 'Enter a message first.' });
    if (message.length > 1500) return res.status(400).json({ message: 'Please keep messages under 1,500 characters.' });
    let context;
    let systemPrompt;
    if (req.user.role === 'CUSTOMER') {
      const services = await Service.find({ isActive: true }).select('name category description location averageMinutes enterpriseName').limit(100).lean();
      const tokens = await Token.find({ customerId: req.user._id }).sort({ createdAt: -1 }).limit(5).lean();
      context = { services, recentTokens: tokens.map(({ tokenNumber, serviceName, status, createdAt }) => ({ tokenNumber, serviceName, status, createdAt })) };
      systemPrompt = 'You are QueueLess customer support. Help customers discover services, understand the token process, and explain estimated waiting times. Use only the supplied application context for claims about live services or tokens. Never claim to book, cancel, or change a token; direct the user to the website controls. Explain that waiting estimates are approximate and based on active tokens ahead multiplied by the service average duration. Be concise and friendly.';
    } else {
      const services = await Service.find({ enterpriseId: req.user._id }).select('name category averageMinutes isActive').lean();
      const tokens = await Token.find({ enterpriseId: req.user._id, status: { $in: ['WAITING', 'SERVING'] } }).sort({ createdAt: 1 }).limit(100).lean();
      context = { ownServices: services, activeQueue: tokens.map(({ tokenNumber, serviceName, customerName, status, createdAt }) => ({ tokenNumber, serviceName, customerName, status, createdAt })) };
      systemPrompt = 'You are QueueLess enterprise operations assistant. Summarize only the authenticated enterprise’s supplied queue and services. Offer practical queue-efficiency suggestions. Do not reveal data from other enterprises and do not claim to change tokens or services; use the dashboard controls for actions.';
    }
    const result = await answerWithFallback([
      { role: 'system', content: `${systemPrompt}\nApplication context (JSON): ${JSON.stringify(context)}` },
      { role: 'user', content: message }
    ]);
    res.json(result);
  } catch (error) { next(error); }
});
export default router;
