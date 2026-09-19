import express from 'express';
import QRCode from 'qrcode';
import { Batch } from '../models/Batch.js';
import { JobOrder } from '../models/JobOrder.js';
import { Furnace } from '../models/Furnace.js';
import { Recipe } from '../models/Recipe.js';
import { FurnaceCycle } from '../models/FurnaceCycle.js';
import { Inventory, InventoryTransaction } from '../models/Inventory.js';
import { BATCH_STATUS, FURNACE_STATUS } from '../config/constants.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// GET /api/batches
router.get('/', authenticate, async (req, res, next) => {
  try {
    const batches = await Batch.find()
      .populate('jobOrder')
      .populate('customer', 'companyName customerCode')
      .populate('part')
      .populate('furnace')
      .populate('recipe')
      .populate('operator', 'firstName lastName badgeNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: batches.length, batches });
  } catch (error) { next(error); }
});

// GET /api/batches/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('jobOrder')
      .populate('customer')
      .populate('part')
      .populate('furnace')
      .populate('recipe')
      .populate('operator');
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, batch });
  } catch (error) { next(error); }
});

// POST /api/batches (Create Batch with strict capacity validation)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER'), async (req, res, next) => {
  try {
    const {
      jobOrder: jobOrderId,
      furnace: furnaceId,
      recipe: recipeId,
      inputQuantity,
      inputWeightKg,
      scheduledStartTime,
      operator: operatorId
    } = req.body;

    const jobOrder = await JobOrder.findById(jobOrderId).populate('part');
    if (!jobOrder) return res.status(400).json({ success: false, message: 'Job Order not found.' });

    const furnace = await Furnace.findById(furnaceId);
    if (!furnace) return res.status(400).json({ success: false, message: 'Furnace not found.' });

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(400).json({ success: false, message: 'Recipe not found.' });

    // Enforce Recipe Approval
    if (!recipe.isApproved) {
      return res.status(400).json({
        success: false,
        message: `Recipe ${recipe.recipeCode} Rev ${recipe.revision} is not approved by Metallurgy/QC. Cannot start batch with unapproved recipe.`
      });
    }

    // Furnace Overloading Validation: Loaded Weight <= Capacity
    const weightNum = Number(inputWeightKg);
    if (weightNum > furnace.capacityKg) {
      return res.status(400).json({
        success: false,
        message: `Furnace Overload Error: Input weight (${weightNum} kg) exceeds furnace capacity (${furnace.capacityKg} kg). Overloading is strictly prohibited.`
      });
    }

    // Generate unique Batch ID
    const count = await Batch.countDocuments();
    const batchId = `HT-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // Generate QR Code data url for batch tags
    const qrDataUrl = await QRCode.toDataURL(`MATHEAT-BATCH|ID:${batchId}|HEAT:${jobOrder.heatNumber}|PART:${jobOrder.part.partNumber}`);

    const batch = await Batch.create({
      batchId,
      jobOrder: jobOrder._id,
      customer: jobOrder.customer,
      part: jobOrder.part._id,
      grn: jobOrder.grn,
      materialGrade: jobOrder.part.materialGrade,
      heatNumber: jobOrder.heatNumber,
      furnace: furnace._id,
      furnaceId: furnace.furnaceId,
      recipe: recipe._id,
      recipeRevision: recipe.revision,
      operator: operatorId || req.user._id,
      inputQuantity: Number(inputQuantity),
      inputWeightKg: weightNum,
      scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : new Date(),
      status: BATCH_STATUS.PLANNED,
      qrCodeUrl: qrDataUrl
    });

    // Link batch to Job Order
    jobOrder.batches.push(batch._id);
    await jobOrder.save();

    await logAudit({
      req,
      action: 'CREATE_BATCH',
      module: 'BATCH',
      recordId: batch._id,
      entityType: 'Batch',
      newValue: { batchId, furnaceId: furnace.furnaceId, weightKg: weightNum, heatNumber: batch.heatNumber }
    });

    res.status(201).json({ success: true, batch });
  } catch (error) { next(error); }
});

// POST /api/batches/:id/load-furnace (Loading screen validation & Furnace Status update)
router.post('/:id/load-furnace', authenticate, async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    const furnace = await Furnace.findById(batch.furnace);
    if (!furnace) return res.status(404).json({ success: false, message: 'Furnace not found' });

    furnace.currentStatus = FURNACE_STATUS.LOADING;
    furnace.currentBatch = batch._id;
    furnace.currentBatchId = batch.batchId;
    furnace.loadedWeightKg = batch.inputWeightKg;
    furnace.currentOperator = req.user._id;
    await furnace.save();

    batch.status = BATCH_STATUS.LOADING;
    await batch.save();

    // Inventory Movement to Furnace
    await InventoryTransaction.create({
      transactionId: `TXN-LOAD-${Date.now()}`,
      partNumber: batch.materialGrade,
      heatNumber: batch.heatNumber,
      batchId: batch.batchId,
      quantity: batch.inputQuantity,
      weightKg: batch.inputWeightKg,
      fromLocation: 'RAW_BAY',
      toLocation: `FURNACE_${furnace.furnaceId}`,
      transactionType: 'ISSUE_TO_FURNACE',
      referenceDocumentType: 'BATCH',
      referenceDocumentNumber: batch.batchId,
      user: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`
    });

    await logAudit({ req, action: 'FURNACE_LOAD', module: 'FURNACE', recordId: furnace._id, description: `Loaded batch ${batch.batchId} (${batch.inputWeightKg} kg) into ${furnace.furnaceId}` });

    res.json({ success: true, message: `Furnace ${furnace.furnaceId} loaded with Batch ${batch.batchId}`, furnace, batch });
  } catch (error) { next(error); }
});

// POST /api/batches/:id/start-cycle (Operator starts heat treatment cycle)
router.post('/:id/start-cycle', authenticate, async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id).populate('recipe');
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    const furnace = await Furnace.findById(batch.furnace);
    const recipe = batch.recipe;

    furnace.currentStatus = FURNACE_STATUS.HEATING;
    furnace.targetTemperature = recipe.targetTemperature;
    furnace.currentCarbonPotential = recipe.carbonPotential;
    furnace.cycleStartTime = new Date();
    await furnace.save();

    batch.status = BATCH_STATUS.HEATING;
    batch.actualStartTime = new Date();
    await batch.save();

    // Create FurnaceCycle record initialized with recipe targets
    const count = await FurnaceCycle.countDocuments();
    const cycle = await FurnaceCycle.create({
      cycleId: `FC-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`,
      batch: batch._id,
      batchId: batch.batchId,
      furnace: furnace._id,
      furnaceId: furnace.furnaceId,
      operator: req.user._id,
      startTime: new Date(),
      parameters: {
        heating: {
          targetTemp: recipe.targetTemperature,
          targetHeatingTimeMinutes: recipe.heatingTimeMinutes
        },
        soaking: {
          targetTemp: recipe.targetTemperature,
          targetSoakMinutes: recipe.soakingTimeMinutes,
          targetCarbonPotential: recipe.carbonPotential
        },
        quenching: {
          quenchMedium: recipe.quenchMedium,
          targetQuenchTemp: recipe.targetQuenchTemperature,
          targetQuenchTimeMinutes: recipe.quenchTimeMinutes
        },
        tempering: {
          targetTemp: recipe.temperingTemperature,
          targetTimeMinutes: recipe.temperingTimeMinutes
        }
      },
      cycleStatus: 'IN_PROGRESS'
    });

    res.json({ success: true, message: `Furnace Cycle ${cycle.cycleId} started for Batch ${batch.batchId}`, cycle, furnace, batch });
  } catch (error) { next(error); }
});

// POST /api/batches/:id/record-cycle (Operator records actual parameters and completes cycle)
router.post('/:id/record-cycle', authenticate, async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    const {
      actualHeatingTemp,
      actualSoakTemp,
      actualSoakMinutes,
      actualCarbonPotential,
      actualQuenchTemp,
      actualTemperingTemp,
      actualTemperingMinutes,
      energyKwh,
      gasM3,
      operatorRemarks
    } = req.body;

    const cycle = await FurnaceCycle.findOne({ batchId: batch.batchId }).sort({ createdAt: -1 });
    if (cycle) {
      cycle.parameters.heating.actualTemp = actualHeatingTemp;
      cycle.parameters.soaking.actualTemp = actualSoakTemp;
      cycle.parameters.soaking.actualSoakMinutes = actualSoakMinutes;
      cycle.parameters.soaking.actualCarbonPotential = actualCarbonPotential;
      cycle.parameters.quenching.actualQuenchTemp = actualQuenchTemp;
      cycle.parameters.tempering.actualTemp = actualTemperingTemp;
      cycle.parameters.tempering.actualTimeMinutes = actualTemperingMinutes;
      cycle.energyConsumedKwh = Number(energyKwh || 185);
      cycle.gasConsumedCubicMeters = Number(gasM3 || 0);
      cycle.operatorRemarks = operatorRemarks;
      cycle.cycleStatus = 'COMPLETED';
      cycle.endTime = new Date();
      await cycle.save();
    }

    // Advance batch status to QC_PENDING
    batch.status = BATCH_STATUS.QC_PENDING;
    batch.qcStatus = 'PENDING';
    batch.actualEndTime = new Date();
    batch.outputQuantity = batch.inputQuantity;
    batch.outputWeightKg = batch.inputWeightKg;
    await batch.save();

    // Release furnace to IDLE or QC_PENDING
    const furnace = await Furnace.findById(batch.furnace);
    if (furnace) {
      furnace.currentStatus = FURNACE_STATUS.IDLE;
      furnace.currentBatch = null;
      furnace.currentBatchId = null;
      furnace.loadedWeightKg = 0;
      await furnace.save();
    }

    await logAudit({ req, action: 'COMPLETE_CYCLE', module: 'FURNACE_CYCLE', recordId: batch._id, description: `Completed heat cycle for Batch ${batch.batchId}. Output: ${batch.outputWeightKg} kg.` });

    res.json({ success: true, message: `Batch ${batch.batchId} cycle completed and submitted to QC.`, batch, cycle });
  } catch (error) { next(error); }
});

export default router;
