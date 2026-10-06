import express from 'express';
import * as documentController from '../controllers/documentController.js';

const router = express.Router();

router.get('/certificate/:batchId', documentController.getCertificate);
router.get('/invoice/:invoiceNumber(*)', documentController.getInvoice);
router.get('/verify/:certificateNumber', documentController.verifyCertificate);

export default router;
