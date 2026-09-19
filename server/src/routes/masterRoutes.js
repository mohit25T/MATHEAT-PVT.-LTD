import express from 'express';
import { Customer } from '../models/Customer.js';
import { Supplier } from '../models/Supplier.js';
import { Part } from '../models/Part.js';
import { Furnace } from '../models/Furnace.js';
import { ProcessMaster } from '../models/ProcessMaster.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// CUSTOMERS
router.get('/customers', authenticate, async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ companyName: 1 });
    res.json({ success: true, count: customers.length, customers });
  } catch (error) { next(error); }
});

router.post('/customers', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'), async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    await logAudit({ req, action: 'CREATE', module: 'CUSTOMERS', recordId: customer._id, entityType: 'Customer', newValue: customer });
    res.status(201).json({ success: true, customer });
  } catch (error) { next(error); }
});

// SUPPLIERS
router.get('/suppliers', authenticate, async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json({ success: true, count: suppliers.length, suppliers });
  } catch (error) { next(error); }
});

// PARTS
router.get('/parts', authenticate, async (req, res, next) => {
  try {
    const parts = await Part.find().populate('customer', 'companyName customerCode').sort({ partNumber: 1 });
    res.json({ success: true, count: parts.length, parts });
  } catch (error) { next(error); }
});

router.post('/parts', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER', 'QC_MANAGER'), async (req, res, next) => {
  try {
    const part = await Part.create(req.body);
    await logAudit({ req, action: 'CREATE', module: 'PARTS', recordId: part._id, entityType: 'Part', newValue: part });
    res.status(201).json({ success: true, part });
  } catch (error) { next(error); }
});

// PROCESSES
router.get('/processes', authenticate, async (req, res, next) => {
  try {
    const processes = await ProcessMaster.find().sort({ processName: 1 });
    res.json({ success: true, count: processes.length, processes });
  } catch (error) { next(error); }
});

// FURNACES
router.get('/furnaces', authenticate, async (req, res, next) => {
  try {
    const furnaces = await Furnace.find()
      .populate('currentBatch')
      .populate('currentOperator', 'firstName lastName')
      .sort({ furnaceId: 1 });
    res.json({ success: true, count: furnaces.length, furnaces });
  } catch (error) { next(error); }
});

router.put('/furnaces/:id/telemetry', authenticate, async (req, res, next) => {
  try {
    const { currentTemperature, currentCarbonPotential, status } = req.body;
    const furnace = await Furnace.findById(req.params.id);
    if (!furnace) return res.status(404).json({ success: false, message: 'Furnace not found' });

    if (currentTemperature !== undefined) furnace.currentTemperature = currentTemperature;
    if (currentCarbonPotential !== undefined) furnace.currentCarbonPotential = currentCarbonPotential;
    if (status) furnace.currentStatus = status;

    await furnace.save();
    res.json({ success: true, furnace });
  } catch (error) { next(error); }
});

export default router;
