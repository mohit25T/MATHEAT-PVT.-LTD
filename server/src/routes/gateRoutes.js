import express from 'express';
import * as gateController from '../controllers/gateController.js';

const router = express.Router();

router.get('/entries', gateController.getEntries);
router.post('/entry', gateController.createEntry);
router.delete('/clear-all', gateController.clearAll);

export default router;
