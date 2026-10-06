import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Authentication & Profile
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/verify-admin-password', authController.verifyAdminPassword);

// User Management ("add user", list, edit, delete, reset-password)
router.get('/users', authController.getUsers);
router.post('/users', authController.createUser);
router.put('/users/:id', authController.updateUser);
router.post('/users/:id/reset-password', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), authController.resetUserPassword);
router.delete('/users/:id', authController.deleteUser);

export default router;
