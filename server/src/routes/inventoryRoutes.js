import express from 'express';
import { Inventory, InventoryTransaction, Scrap } from '../models/Inventory.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/inventory
router.get('/', authenticate, async (req, res, next) => {
  try {
    const items = await Inventory.find().populate('part').populate('customer', 'companyName').sort({ createdAt: -1 });
    const scrap = await Scrap.find().sort({ createdAt: -1 });

    // Summary totals
    const customerStockKg = items.filter(i => i.ownership === 'CUSTOMER').reduce((acc, c) => acc + (c.weightKg || 0), 0);
    const companyStockKg = items.filter(i => i.ownership === 'COMPANY').reduce((acc, c) => acc + (c.weightKg || 0), 0);
    const scrapTotalKg = scrap.reduce((acc, s) => acc + (s.weightKg || 0), 0);

    res.json({
      success: true,
      summary: {
        customerStockKg,
        companyStockKg,
        scrapTotalKg,
        totalItems: items.length
      },
      items,
      scrap
    });
  } catch (error) { next(error); }
});

// GET /api/inventory/transactions
router.get('/transactions', authenticate, async (req, res, next) => {
  try {
    const transactions = await InventoryTransaction.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, count: transactions.length, transactions });
  } catch (error) { next(error); }
});

export default router;
