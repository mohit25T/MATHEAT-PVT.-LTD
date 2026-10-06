import express from 'express';
import * as ncrController from '../controllers/ncrController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', ncrController.getAll);
router.post('/:id/disposition', ncrController.disposition);
router.delete('/:id', ncrController.deleteNcr);

export default router;
