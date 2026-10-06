import express from 'express';
import * as jobOrderController from '../controllers/jobOrderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', jobOrderController.getAll);
router.get('/next-number', jobOrderController.getNextJobOrderNumber);
router.get('/:id', jobOrderController.getById);
router.post('/', jobOrderController.create);
router.put('/:id', jobOrderController.update);
router.delete('/:id', jobOrderController.remove);

export default router;
