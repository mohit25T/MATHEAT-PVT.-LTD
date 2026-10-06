import express from 'express';
import {
  getReworks,
  getNextReworkNo,
  createRework,
  updateReworkStatus
} from '../controllers/reworkController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getReworks);
router.get('/next-number', getNextReworkNo);
router.post('/', authenticate, createRework);
router.patch('/:id/status', authenticate, updateReworkStatus);

export default router;
