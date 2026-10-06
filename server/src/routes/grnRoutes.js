import express from 'express';
import * as grnController from '../controllers/grnController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', grnController.getAll);
router.get('/next-number', grnController.getNextGrnNumber);
router.post('/', grnController.create);
router.delete('/:id', grnController.deleteGrn);

export default router;
