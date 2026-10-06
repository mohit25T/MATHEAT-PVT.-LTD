import express from 'express';
import * as gstController from '../controllers/gstController.js';

const router = express.Router();

router.get('/lookup/:gstin', gstController.lookupGstin);

export default router;
