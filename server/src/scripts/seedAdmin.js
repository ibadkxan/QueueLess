import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

if (!env.adminPassword || env.adminPassword === 'ChangeThis-Admin-123!') {
  console.error('Set a private ADMIN_PASSWORD in server/.env before seeding the admin.');
  process.exit(1);
}
if (!env.jwtSecret || env.jwtSecret === 'replace_this_with_a_long_random_secret') {
  console.error('Set a private JWT_SECRET in server/.env before seeding the admin.');
  process.exit(1);
}
try {
  await mongoose.connect(env.mongoUri);
  let admin = await User.findOne({ email: env.adminEmail });
  if (admin) {
    if (admin.role !== 'ADMIN') {
      admin.role = 'ADMIN';
      await admin.save();
    }
    console.log(`Admin already exists: ${env.adminEmail}`);
  } else {
    admin = new User({ name: env.adminName, email: env.adminEmail, role: 'ADMIN' });
    await admin.setPassword(env.adminPassword);
    await admin.save();
    console.log(`Admin created: ${env.adminEmail}`);
  }
} catch (error) {
  console.error(`Admin seeding failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
