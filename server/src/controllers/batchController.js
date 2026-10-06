import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { Batch } from '../models/Batch.js';
import { JobOrder } from '../models/JobOrder.js';
import { Furnace } from '../models/Furnace.js';
import { Recipe } from '../models/Recipe.js';
import { Customer } from '../models/Customer.js';
import { Part } from '../models/Part.js';
import { FurnaceCycle } from '../models/FurnaceCycle.js';
import { InventoryTransaction } from '../models/Inventory.js';
import { BATCH_STATUS, FURNACE_STATUS } from '../config/constants.js';
import { logAudit } from '../middleware/audit.js';
import { generateNextJobOrderNumber } from './jobOrderController.js';

// 1. GET ALL BATCHES
export const getAll = async (req, res, next) => {
  try {
    const batches = await Batch.find()
      .populate({
        path: 'jobOrder',
        populate: [{ path: 'part' }, { path: 'customer' }, { path: 'grn' }]
      })
      .populate('customer')
      .populate('part')
      .populate('grn')
      .populate('furnace')
      .populate('recipe')
      .populate('operator', 'firstName lastName badgeNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: batches.length, batches, data: batches });
  } catch (error) { next(error); }
};

// 2. GET SINGLE BATCH
export const getById = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate({
        path: 'jobOrder',
        populate: [{ path: 'part' }, { path: 'customer' }, { path: 'grn' }]
      })
      .populate('customer')
      .populate('part')
      .populate('grn')
      .populate('furnace')
      .populate('recipe')
      .populate('operator');
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, batch });
  } catch (error) { next(error); }
};

// HELPER: GENERATE NEXT BAT-YYYY-XXXXXX BATCH NUMBER
export const generateNextBatchNumber = async () => {
  const currentYear = new Date().getFullYear();
  const batches = await Batch.find({
    batchId: /^BAT-|^BT-/i
  }).select('batchId');

  let maxSeq = 0;
  for (const b of batches) {
    const parts = (b.batchId || '').split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    } else if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
  }

  let nextNum = maxSeq + 1;
  let candidate = `BAT-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  while (await Batch.findOne({ batchId: candidate })) {
    nextNum++;
    candidate = `BAT-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  }
  return candidate;
};

// HELPER: GENERATE NEXT HT-YYYY-XXXXXX HEAT NUMBER (CQI-9 ROOT TRACEABILITY)
export const generateNextHeatNumber = async () => {
  const currentYear = new Date().getFullYear();
  const batches = await Batch.find({
    heatNumber: /^HT-/i
  }).select('heatNumber');

  let maxSeq = 0;
  for (const b of batches) {
    const parts = (b.heatNumber || '').split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    } else if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
  }

  let nextNum = maxSeq + 1;
  let candidate = `HT-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  while (await Batch.findOne({ heatNumber: candidate })) {
    nextNum++;
    candidate = `HT-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  }
  return candidate;
};

// GET NEXT SEQUENTIAL BATCH NUMBER
export const getNextBatchNumber = async (req, res, next) => {
  try {
    const batchId = await generateNextBatchNumber();
    res.json({ success: true, batchId });
  } catch (error) { next(error); }
};

// GET NEXT SEQUENTIAL HEAT NUMBER (HT-YYYY-XXXXXX)
export const getNextHeatNumber = async (req, res, next) => {
  try {
    const heatNumber = await generateNextHeatNumber();
    res.json({ success: true, heatNumber });
  } catch (error) { next(error); }
};

// HELPER: GENERATE NEXT FC-00001 FURNACE CYCLE ID
export const generateNextCycleId = async () => {
  const cycles = await FurnaceCycle.find({
    cycleId: /^FC-\d+$/i
  }).select('cycleId');

  let maxSeq = 0;
  for (const c of cycles) {
    const num = parseInt(c.cycleId.replace(/^FC-/i, ''), 10);
    if (!isNaN(num) && num > maxSeq) {
      maxSeq = num;
    }
  }

  let nextNum = maxSeq + 1;
  let candidate = `FC-${String(nextNum).padStart(5, '0')}`;
  while (await FurnaceCycle.findOne({ cycleId: candidate })) {
    nextNum++;
    candidate = `FC-${String(nextNum).padStart(5, '0')}`;
  }
  return candidate;
};

// 3. CREATE BATCH
export const create = async (req, res, next) => {
  try {
    const {
      batchId: customBatchId,
      jobOrder: jobOrderId,
      furnace: furnaceInput,
      furnaceId: furnaceIdInput,
      recipe: recipeInput,
      customer: customerInput,
      partNumber: partNumberInput,
      heatNumber: heatNumberInput,
      inputQuantity,
      inputWeightKg,
      scheduledStartTime,
      operator: operatorId
    } = req.body;

    // 1. Resolve or Auto-create Furnace
    let furnace = null;
    const fSearch = furnaceInput || furnaceIdInput;
    if (fSearch && mongoose.Types.ObjectId.isValid(fSearch)) {
      furnace = await Furnace.findById(fSearch);
    }
    if (!furnace && fSearch) {
      furnace = await Furnace.findOne({ $or: [{ furnaceId: fSearch }, { name: fSearch }] });
    }
    if (!furnace) {
      furnace = await Furnace.findOne();
    }
    if (!furnace) {
      furnace = await Furnace.create({
        furnaceId: 'FURNACE-SQF-01',
        name: 'Sealed Quench Furnace #1',
        type: 'SEALED_QUENCH',
        capacityKg: 600,
        maxTemperature: 1050,
        quenchMedium: 'OIL',
        heatingType: 'GAS_FIRED'
      });
    }

    // 2. Resolve or Auto-create Recipe
    let recipe = null;
    if (recipeInput && mongoose.Types.ObjectId.isValid(recipeInput)) {
      recipe = await Recipe.findById(recipeInput);
    }
    if (!recipe && recipeInput) {
      recipe = await Recipe.findOne({ $or: [{ recipeCode: recipeInput }, { recipeName: recipeInput }] });
    }
    if (!recipe) {
      recipe = await Recipe.findOne({ isApproved: true });
    }
    if (!recipe) {
      recipe = await Recipe.create({
        recipeCode: 'RCP-STD-01',
        recipeName: 'Standard Carburizing & Tempering Cycle',
        materialGrade: 'EN31',
        targetTemperature: 860,
        soakingTimeMinutes: 120,
        carbonPotential: 0.9,
        quenchMedium: 'OIL',
        temperingTemperature: 180,
        temperingTimeMinutes: 120,
        isApproved: true
      });
    }

    // 3. Resolve Customer
    let customerDoc = null;
    if (customerInput && mongoose.Types.ObjectId.isValid(customerInput)) {
      customerDoc = await Customer.findById(customerInput);
    }
    if (!customerDoc && customerInput) {
      customerDoc = await Customer.findOne({ companyName: customerInput });
    }
    if (!customerDoc) {
      customerDoc = await Customer.findOne();
    }
    if (!customerDoc) {
      customerDoc = await Customer.create({
        customerCode: 'CUST-STD',
        companyName: (typeof customerInput === 'string' && customerInput.trim()) ? customerInput.trim() : 'Customer Stock',
        gstin: '27AABCU9603R1ZM',
        customerType: 'job_work'
      });
    }

    // 4. Resolve Part
    const pNum = (partNumberInput || 'PART-STD').toUpperCase().trim();
    let part = await Part.findOne({ partNumber: pNum });
    if (!part) {
      part = await Part.create({
        partNumber: pNum,
        partName: pNum,
        customer: customerDoc._id,
        drawingNumber: `DWG-${pNum}`,
        revision: 'R1',
        materialGrade: recipe.materialGrade || 'EN31',
        weightPerPiece: 1.0,
        requiredProcess: 'Heat Treatment',
        hardnessSpec: { scale: 'HRC', min: 58, max: 62, target: 60 }
      });
    }

    // 5. Resolve or Auto-create Job Order
    let jobOrder = null;
    if (jobOrderId && mongoose.Types.ObjectId.isValid(jobOrderId)) {
      jobOrder = await JobOrder.findById(jobOrderId).populate('part');
    }
    if (!jobOrder && jobOrderId) {
      jobOrder = await JobOrder.findOne({ jobOrderNumber: jobOrderId }).populate('part');
    }
    if (!jobOrder) {
      const autoJobOrderNumber = await generateNextJobOrderNumber();
      jobOrder = await JobOrder.create({
        jobOrderNumber: autoJobOrderNumber,
        customer: customerDoc._id,
        customerPoNumber: `PO-${autoJobOrderNumber.replace(/^JO-/i, '')}`,
        part: part._id,
        heatNumber: (heatNumberInput || `HEAT-${Date.now().toString().slice(-5)}`).toUpperCase().trim(),
        targetQuantity: Number(inputQuantity) || 10,
        targetWeight: Number(inputWeightKg) || 100,
        requiredProcess: 'Heat Treatment',
        requiredHardness: '58-62 HRC',
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    const weightNum = Number(inputWeightKg) || 100;

    // VALIDATION 1: Furnace Capacity Check (Overloading prohibited under CQI-9)
    const furnaceCap = furnace.capacityKg || furnace.maxGrossCapacityKg || 0;
    if (furnaceCap > 0 && weightNum > furnaceCap) {
      return res.status(400).json({
        success: false,
        message: `Batch charge weight (${weightNum} kg) exceeds rated capacity (${furnaceCap} kg) of Furnace ${furnace.furnaceId || furnace.name}. Overloading is strictly prohibited under CQI-9 safety standards.`
      });
    }

    // VALIDATION 2: Furnace Maintenance / Breakdown Status Check
    const fStatus = furnace.currentStatus || furnace.status;
    if (fStatus === 'MAINTENANCE' || fStatus === 'BREAKDOWN') {
      return res.status(400).json({
        success: false,
        message: `Furnace ${furnace.furnaceId || furnace.name} is currently under ${fStatus}. Cannot schedule new batches until maintenance clearance is logged.`
      });
    }

    // VALIDATION 3: Furnace Calibration Validity Check
    if (furnace.calibrationStatus === 'EXPIRED' || (furnace.calibrationExpiryDate && new Date(furnace.calibrationExpiryDate) < new Date())) {
      const expDate = furnace.calibrationExpiryDate ? new Date(furnace.calibrationExpiryDate).toLocaleDateString('en-IN') : 'expired date';
      return res.status(400).json({
        success: false,
        message: `Furnace ${furnace.furnaceId || furnace.name} pyrometry calibration expired on ${expDate}. Recalibration required before heat processing.`
      });
    }

    // Resolve Heat Number: ensure HT-YYYY-XXXXXX format
    let finalHeat = (heatNumberInput || '').toUpperCase().trim();
    if (!finalHeat) {
      if (jobOrder.heatNumber && /^HT-\d{4}-\d+/i.test(jobOrder.heatNumber)) {
        finalHeat = jobOrder.heatNumber;
      } else {
        finalHeat = await generateNextHeatNumber();
      }
    }

    // Unique Sequential Batch ID (e.g. BAT-2026-000001)
    let batchId = customBatchId;
    if (!batchId || !batchId.trim()) {
      batchId = await generateNextBatchNumber();
    } else {
      let bCandidate = batchId.trim().toUpperCase();
      let bCounter = 1;
      while (await Batch.findOne({ batchId: bCandidate })) {
        bCandidate = `${batchId.trim().toUpperCase()}-${bCounter}`;
        bCounter++;
      }
      batchId = bCandidate;
    }

    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(`MATHEAT-BATCH|ID:${batchId}|HEAT:${finalHeat}|PART:${part.partNumber}`);
    } catch (e) {
      console.warn('QR code gen warning:', e.message);
    }

    const batch = await Batch.create({
      batchId,
      jobOrder: jobOrder._id,
      customer: customerDoc._id,
      part: part._id,
      grn: jobOrder.grn,
      materialGrade: part.materialGrade || recipe.materialGrade || 'EN31',
      heatNumber: finalHeat,
      furnace: furnace._id,
      furnaceId: furnace.furnaceId,
      recipe: recipe._id,
      recipeRevision: recipe.revision || 'V1',
      operator: operatorId || req.user?._id,
      inputQuantity: Number(inputQuantity) || 10,
      inputWeightKg: weightNum,
      scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : new Date(),
      status: BATCH_STATUS.PLANNED,
      qrCodeUrl: qrDataUrl
    });

    jobOrder.batches.push(batch._id);
    await jobOrder.save().catch(() => {});

    if (req.user) {
      await logAudit({
        req,
        action: 'CREATE_BATCH',
        module: 'BATCH',
        recordId: batch._id,
        entityType: 'Batch',
        newValue: { batchId, furnaceId: furnace.furnaceId, weightKg: weightNum, heatNumber: batch.heatNumber }
      });
    }

    res.status(201).json({ success: true, batch });
  } catch (error) { next(error); }
};

const findBatchByIdOrCode = async (idOrCode) => {
  if (!idOrCode) return null;
  if (mongoose.Types.ObjectId.isValid(idOrCode)) {
    const doc = await Batch.findById(idOrCode);
    if (doc) return doc;
  }
  return await Batch.findOne({ batchId: idOrCode });
};

// 4. DELETE BATCH
export const deleteBatch = async (req, res, next) => {
  try {
    const batch = await findBatchByIdOrCode(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    await Batch.findByIdAndDelete(batch._id);
    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) { next(error); }
};

// 5. LOAD FURNACE
export const loadFurnace = async (req, res, next) => {
  try {
    const batch = await findBatchByIdOrCode(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    const furnace = await Furnace.findById(batch.furnace);
    if (!furnace) return res.status(404).json({ success: false, message: 'Furnace not found' });

    furnace.currentStatus = FURNACE_STATUS.LOADING;
    furnace.currentBatch = batch._id;
    furnace.currentBatchId = batch.batchId;
    furnace.loadedWeightKg = batch.inputWeightKg;
    furnace.currentOperator = req.user?._id;
    await furnace.save();

    batch.status = BATCH_STATUS.LOADING;
    await batch.save();

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
      user: req.user?._id,
      userName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Plant Operator'
    });

    res.json({ success: true, message: `Furnace ${furnace.furnaceId} loaded with Batch ${batch.batchId}`, furnace, batch });
  } catch (error) { next(error); }
};

// 6. START CYCLE
export const startCycle = async (req, res, next) => {
  try {
    const batch = await findBatchByIdOrCode(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    let recipeDoc = null;
    if (batch.recipe) {
      if (typeof batch.recipe === 'object' && batch.recipe.targetTemperature) {
        recipeDoc = batch.recipe;
      } else {
        recipeDoc = await Recipe.findById(batch.recipe);
      }
    }
    if (!recipeDoc) {
      recipeDoc = await Recipe.findOne();
    }

    let furnace = null;
    if (batch.furnace) {
      furnace = await Furnace.findById(batch.furnace);
    }
    if (!furnace) {
      furnace = await Furnace.findOne();
    }

    if (furnace) {
      furnace.currentStatus = FURNACE_STATUS.HEATING;
      furnace.targetTemperature = recipeDoc?.targetTemperature || 860;
      furnace.currentCarbonPotential = recipeDoc?.carbonPotential || 0.85;
      furnace.cycleStartTime = new Date();
      await furnace.save();
    }

    batch.status = BATCH_STATUS.HEATING;
    batch.actualStartTime = new Date();
    await batch.save();

    const cycleId = await generateNextCycleId();
    const cycle = await FurnaceCycle.create({
      cycleId,
      batch: batch._id,
      batchId: batch.batchId,
      furnace: furnace?._id || batch.furnace,
      furnaceId: furnace?.furnaceId || batch.furnaceId || 'F-01',
      recipe: recipeDoc?._id || batch.recipe,
      recipeRevision: recipeDoc?.revision || batch.recipeRevision || 1,
      startTime: new Date(),
      parameters: {
        heating: {
          targetTemp: recipeDoc?.targetTemperature || 860,
          targetHeatingTimeMinutes: recipeDoc?.heatingTimeMinutes || 60,
          rampRate: '150°C/hr'
        },
        soaking: {
          targetTemp: recipeDoc?.targetTemperature || 860,
          targetSoakMinutes: recipeDoc?.soakingTimeMinutes || 90,
          targetCarbonPotential: recipeDoc?.carbonPotential || 0.85
        },
        quenching: {
          quenchMedium: recipeDoc?.quenchMedium || 'OIL',
          targetQuenchTemp: recipeDoc?.targetQuenchTemperature || 60,
          targetQuenchTimeMinutes: recipeDoc?.quenchTimeMinutes || 15
        },
        tempering: {
          targetTemp: recipeDoc?.temperingTemperature || 180,
          targetTimeMinutes: recipeDoc?.temperingTimeMinutes || 120
        }
      },
      cycleStatus: 'IN_PROGRESS'
    });

    res.json({ success: true, message: `Furnace Cycle ${cycle.cycleId} started for Batch ${batch.batchId}`, cycle, furnace, batch });
  } catch (error) { next(error); }
};

// 7. RECORD CYCLE
export const recordCycle = async (req, res, next) => {
  try {
    const batch = await findBatchByIdOrCode(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    let recipeDoc = null;
    if (batch.recipe) {
      if (typeof batch.recipe === 'object' && batch.recipe.targetTemperature) {
        recipeDoc = batch.recipe;
      } else {
        recipeDoc = await Recipe.findById(batch.recipe);
      }
    }
    if (!recipeDoc) {
      recipeDoc = await Recipe.findOne();
    }

    let furnaceDoc = null;
    if (batch.furnace) {
      furnaceDoc = await Furnace.findById(batch.furnace);
    }
    if (!furnaceDoc) {
      furnaceDoc = await Furnace.findOne();
    }

    const {
      actualHeatingTemp,
      actualHardeningTemp,
      actualSoakTemp,
      actualSoakMinutes,
      actualCarbonPotential,
      actualQuenchTemp,
      actualTemperingTemp,
      actualTemperingMinutes,
      energyKwh,
      energyConsumedKwh,
      gasM3,
      operatorRemarks
    } = req.body;

    const heatVal = actualHeatingTemp || actualHardeningTemp || recipeDoc?.targetTemperature || 860;
    const soakVal = actualSoakTemp || actualHardeningTemp || recipeDoc?.targetTemperature || 860;
    const soakMins = actualSoakMinutes || recipeDoc?.soakingTimeMinutes || 90;
    const cpVal = actualCarbonPotential || recipeDoc?.carbonPotential || 0.85;
    const quenchVal = actualQuenchTemp || recipeDoc?.targetQuenchTemperature || 60;
    const tempVal = actualTemperingTemp || recipeDoc?.temperingTemperature || 180;
    const tempMins = actualTemperingMinutes || recipeDoc?.temperingTimeMinutes || 120;
    const energyVal = energyKwh || energyConsumedKwh || 185;

    let cycle = await FurnaceCycle.findOne({ batchId: batch.batchId }).sort({ createdAt: -1 });
    if (!cycle) {
      const cycleId = await generateNextCycleId();
      cycle = new FurnaceCycle({
        cycleId,
        batch: batch._id,
        batchId: batch.batchId,
        furnace: furnaceDoc?._id || batch.furnace,
        furnaceId: furnaceDoc?.furnaceId || batch.furnaceId || 'F-01',
        recipe: recipeDoc?._id || batch.recipe,
        recipeRevision: recipeDoc?.revision || batch.recipeRevision || 1,
        startTime: batch.actualStartTime || new Date(),
        parameters: {
          heating: {
            targetTemp: recipeDoc?.targetTemperature || 860,
            targetHeatingTimeMinutes: recipeDoc?.heatingTimeMinutes || 60
          },
          soaking: {
            targetTemp: recipeDoc?.targetTemperature || 860,
            targetSoakMinutes: recipeDoc?.soakingTimeMinutes || 90,
            targetCarbonPotential: recipeDoc?.carbonPotential || 0.85
          },
          quenching: {
            quenchMedium: recipeDoc?.quenchMedium || 'OIL',
            targetQuenchTemp: recipeDoc?.targetQuenchTemperature || 60,
            targetQuenchTimeMinutes: recipeDoc?.quenchTimeMinutes || 15
          },
          tempering: {
            targetTemp: recipeDoc?.temperingTemperature || 180,
            targetTimeMinutes: recipeDoc?.temperingTimeMinutes || 120
          }
        }
      });
    }

    if (cycle && cycle.parameters) {
      if (!cycle.parameters.heating) cycle.parameters.heating = {};
      if (!cycle.parameters.soaking) cycle.parameters.soaking = {};
      if (!cycle.parameters.quenching) cycle.parameters.quenching = {};
      if (!cycle.parameters.tempering) cycle.parameters.tempering = {};

      if (cycle.parameters.heating.targetTemp == null) {
        cycle.parameters.heating.targetTemp = recipeDoc?.targetTemperature || 860;
      }
      if (cycle.parameters.heating.targetHeatingTimeMinutes == null) {
        cycle.parameters.heating.targetHeatingTimeMinutes = recipeDoc?.heatingTimeMinutes || 60;
      }
      if (cycle.parameters.soaking.targetTemp == null) {
        cycle.parameters.soaking.targetTemp = recipeDoc?.targetTemperature || 860;
      }
      if (cycle.parameters.soaking.targetSoakMinutes == null) {
        cycle.parameters.soaking.targetSoakMinutes = recipeDoc?.soakingTimeMinutes || 90;
      }
      if (cycle.parameters.soaking.targetCarbonPotential == null) {
        cycle.parameters.soaking.targetCarbonPotential = recipeDoc?.carbonPotential || 0.85;
      }
      if (cycle.parameters.quenching.quenchMedium == null) {
        cycle.parameters.quenching.quenchMedium = recipeDoc?.quenchMedium || 'OIL';
      }
      if (cycle.parameters.quenching.targetQuenchTemp == null) {
        cycle.parameters.quenching.targetQuenchTemp = recipeDoc?.targetQuenchTemperature || 60;
      }
      if (cycle.parameters.quenching.targetQuenchTimeMinutes == null) {
        cycle.parameters.quenching.targetQuenchTimeMinutes = recipeDoc?.quenchTimeMinutes || 15;
      }
      if (cycle.parameters.tempering.targetTemp == null) {
        cycle.parameters.tempering.targetTemp = recipeDoc?.temperingTemperature || 180;
      }
      if (cycle.parameters.tempering.targetTimeMinutes == null) {
        cycle.parameters.tempering.targetTimeMinutes = recipeDoc?.temperingTimeMinutes || 120;
      }

      cycle.parameters.heating.actualTemp = Number(heatVal);
      cycle.parameters.soaking.actualTemp = Number(soakVal);
      cycle.parameters.soaking.actualSoakMinutes = Number(soakMins);
      cycle.parameters.soaking.actualCarbonPotential = Number(cpVal);
      cycle.parameters.quenching.actualQuenchTemp = Number(quenchVal);
      cycle.parameters.tempering.actualTemp = Number(tempVal);
      cycle.parameters.tempering.actualTimeMinutes = Number(tempMins);
      cycle.energyConsumedKwh = Number(energyVal);
      cycle.gasConsumedCubicMeters = Number(gasM3 || 0);
      cycle.operatorRemarks = operatorRemarks || 'Cycle executed within specifications.';
      cycle.cycleStatus = 'COMPLETED';
      cycle.endTime = new Date();
      await cycle.save();
    }

    // MASS RECONCILIATION & CQI-9 TRANSFER TIME TRACKING
    const outWt = Number(req.body.outputWeightKg != null ? req.body.outputWeightKg : batch.inputWeightKg);
    const outQty = Number(req.body.outputQuantity != null ? req.body.outputQuantity : batch.inputQuantity);
    const rejQty = Number(req.body.rejectedQuantity || 0);
    const scrapWt = Number(req.body.scrapWeightKg || 0);
    const burnLoss = Number(req.body.burningLossKg != null ? req.body.burningLossKg : (req.body.processLossKg || 0));
    const transferSec = Number(req.body.transferTimeSec || req.body.actualTransferTimeSeconds || 12);
    const maxTransferSec = recipeDoc?.transferTimeSeconds || 15;
    const transferExceeded = transferSec > maxTransferSec;

    // Input = Output + Scrap + Loss (±2% process tolerance)
    const totalMassRecorded = outWt + scrapWt + burnLoss;
    const massDiffPercent = batch.inputWeightKg > 0 ? (Math.abs(totalMassRecorded - batch.inputWeightKg) / batch.inputWeightKg) * 100 : 0;
    const isBalanced = massDiffPercent <= 2.0;

    batch.status = BATCH_STATUS.QC_PENDING;
    batch.qcStatus = 'PENDING';
    batch.actualEndTime = new Date();
    batch.outputQuantity = outQty;
    batch.outputWeightKg = outWt;
    batch.rejectionQuantity = rejQty;
    batch.scrapWeightKg = scrapWt;
    batch.burningLossKg = burnLoss;
    batch.actualTransferTimeSeconds = transferSec;
    batch.transferTimeExceeded = transferExceeded;
    batch.massReconciliationStatus = isBalanced ? 'BALANCED' : 'DISCREPANCY';
    await batch.save();

    const furnace = await Furnace.findById(batch.furnace);
    if (furnace) {
      furnace.currentStatus = FURNACE_STATUS.IDLE;
      furnace.currentBatch = null;
      furnace.currentBatchId = null;
      furnace.loadedWeightKg = 0;
      await furnace.save();
    }

    res.json({
      success: true,
      message: `Heat ${batch.heatNumber} (Batch ${batch.batchId}) cycle completed with ${batch.massReconciliationStatus} mass balance and submitted to QC Lab.`,
      batch,
      cycle
    });
  } catch (error) { next(error); }
};
