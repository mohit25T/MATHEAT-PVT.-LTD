import express from 'express';
import * as inventoryController from '../controllers/inventoryController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', inventoryController.getAll);
router.get('/transactions', inventoryController.getTransactions);

export default router;
