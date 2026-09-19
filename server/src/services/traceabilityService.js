import { Batch } from '../models/Batch.js';
import { GRN } from '../models/GRN.js';
import { JobOrder } from '../models/JobOrder.js';
import { Part } from '../models/Part.js';
import { QCInspection } from '../models/QCInspection.js';
import { FurnaceCycle } from '../models/FurnaceCycle.js';
import { NCR } from '../models/NCR.js';
import { Dispatch, Invoice } from '../models/Invoice.js';
import { Customer } from '../models/Customer.js';

export const buildTraceabilityTree = async (query) => {
  const searchTerm = String(query).trim();
  if (!searchTerm) return null;

  const regex = new RegExp(searchTerm, 'i');

  // Find relevant Batches matching Batch ID, Heat No, Customer PO, etc.
  let batches = await Batch.find({
    $or: [
      { batchId: regex },
      { heatNumber: regex },
      { certificateNumber: regex },
      { invoiceNumber: regex },
      { dispatchNumber: regex }
    ]
  })
    .populate('jobOrder')
    .populate('customer')
    .populate('part')
    .populate('recipe')
    .populate('furnace')
    .populate('operator', 'firstName lastName badgeNumber');

  // If no direct batch match, search via GRN (Heat Number or Inward)
  let grns = [];
  if (batches.length === 0) {
    grns = await GRN.find({
      $or: [
        { heatNumber: regex },
        { grnNumber: regex },
        { challanNumber: regex },
        { partNumber: regex }
      ]
    }).populate('customer').populate('part');

    if (grns.length > 0) {
      const heatNumbers = grns.map(g => g.heatNumber);
      batches = await Batch.find({ heatNumber: { $in: heatNumbers } })
        .populate('jobOrder')
        .populate('customer')
        .populate('part')
        .populate('recipe')
        .populate('furnace')
        .populate('operator', 'firstName lastName badgeNumber');
    }
  }

  // If still none, search Job Orders
  if (batches.length === 0) {
    const jobOrders = await JobOrder.find({
      $or: [
        { jobOrderNumber: regex },
        { customerPoNumber: regex },
        { heatNumber: regex }
      ]
    });
    if (jobOrders.length > 0) {
      const joIds = jobOrders.map(j => j._id);
      batches = await Batch.find({ jobOrder: { $in: joIds } })
        .populate('jobOrder')
        .populate('customer')
        .populate('part')
        .populate('recipe')
        .populate('furnace')
        .populate('operator', 'firstName lastName badgeNumber');
    }
  }

  // Assemble full traceability data per batch
  const traceabilityCards = await Promise.all(
    batches.map(async (batch) => {
      const batchId = batch.batchId;
      const heatNumber = batch.heatNumber;

      // 1. Material Inward (GRN)
      const grn = await GRN.findOne({ heatNumber }).populate('customer').populate('part');

      // 2. Furnace Cycle
      const cycle = await FurnaceCycle.findOne({ batchId });

      // 3. QC Inspections
      const qcs = await QCInspection.find({ batchId }).populate('inspectedBy approvedBy');

      // 4. NCR & Rework
      const ncrs = await NCR.find({ batchId });

      // 5. Dispatch
      const dispatch = await Dispatch.findOne({ batchId });

      // 6. Invoice
      const invoice = await Invoice.findOne({ batchId });

      return {
        batchId: batch.batchId,
        status: batch.status,
        heatNumber: batch.heatNumber,
        productionDate: batch.productionDate,
        customer: batch.customer,
        part: batch.part,
        grn: grn || null,
        jobOrder: batch.jobOrder,
        recipe: batch.recipe,
        recipeRevision: batch.recipeRevision,
        furnace: batch.furnace,
        operator: batch.operator,
        furnaceCycle: cycle || null,
        qcInspections: qcs,
        ncrs: ncrs,
        isRework: batch.isRework,
        parentBatchId: batch.parentBatchId,
        reworkBatchId: batch.reworkBatchId,
        certificate: {
          certificateNumber: batch.certificateNumber || `HTC-${batch.batchId}`,
          isAvailable: batch.qcStatus === 'PASS' || batch.status === 'COMPLETED' || batch.status === 'READY_FOR_DISPATCH'
        },
        dispatch: dispatch || null,
        invoice: invoice || null
      };
    })
  );

  return {
    query: searchTerm,
    totalBatchesFound: traceabilityCards.length,
    results: traceabilityCards
  };
};
