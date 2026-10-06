import express from 'express';
import {
  getInstruments,
  createInstrument,
  updateInstrument,
  deleteInstrument
} from '../controllers/instrumentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getInstruments);
router.post('/', authenticate, createInstrument);
router.put('/:id', authenticate, updateInstrument);
router.delete('/:id', authenticate, deleteInstrument);

export default router;
