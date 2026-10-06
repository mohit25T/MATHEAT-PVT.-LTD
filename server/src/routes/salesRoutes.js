import express from 'express';
import {
  getEnquiries,
  getNextEnquiryNo,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getQuotations,
  getNextQuotationNo,
  createQuotation,
  updateQuotation,
  convertQuotationToJobOrder,
  deleteQuotation
} from '../controllers/salesController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/enquiries', getEnquiries);
router.get('/enquiries/next-number', getNextEnquiryNo);
router.post('/enquiries', authenticate, createEnquiry);
router.put('/enquiries/:id', authenticate, updateEnquiry);
router.delete('/enquiries/:id', authenticate, deleteEnquiry);

router.get('/quotations', getQuotations);
router.get('/quotations/next-number', getNextQuotationNo);
router.post('/quotations', authenticate, createQuotation);
router.put('/quotations/:id', authenticate, updateQuotation);
router.post('/quotations/:id/convert-job-order', authenticate, convertQuotationToJobOrder);
router.delete('/quotations/:id', authenticate, deleteQuotation);

export default router;
