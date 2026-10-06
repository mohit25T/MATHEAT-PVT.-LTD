import { Inventory, InventoryTransaction, Scrap } from '../models/Inventory.js';

// 1. GET INVENTORY SUMMARY & ITEMS
export const getAll = async (req, res, next) => {
  try {
    const items = await Inventory.find().populate('part').populate('customer', 'companyName').sort({ createdAt: -1 });
    const scrap = await Scrap.find().sort({ createdAt: -1 });

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
};

// 2. GET INVENTORY TRANSACTIONS
export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await InventoryTransaction.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, count: transactions.length, transactions });
  } catch (error) { next(error); }
};
