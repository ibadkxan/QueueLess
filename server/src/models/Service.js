import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  enterpriseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  enterpriseName: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, default: 'General', trim: true, maxlength: 80 },
  description: { type: String, default: '', trim: true, maxlength: 1000 },
  location: { type: String, default: '', trim: true, maxlength: 200 },
  averageMinutes: { type: Number, min: 1, max: 480, default: 15 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Service = mongoose.model('Service', serviceSchema);
