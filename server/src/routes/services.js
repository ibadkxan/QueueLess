import { Router } from 'express';
import { Service } from '../models/Service.js';
import { authenticate, allowRoles } from '../middleware/auth.js';

const router = Router();
router.get('/', async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim().slice(0, 100);
    const filter = { isActive: true };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { enterpriseName: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
    res.json(await Service.find(filter).sort({ createdAt: -1 }).limit(100));
  } catch (error) { next(error); }
});
router.get('/mine', authenticate, allowRoles('ENTERPRISE'), async (req, res, next) => {
  try { res.json(await Service.find({ enterpriseId: req.user._id }).sort({ createdAt: -1 })); }
  catch (error) { next(error); }
});
router.post('/', authenticate, allowRoles('ENTERPRISE'), async (req, res, next) => {
  try {
    const { name, category, description, location, averageMinutes } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ message: 'Service name is required.' });
    const minutes = Number(averageMinutes || 15);
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 480) return res.status(400).json({ message: 'Average duration must be between 1 and 480 minutes.' });
    const service = await Service.create({
      enterpriseId: req.user._id, enterpriseName: req.user.enterpriseName || req.user.name,
      name: name.trim(), category: String(category || 'General').trim(),
      description: String(description || '').trim(), location: String(location || '').trim(), averageMinutes: minutes
    });
    res.status(201).json(service);
  } catch (error) { next(error); }
});
router.patch('/:id', authenticate, allowRoles('ENTERPRISE'), async (req, res, next) => {
  try {
    const allowed = ['name', 'category', 'description', 'location', 'averageMinutes', 'isActive'];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    const service = await Service.findOneAndUpdate({ _id: req.params.id, enterpriseId: req.user._id }, updates, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: 'Service not found for this enterprise.' });
    res.json(service);
  } catch (error) { next(error); }
});
export default router;
