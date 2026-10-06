import { User } from './models/User.js';
import { ROLES } from './config/constants.js';
import { seedDropdowns } from './controllers/dropdownController.js';

export const seedDatabase = async () => {
  // 1. Ensure all heat treatment enterprise dropdown options are seeded into MongoDB
  await seedDropdowns();

  // 2. Ensure initial admin user exists
  const userCount = await User.countDocuments();
  if (userCount > 0) return; // Already has users — skip

  console.log('[SEED] No users found. Creating default admin account...');

  await User.create({
    username: 'admin',
    email: 'admin@matheat.com',
    password: 'admin@123',
    firstName: 'Admin',
    lastName: 'MATHEAT',
    role: ROLES.ADMIN,
    department: 'Management',
    isActive: true
  });

  console.log('[SEED] ✅ Admin user created. Username: admin | Password: admin@123');
};

