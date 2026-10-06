import express from 'express';
import * as traceabilityController from '../controllers/traceabilityController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', traceabilityController.search);

export default router;
