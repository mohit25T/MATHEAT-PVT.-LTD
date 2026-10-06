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

  // If still none, search Job Cards
  if (batches.length === 0) {
    const { JobCard } = await import('../models/JobCard.js');
    const jobCards = await JobCard.find({
      $or: [
        { jobCardNumber: regex },
        { jobOrderNumber: regex },
        { heatNumber: regex },
        { partNumber: regex }
      ]
    });
    if (jobCards.length > 0) {
      const jcHeatNos = jobCards.map(jc => jc.heatNumber).filter(Boolean);
      const jcJoIds = jobCards.map(jc => jc.jobOrder).filter(Boolean);
      batches = await Batch.find({
        $or: [
          { heatNumber: { $in: jcHeatNos } },
          { jobOrder: { $in: jcJoIds } }
        ]
      })
        .populate('jobOrder')
        .populate('customer')
        .populate('part')
        .populate('recipe')
        .populate('furnace')
        .populate('operator', 'firstName lastName badgeNumber');
    }
  }

  // If still none, search NCRs
  if (batches.length === 0) {
    const ncrs = await NCR.find({
      $or: [
        { ncrNumber: regex },
        { batchId: regex },
        { heatNumber: regex }
      ]
    });
    if (ncrs.length > 0) {
      const ncrBatchIds = ncrs.map(n => n.batchId).filter(Boolean);
      const ncrHeats = ncrs.map(n => n.heatNumber).filter(Boolean);
      batches = await Batch.find({
        $or: [
          { batchId: { $in: ncrBatchIds } },
          { heatNumber: { $in: ncrHeats } }
        ]
      })
        .populate('jobOrder')
        .populate('customer')
        .populate('part')
        .populate('recipe')
        .populate('furnace')
        .populate('operator', 'firstName lastName badgeNumber');
    }
  }

  // If still none, search Rework records
  if (batches.length === 0) {
    const { Rework } = await import('../models/Rework.js');
    const reworks = await Rework.find({
      $or: [
        { reworkNumber: regex },
        { originalBatchId: regex },
        { originalHeatNumber: regex },
        { reworkHeatNumber: regex }
      ]
    });
    if (reworks.length > 0) {
      const rwBatchIds = reworks.map(r => r.originalBatchId).filter(Boolean);
      const rwHeats = reworks.flatMap(r => [r.originalHeatNumber, r.reworkHeatNumber]).filter(Boolean);
      batches = await Batch.find({
        $or: [
          { batchId: { $in: rwBatchIds } },
          { heatNumber: { $in: rwHeats } }
        ]
      })
        .populate('jobOrder')
        .populate('customer')
        .populate('part')
        .populate('recipe')
        .populate('furnace')
        .populate('operator', 'firstName lastName badgeNumber');
    }
  }

  // If still none, search Dispatches & Invoices
  if (batches.length === 0) {
    const dispatches = await Dispatch.find({
      $or: [
        { dispatchNumber: regex },
        { deliveryChallanNumber: regex },
        { batchId: regex },
        { heatNumber: regex }
      ]
    });
    if (dispatches.length > 0) {
      const dspBatches = dispatches.map(d => d.batchId).filter(Boolean);
      const dspHeats = dispatches.map(d => d.heatNumber).filter(Boolean);
      batches = await Batch.find({
        $or: [
          { batchId: { $in: dspBatches } },
          { heatNumber: { $in: dspHeats } }
        ]
      })
        .populate('jobOrder')
        .populate('customer')
        .populate('part')
        .populate('recipe')
        .populate('furnace')
        .populate('operator', 'firstName lastName badgeNumber');
    }
  }

  // If still none, search Customer or Part
  if (batches.length === 0) {
    const customers = await Customer.find({
      $or: [
        { companyName: regex },
        { customerCode: regex }
      ]
    });
    const parts = await Part.find({
      $or: [
        { partNumber: regex },
        { partName: regex },
        { drawingNumber: regex }
      ]
    });

    const custIds = customers.map(c => c._id);
    const partIds = parts.map(p => p._id);

    if (custIds.length > 0 || partIds.length > 0) {
      batches = await Batch.find({
        $or: [
          { customer: { $in: custIds } },
          { part: { $in: partIds } }
        ]
      })
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

      // 1b. Job Card
      const { JobCard } = await import('../models/JobCard.js');
      const jobCard = await JobCard.findOne({
        $or: [{ jobOrder: batch.jobOrder?._id }, { heatNumber }, { jobOrderNumber: batch.jobOrder?.jobOrderNumber }]
      });

      // 2. Furnace Cycle
      const cycle = await FurnaceCycle.findOne({ batchId });

      // 3. QC Inspections
      const qcs = await QCInspection.find({ batchId }).populate('inspectedBy approvedBy');

      // 4. NCR & Rework
      const ncrs = await NCR.find({ batchId });
      const { Rework } = await import('../models/Rework.js');
      const reworks = await Rework.find({
        $or: [{ originalBatchId: batchId }, { originalHeatNumber: heatNumber }, { reworkBatchId: batch.reworkBatchId }]
      });

      // 5. Dispatch
      const dispatch = await Dispatch.findOne({
        $or: [{ batchId }, { heatNumber }, { deliveryChallanNumber: batch.dispatchNumber }]
      });

      // 6. Invoice & Payments
      const invoice = await Invoice.findOne({
        $or: [
          { batchId },
          { invoiceNumber: batch.invoiceNumber },
          { 'transport.jobOrderNo': batch.jobOrder?.jobOrderNumber }
        ]
      });

      const { Payment } = await import('../models/Payment.js');
      let payments = [];
      if (invoice) {
        payments = await Payment.find({ invoice: invoice._id }).sort({ paymentDate: -1 });
      }

      return {
        batchId: batch.batchId,
        status: batch.status,
        heatNumber: batch.heatNumber,
        productionDate: batch.productionDate,
        customer: batch.customer,
        part: batch.part,
        grn: grn || null,
        jobCard: jobCard || null,
        jobOrder: batch.jobOrder,
        recipe: batch.recipe,
        recipeRevision: batch.recipeRevision,
        furnace: batch.furnace,
        operator: batch.operator,
        furnaceCycle: cycle || null,
        qcInspections: qcs,
        ncrs: ncrs,
        reworks: reworks,
        isRework: batch.isRework,
        parentBatchId: batch.parentBatchId,
        reworkBatchId: batch.reworkBatchId,
        certificate: {
          certificateNumber: batch.certificateNumber || `HTC-${batch.batchId}`,
          isAvailable: batch.qcStatus === 'PASS' || batch.status === 'COMPLETED' || batch.status === 'READY_FOR_DISPATCH'
        },
        dispatch: dispatch || null,
        invoice: invoice || null,
        payments: payments
      };
    })
  );

  return {
    query: searchTerm,
    totalBatchesFound: traceabilityCards.length,
    results: traceabilityCards
  };
};
