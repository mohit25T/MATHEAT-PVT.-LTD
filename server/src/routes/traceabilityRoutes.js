import express from 'express';
import { buildTraceabilityTree } from '../services/traceabilityService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/traceability/search?q=H45872
router.get('/search', authenticate, async (req, res, next) => {
  try {
    const query = req.query.q || req.query.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a search term (Heat No, Batch ID, PO, Part No, or Certificate No).' });
    }

    const data = await buildTraceabilityTree(query);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
