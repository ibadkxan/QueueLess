import { Router } from 'express';
import { Service } from '../models/Service.js';
import { Token } from '../models/Token.js';
import { authenticate, allowRoles } from '../middleware/auth.js';

const router = Router();
router.post('/', authenticate, allowRoles('CUSTOMER'), async (req, res, next) => {
  try {
    const service = await Service.findOne({ _id: req.body?.serviceId, isActive: true });
    if (!service) return res.status(404).json({ message: 'This service is no longer available.' });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const count = await Token.countDocuments({ serviceId: service._id, createdAt: { $gte: today } });
    const token = await Token.create({
      customerId: req.user._id, customerName: req.user.name,
      serviceId: service._id, serviceName: service.name, enterpriseId: service.enterpriseId,
      tokenNumber: count + 1
    });
    res.status(201).json({ ...token.toObject(), estimatedWaitMinutes: await estimateWait(service, token) });
  } catch (error) { next(error); }
});
async function estimateWait(service, token) {
  const ahead = await Token.countDocuments({ serviceId: service._id, createdAt: { $lt: token.createdAt }, status: { $in: ['WAITING', 'SERVING'] } });
  return ahead * service.averageMinutes;
}
router.get('/mine', authenticate, allowRoles('CUSTOMER'), async (req, res, next) => {
  try {
    const tokens = await Token.find({ customerId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const output = await Promise.all(tokens.map(async (token) => {
      const service = await Service.findById(token.serviceId).select('averageMinutes');
      const ahead = token.status === 'WAITING' ? await Token.countDocuments({ serviceId: token.serviceId, createdAt: { $lt: token.createdAt }, status: { $in: ['WAITING', 'SERVING'] } }) : 0;
      return { ...token.toObject(), estimatedWaitMinutes: ahead * (service?.averageMinutes || 15) };
    }));
    res.json(output);
  } catch (error) { next(error); }
});
router.get('/enterprise', authenticate, allowRoles('ENTERPRISE'), async (req, res, next) => {
  try { res.json(await Token.find({ enterpriseId: req.user._id, status: { $in: ['WAITING', 'SERVING'] } }).sort({ createdAt: 1 }).limit(200)); }
  catch (error) { next(error); }
});
router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!['SERVING', 'COMPLETED', 'CANCELLED', 'WAITING'].includes(status)) return res.status(400).json({ message: 'Invalid token status.' });
    const filter = { _id: req.params.id };
    if (req.user.role === 'ENTERPRISE') filter.enterpriseId = req.user._id;
    else if (req.user.role === 'CUSTOMER') { filter.customerId = req.user._id; if (status !== 'CANCELLED') return res.status(403).json({ message: 'Customers can only cancel their own tokens.' }); }
    else if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Not allowed.' });
    const token = await Token.findOneAndUpdate(filter, { status, ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}) }, { new: true });
    if (!token) return res.status(404).json({ message: 'Token not found.' });
    res.json(token);
  } catch (error) { next(error); }
});
export default router;
