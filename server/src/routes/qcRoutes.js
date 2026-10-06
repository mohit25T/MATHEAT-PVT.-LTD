import express from 'express';
import * as qcController from '../controllers/qcController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', qcController.getAll);
router.get('/batch/:batchId', qcController.getByBatchId);
router.post('/', qcController.create);
router.post('/:id/approve', qcController.approve);

export default router;
