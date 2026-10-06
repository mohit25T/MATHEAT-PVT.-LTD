import express from 'express';
import * as batchController from '../controllers/batchController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', batchController.getAll);
router.get('/next-number', batchController.getNextBatchNumber);
router.get('/next-heat-number', batchController.getNextHeatNumber);
router.get('/:id', batchController.getById);
router.post('/', batchController.create);
router.post('/:id/load-furnace', batchController.loadFurnace);
router.post('/:id/start-cycle', batchController.startCycle);
router.post('/:id/record-cycle', batchController.recordCycle);
router.delete('/:id', batchController.deleteBatch);

export default router;
