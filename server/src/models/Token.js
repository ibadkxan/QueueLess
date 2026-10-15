import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customerName: { type: String, required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
  serviceName: { type: String, required: true },
  enterpriseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['WAITING', 'SERVING', 'COMPLETED', 'CANCELLED'], default: 'WAITING' },
  tokenNumber: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

tokenSchema.index({ serviceId: 1, createdAt: 1 });
export const Token = mongoose.model('Token', tokenSchema);
