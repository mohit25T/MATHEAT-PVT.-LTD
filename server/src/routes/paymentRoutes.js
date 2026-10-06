import express from 'express';
import {
  getPayments,
  getNextPaymentNo,
  recordPayment,
  getPaymentSummary,
  deletePayment
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPayments);
router.get('/next-number', getNextPaymentNo);
router.get('/summary', getPaymentSummary);
router.post('/', authenticate, recordPayment);
router.delete('/:id', authenticate, deletePayment);

export default router;
