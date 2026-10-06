import express from 'express';
import * as commercialController from '../controllers/commercialController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dispatch', commercialController.getDispatches);
router.post('/dispatch', commercialController.createDispatch);

// Invoices CRUD & Sequential Numbering
router.get('/invoices/next-number', commercialController.getNextInvoiceNumber);
router.get('/invoices', commercialController.getInvoices);
router.get('/invoices/:id', commercialController.getInvoiceById);
router.post('/invoices', commercialController.createInvoice);
router.put('/invoices/:id', commercialController.updateInvoice);
router.delete('/invoices/:id', commercialController.deleteInvoice);

router.get('/costing', commercialController.getCosting);

export default router;
