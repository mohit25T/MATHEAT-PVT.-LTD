import express from 'express';
import * as purchaseController from '../controllers/purchaseController.js';

const router = express.Router();

router.get('/orders', purchaseController.getPurchaseOrders);
router.post('/orders', purchaseController.createPurchaseOrder);
router.patch('/orders/:id/status', purchaseController.updatePurchaseOrderStatus);
router.delete('/orders/:id', purchaseController.deletePurchaseOrder);

export default router;
