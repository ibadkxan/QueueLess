import { Router } from 'express';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Token } from '../models/Token.js';

const router = Router();
router.get('/stats', authenticate, allowRoles('ADMIN'), async (_req, res, next) => {
  try {
    const [customers, enterprises, services, waitingTokens, allTokens] = await Promise.all([
      User.countDocuments({ role: 'CUSTOMER' }), User.countDocuments({ role: 'ENTERPRISE' }),
      Service.countDocuments(), Token.countDocuments({ status: 'WAITING' }), Token.countDocuments()
    ]);
    res.json({ customers, enterprises, services, waitingTokens, allTokens });
  } catch (error) { next(error); }
});
export default router;
