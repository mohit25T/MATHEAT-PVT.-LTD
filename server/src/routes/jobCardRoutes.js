import express from 'express';
import {
  getJobCards,
  getNextJobCardNo,
  createJobCard,
  getJobCardById
} from '../controllers/jobCardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getJobCards);
router.get('/next-number', getNextJobCardNo);
router.get('/:id', getJobCardById);
router.post('/', authenticate, createJobCard);

export default router;
