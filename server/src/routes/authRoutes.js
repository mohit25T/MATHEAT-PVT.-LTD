import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Authentication
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/verify-admin-password', authController.verifyAdminPassword);

// User Management ("add user", list, edit, delete)
router.get('/users', authController.getUsers);
router.post('/users', authController.createUser);
router.put('/users/:id', authController.updateUser);
router.delete('/users/:id', authController.deleteUser);

export default router;
