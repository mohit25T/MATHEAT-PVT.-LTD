import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

import mongoose from 'mongoose';
import { connectDB, closeDB } from '../src/config/db.js';
import { seedDatabase } from '../src/seed.js';
import { app } from '../src/server.js';
import { Customer } from '../src/models/Customer.js';
import { Part } from '../src/models/Part.js';
import { Recipe } from '../src/models/Recipe.js';
import { Furnace } from '../src/models/Furnace.js';
import { QCInstrument } from '../src/models/QCInstrument.js';
import { Batch } from '../src/models/Batch.js';
import { User } from '../src/models/User.js';
import { ROLES } from '../src/config/constants.js';

describe('MATHEAT PVT. LTD. — End-to-End Heat-Treatment ERP Lifecycle Test', () => {
  let server;
  let baseUrl;
  let authToken;

  // Track shared entities across 12-step lifecycle
  let customerDoc;
  let partDoc;
  let recipeDoc;
  let furnaceDoc;
  let instrumentDoc;
  let jobOrderId;
  let jobOrderNumber;
  let grnId;
  let grnNumber;
  let jobCardId;
  let jobCardNumber;
  let batchId;
  let heatNumber;
  let inspectionId;
  let certificateNumber;
  let dispatchId;
  let dispatchNumber;
  let invoiceId;
  let invoiceNumber;
  let paymentNumber;

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
    await seedDatabase();

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}/api`;
        resolve();
      });
    });

    // Clean up any test records from prior runs
    await Customer.deleteMany({ customerCode: /^CUS-PGL/ });
    await Part.deleteMany({ partNumber: /^PGL-PINION/ });
    await Recipe.deleteMany({ recipeCode: /^RCP-CARB/ });
    await Furnace.deleteMany({ furnaceId: /^FURNACE-SQF/ });
    await QCInstrument.deleteMany({ instrumentId: /^INST-/ });

    // Ensure admin user exists with password admin@123
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      await User.create({
        username: 'admin',
        email: 'admin@matheat.com',
        password: 'admin@123',
        firstName: 'Admin',
        lastName: 'MATHEAT',
        role: ROLES.ADMIN,
        department: 'Management',
        isActive: true
      });
    } else {
      admin.password = 'admin@123';
      admin.isActive = true;
      await admin.save();
    }

    // Login as admin
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin@123' })
    });
    const loginData = await loginRes.json();
    assert.equal(loginRes.status, 200, 'Admin login must succeed');
    assert.ok(loginData.token, 'JWT token must be returned');
    authToken = loginData.token;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await closeDB();
  });

  const apiCall = async (endpoint, method = 'GET', body = null) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`${baseUrl}${endpoint}`, options);
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawText: text };
    }
    return { status: res.status, data };
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1: CREATE CUSTOMER, PART & QC INSTRUMENTS
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 1: Should register Customer, Part with drawing, and NABL Calibrated QC Instrument', async () => {
    // 1. Customer
    customerDoc = await Customer.create({
      customerCode: 'CUS-PGL',
      companyName: 'Precision Gearworks India Ltd',
      tradeName: 'Precision Gearworks',
      gstin: '24AAACP1234A1Z5',
      stateCode: '24',
      billingAddress: {
        street: 'GIDC Industrial Estate Phase II',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382445'
      },
      customerType: 'job_work',
      agreedRatePerKg: 45
    });
    assert.ok(customerDoc._id);

    // 2. Part
    partDoc = await Part.create({
      partNumber: 'PGL-PINION-01',
      partName: 'Drive Pinion Shaft 20MnCr5',
      customer: customerDoc._id,
      drawingNumber: 'DWG-PGL-2026-08',
      revision: 'REV-B',
      materialGrade: '20MnCr5',
      weightPerPiece: 2.5,
      unitRatePerKg: 45,
      requiredProcess: 'GAS_CARBURIZING',
      hardnessSpec: { scale: 'HRC', min: 58, max: 62, target: 60 },
      caseDepthSpec: { required: true, effectiveMin: 0.8, effectiveMax: 1.2, cutoffHardness: '50 HRC' },
      metallographySpec: { retainedAusteniteMax: 15, grainSizeMin: 5, grainSizeMax: 8 }
    });
    assert.ok(partDoc._id);

    // 3. Calibrated QC Instrument
    instrumentDoc = await QCInstrument.create({
      instrumentId: 'INST-HRC-01',
      name: 'Rockwell Hardness Tester (HT-RC-01)',
      instrumentName: 'Rockwell Hardness Tester (HT-RC-01)',
      type: 'HARDNESS_TESTER',
      serialNumber: 'RHT-2024-991',
      calibrationCertificateNumber: 'NABL-CAL-2026-0182',
      calibrationAgency: 'National NABL Metrology Lab',
      calibrationDate: new Date(),
      calibrationDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // Valid for 180 days
      nextCalibrationDue: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      calibrationStatus: 'VALID',
      status: 'ACTIVE'
    });
    assert.ok(instrumentDoc._id);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2: CREATE PROCESS RECIPE & FURNACE MASTER
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 2: Should register approved Process Recipe and Furnace unit', async () => {
    // 1. Recipe
    recipeDoc = await Recipe.create({
      recipeCode: 'RCP-CARB-20MNCR5',
      recipeName: 'Gas Carburizing & Oil Quenching for 20MnCr5',
      materialGrade: '20MNCR5',
      targetTemperature: 920,
      heatingTimeMinutes: 60,
      soakingTimeMinutes: 180,
      carbonPotential: 0.85,
      quenchMedium: 'OIL',
      targetQuenchTemperature: 60,
      quenchTimeMinutes: 15,
      transferTimeSeconds: 15,
      temperingTemperature: 180,
      temperingTimeMinutes: 120,
      revision: 'V1',
      isApproved: true
    });
    assert.ok(recipeDoc._id);

    // 2. Furnace
    furnaceDoc = await Furnace.create({
      furnaceId: 'FURNACE-SQF-01',
      name: 'Sealed Quench Furnace #1',
      type: 'SEALED_QUENCH_FURNACE',
      capacityKg: 800,
      maxTemperature: 1050,
      quenchMedium: 'OIL',
      heatingType: 'GAS_FIRED',
      currentStatus: 'IDLE',
      calibrationStatus: 'VALID',
      calibrationExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    });
    assert.ok(furnaceDoc._id);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 3: SALES JOB ORDER CREATION (JO-YYYY-XXXXXX)
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 3: Should create confirmed Job Order with sequential numbering JO-YYYY-XXXXXX', async () => {
    const res = await apiCall('/job-orders', 'POST', {
      customer: customerDoc._id,
      customerPoNumber: 'PO-PGL-2026-0044',
      poDate: new Date(),
      part: partDoc._id,
      partNumber: partDoc.partNumber,
      partName: partDoc.partName,
      targetQuantity: 200,
      targetWeight: 500, // 200 pcs * 2.5 kg = 500 kg
      requiredProcess: 'GAS_CARBURIZING',
      requiredHardness: '58-62 HRC',
      requiredCaseDepth: '0.8 - 1.2 mm',
      deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });

    assert.equal(res.status, 201);
    assert.ok(res.data.jobOrder);
    jobOrderId = res.data.jobOrder._id;
    jobOrderNumber = res.data.jobOrder.jobOrderNumber;

    assert.match(jobOrderNumber, /^JO-\d{4}-\d{6}$/, 'Job Order number must follow JO-YYYY-XXXXXX sequence');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 4: MATERIAL RECEIPT NOTE / MRN (GRN-YYYY-XXXXXX)
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 4: Should record MRN / GRN with material condition and link to Job Order', async () => {
    const res = await apiCall('/grn', 'POST', {
      ownership: 'CUSTOMER',
      customer: customerDoc._id,
      customerName: customerDoc.companyName,
      challanNumber: 'DC-CUS-2026-901',
      poNumber: 'PO-PGL-2026-0044',
      partNumber: partDoc.partNumber,
      partName: partDoc.partName,
      materialGrade: '20MnCr5',
      receivedQuantity: 200,
      receivedWeightKg: 500,
      materialCondition: 'GOOD',
      inspectionStatus: 'ACCEPTED'
    });

    assert.equal(res.status, 201);
    assert.ok(res.data.grn);
    grnId = res.data.grn._id;
    grnNumber = res.data.grn.grnNumber;

    assert.match(grnNumber, /^GRN-\d{4}-\d{6}$/, 'GRN number must follow GRN-YYYY-XXXXXX sequence');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 5: JOB CARD TRAVELER GENERATION (JC-YYYY-XXXXXX)
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 5: Should generate Shop Traveler Job Card with sequential numbering JC-YYYY-XXXXXX', async () => {
    const res = await apiCall('/job-cards', 'POST', {
      jobOrder: jobOrderId,
      grn: grnId,
      recipe: recipeDoc._id,
      quantityPcs: 200,
      weightKg: 500,
      specialInstructions: 'Carburize case depth to 1.0mm nominal. Oil quench under rapid agitation.'
    });

    assert.equal(res.status, 201);
    assert.ok(res.data.jobCard);
    jobCardId = res.data.jobCard._id;
    jobCardNumber = res.data.jobCard.jobCardNumber;

    assert.match(jobCardNumber, /^JC-\d{4}-\d{6}$/, 'Job Card must follow JC-YYYY-XXXXXX sequence');
    assert.ok(res.data.jobCard.qrCodeUrl, 'Job Card must have embedded QR code');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 6: BATCH PLANNING & HEAT NUMBER GENERATION (BAT- & HT-YYYY-XXXXXX)
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 6: Should enforce furnace capacity checks and assign unique Heat Number', async () => {
    // 1. Negative Test: Overloaded furnace (> 800 kg capacity) must be rejected
    const overloadRes = await apiCall('/batches', 'POST', {
      jobOrder: jobOrderId,
      furnace: furnaceDoc._id,
      recipe: recipeDoc._id,
      inputQuantity: 400,
      inputWeightKg: 1000 // Over 800 kg capacity!
    });
    assert.equal(overloadRes.status, 400, 'Furnace overload must return 400 under CQI-9 safety');

    // 2. Positive Test: Schedule within capacity (500 kg <= 800 kg)
    const res = await apiCall('/batches', 'POST', {
      jobOrder: jobOrderId,
      furnace: furnaceDoc._id,
      recipe: recipeDoc._id,
      customer: customerDoc._id,
      partNumber: partDoc.partNumber,
      inputQuantity: 200,
      inputWeightKg: 500
    });

    assert.equal(res.status, 201);
    assert.ok(res.data.batch);
    batchId = res.data.batch.batchId;
    heatNumber = res.data.batch.heatNumber;

    assert.match(batchId, /^BAT-\d{4}-\d{6}$/, 'Batch ID must follow BAT-YYYY-XXXXXX sequence');
    assert.match(heatNumber, /^HT-\d{4}-\d{6}$/, 'Heat Number must follow unbroken HT-YYYY-XXXXXX root key');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 7: FURNACE CYCLE EXECUTION & CQI-9 MASS RECONCILIATION
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 7: Should execute furnace cycle with quench transfer and reconcile mass balance', async () => {
    // 1. Start Cycle
    const startRes = await apiCall(`/batches/${batchId}/start-cycle`, 'POST');
    assert.equal(startRes.status, 200);

    // 2. Complete Batch & Reconcile Mass Balance:
    // Input Weight = 500 kg
    // Output Weight = 495 kg, Scrap = 3 kg, Process Loss = 2 kg
    // Total Mass = 495 + 3 + 2 = 500 kg (0% deviation <= 2% tolerance)
    const completeRes = await apiCall(`/batches/${batchId}/record-cycle`, 'POST', {
      heatVal: 920,
      soakVal: 920,
      soakMins: 180,
      cpVal: 0.85,
      quenchVal: 60,
      tempVal: 180,
      tempMins: 120,
      transferTimeSec: 11, // Less than 15s CQI-9 door-to-quench limit
      outputQuantity: 200,
      outputWeightKg: 495,
      scrapWeightKg: 3,
      burningLossKg: 2,
      energyVal: 145,
      operatorRemarks: 'Clean cycle, oil quench transfer executed in 11 seconds.'
    });

    assert.equal(completeRes.status, 200);
    const updatedBatch = await Batch.findOne({ batchId });
    assert.equal(updatedBatch.status, 'QC_PENDING');
    assert.equal(updatedBatch.qcStatus, 'PENDING');
    assert.equal(updatedBatch.transferTimeExceeded, false);
    assert.equal(updatedBatch.actualTransferTimeSeconds, 11);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 8: QC INSPECTION WITH CALIBRATION GUARD (QC-YYYY-XXXXXX)
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 8: Should block uncalibrated instruments and record PASS QC inspection', async () => {
    // 1. Negative Test: Test with expired instrument must be blocked
    const expiredInst = await QCInstrument.create({
      instrumentId: 'INST-EXPIRED-99',
      instrumentName: 'Old Hardness Tester',
      name: 'Old Hardness Tester',
      type: 'HARDNESS_TESTER',
      serialNumber: 'EXP-1999',
      calibrationCertificateNumber: 'NABL-EXP-999',
      calibrationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      calibrationDueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Expired 30 days ago
      nextCalibrationDue: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      calibrationStatus: 'EXPIRED',
      status: 'CALIBRATION_OVERDUE'
    });

    const expRes = await apiCall('/qc', 'POST', {
      batchId,
      instrumentId: expiredInst._id,
      hardness: {
        scale: 'HRC',
        machineUsed: expiredInst.instrumentId,
        sampleReadings: [60.0, 60.5, 60.2]
      }
    });
    assert.equal(expRes.status, 400, 'QC using expired calibration instrument must be rejected');

    // 2. Positive Test: Test with valid calibrated instrument
    const qcRes = await apiCall('/qc', 'POST', {
      batchId,
      instrumentId: instrumentDoc._id,
      hardness: {
        scale: 'HRC',
        machineUsed: instrumentDoc.name,
        sampleReadings: [60.0, 60.5, 60.2] // Avg 60.2 HRC within 58-62 spec
      },
      caseDepth: {
        actualEffectiveMm: 1.0, // within 0.8 - 1.2 mm spec
        totalCaseDepthMm: 1.4
      },
      visualInspection: {
        surfaceFinish: 'Clean, scale-free metallic luster',
        cracksObserved: false,
        distortionAcceptable: true
      },
      remarks: 'All parameters conform to customer specification DWG-PGL-2026-08.'
    });

    assert.equal(qcRes.status, 201);
    assert.equal(qcRes.data.evaluation.overallResult, 'PASS');
    inspectionId = qcRes.data.inspection._id;

    // 3. Approve Inspection (Issues Certificate HTC-YYYY-XXXXXX)
    const approveRes = await apiCall(`/qc/${inspectionId}/approve`, 'POST');
    assert.equal(approveRes.status, 200);

    const inspectedBatch = await Batch.findOne({ batchId });
    assert.equal(inspectedBatch.qcStatus, 'PASS');
    assert.equal(inspectedBatch.status, 'READY_FOR_DISPATCH');
    assert.ok(inspectedBatch.certificateNumber);
    certificateNumber = inspectedBatch.certificateNumber;
    assert.match(certificateNumber, /^HTC-\d{4}-\d{6}$/, 'Certificate must follow HTC-YYYY-XXXXXX sequence');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 9: HEAT TREATMENT CERTIFICATE VERIFICATION GUARD
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 9: Should verify Heat Treatment Certificate via verification API', async () => {
    const verifyRes = await apiCall(`/documents/verify/${certificateNumber}`);
    assert.equal(verifyRes.status, 200);
    assert.ok(verifyRes.data.verified);
    assert.equal(verifyRes.data.certificateNumber, certificateNumber);
    assert.equal(verifyRes.data.heatNumber, heatNumber);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 10: DISPATCH DELIVERY CHALLAN (DC-YYYY-XXXXXX)
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 10: Should generate Delivery Challan with weighbridge details', async () => {
    const res = await apiCall('/commercial/dispatch', 'POST', {
      batchId,
      vehicleNumber: 'GJ-01-AX-9876',
      transporterName: 'V-Trans Express Cargo',
      lrNumber: 'LR-2026-004491',
      packagingType: 'Corrugated Wooden Crates with Rust-Preventive Oil',
      remarks: 'Delivered in good condition with signed Certificate copy.'
    });

    assert.equal(res.status, 201);
    assert.ok(res.data.dispatch);
    dispatchId = res.data.dispatch._id;
    dispatchNumber = res.data.dispatch.dispatchNumber;
    invoiceId = res.data.invoice?._id;
    invoiceNumber = res.data.invoice?.invoiceNumber;

    assert.match(dispatchNumber, /^DC-\d{4}-\d{6}$/, 'Delivery Challan must follow DC-YYYY-XXXXXX sequence');
    assert.match(invoiceNumber, /^INV-\d{4}-\d{6}$/, 'Tax Invoice must follow INV-YYYY-XXXXXX sequence');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 11: TAX INVOICE & MULTI-TRANCHE PAYMENT (PAY-YYYY-XXXXXX)
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 11: Should verify state-aware GST on invoice and record customer payment', async () => {
    // 1. Verify invoice details: Gujarat customer -> CGST 9% + SGST 9%
    const invRes = await apiCall('/commercial/invoices');
    assert.equal(invRes.status, 200);
    const invoice = invRes.data.invoices.find(i => i.invoiceNumber === invoiceNumber);
    assert.ok(invoice);
    assert.equal(invoice.customerGstin, '24AAACP1234A1Z5');
    assert.ok(invoice.cgstAmount > 0, 'Gujarat customer must have CGST (9%)');
    assert.ok(invoice.sgstAmount > 0, 'Gujarat customer must have SGST (9%)');
    assert.equal(invoice.igstAmount, 0, 'Intra-state transaction must have zero IGST');

    // 2. Record full customer payment against invoice
    const payRes = await apiCall('/payments', 'POST', {
      invoice: invoice._id,
      amount: invoice.grandTotal - 500, // Cash/Bank receipt
      tdsDeducted: 500,                 // Section 194C TDS deduction
      paymentMode: 'NEFT',
      transactionReference: 'NEFT-AXIS-20260408-0012',
      remarks: 'Full settlement against Job Work Invoice'
    });

    assert.equal(payRes.status, 201);
    assert.ok(payRes.data.payment);
    paymentNumber = payRes.data.payment.paymentNumber;
    assert.match(paymentNumber, /^PAY-\d{4}-\d{6}$/, 'Payment must follow PAY-YYYY-XXXXXX sequence');
    assert.equal(payRes.data.invoice.paymentStatus, 'PAID');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 12: 360° FORWARD & BACKWARD TRACEABILITY TREE VERIFICATION
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 12: Should retrieve complete unbroken metallurgical timeline via Heat Number', async () => {
    const traceRes = await apiCall(`/traceability/search?q=${heatNumber}`);
    assert.equal(traceRes.status, 200);
    assert.ok(traceRes.data.results && traceRes.data.results.length > 0);

    const card = traceRes.data.results[0];
    assert.equal(card.heatNumber, heatNumber);
    assert.equal(card.batchId, batchId);
    assert.ok(card.customer, 'Traceability must include Customer');
    assert.ok(card.part, 'Traceability must include Part drawing');
    assert.ok(card.jobOrder, 'Traceability must link Job Order');
    assert.ok(card.furnaceCycle, 'Traceability must include Furnace Cycle');
    assert.equal(card.furnaceCycle.parameters.quenching.transferTimeSeconds, 11);
    assert.ok(card.qcInspections && card.qcInspections.length > 0, 'Traceability must include QC records');
    assert.equal(card.certificate.certificateNumber, certificateNumber, 'Traceability must include Certificate');
    assert.ok(card.dispatch, 'Traceability must include Delivery Challan');
    assert.ok(card.invoice, 'Traceability must include Tax Invoice');
    assert.ok(card.payments && card.payments.length > 0, 'Traceability must include Payment ledgers');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 13: OPERATOR CONSOLE ADMIN PASSWORD AUTHORIZATION & OVERRIDE
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 13: Should enforce Admin Password authorization for operator console step modification', async () => {
    // 1. Invalid password must be rejected with 401
    const invalidRes = await apiCall('/auth/verify-admin-password', 'POST', {
      password: 'wrong_operator_password',
      stage: 'LOADING',
      batchId
    });
    assert.equal(invalidRes.status, 401, 'Invalid password must return 401 Unauthorized');
    assert.equal(invalidRes.data.success, false);

    // 2. Valid admin password must authorize the modification
    const validRes = await apiCall('/auth/verify-admin-password', 'POST', {
      password: 'admin@123',
      stage: 'LOADING',
      batchId,
      reason: 'Tare scale recalibration override'
    });
    assert.equal(validRes.status, 200, 'Valid admin password must return 200 OK');
    assert.equal(validRes.data.success, true);
    assert.equal(validRes.data.authorized, true);
    assert.ok(validRes.data.adminName, 'Must include authorizing admin name');
    assert.equal(validRes.data.stage, 'LOADING');

    // 3. Modifying previous step parameters on batch via PUT
    const updateRes = await apiCall(`/batches/${batchId}`, 'PUT', {
      inputWeightKg: 105,
      notes: 'Supervisor override updated weight'
    });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.data.batch.inputWeightKg, 105);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 14: CHANGE PASSWORD (SELF-SERVICE) & ADMIN RESET PASSWORD
  // ─────────────────────────────────────────────────────────────────────────────
  it('Step 14: Should support changing user password and admin password reset', async () => {
    // 1. Wrong current password must be rejected
    const wrongCurrentRes = await apiCall('/auth/change-password', 'POST', {
      currentPassword: 'wrong_current_password',
      newPassword: 'newPassword@456',
      confirmPassword: 'newPassword@456'
    });
    assert.equal(wrongCurrentRes.status, 401);
    assert.equal(wrongCurrentRes.data.success, false);

    // 2. Mismatched confirmation password must be rejected
    const mismatchRes = await apiCall('/auth/change-password', 'POST', {
      currentPassword: 'admin@123',
      newPassword: 'newPassword@456',
      confirmPassword: 'differentPassword@789'
    });
    assert.equal(mismatchRes.status, 400);

    // 3. Valid password change must succeed
    const changeRes = await apiCall('/auth/change-password', 'POST', {
      currentPassword: 'admin@123',
      newPassword: 'admin@newPass2026',
      confirmPassword: 'admin@newPass2026'
    });
    assert.equal(changeRes.status, 200);
    assert.equal(changeRes.data.success, true);

    // 4. Verification: login with newly changed password succeeds
    const newLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin@newPass2026' })
    });
    assert.equal(newLoginRes.status, 200, 'Login with updated password must succeed');
    const newLoginData = await newLoginRes.json();
    authToken = newLoginData.token;

    // 5. Restore original password admin@123 to keep seeded environment consistent
    const restoreRes = await apiCall('/auth/change-password', 'POST', {
      currentPassword: 'admin@newPass2026',
      newPassword: 'admin@123',
      confirmPassword: 'admin@123'
    });
    assert.equal(restoreRes.status, 200);

    // 6. Test Admin resetting another user's password
    const usersListRes = await apiCall('/auth/users');
    assert.equal(usersListRes.status, 200);
    if (usersListRes.data.users && usersListRes.data.users.length > 0) {
      const targetUser = usersListRes.data.users[0];
      const resetRes = await apiCall(`/auth/users/${targetUser._id}/reset-password`, 'POST', {
        newPassword: 'ResetPassword@999'
      });
      assert.equal(resetRes.status, 200);
      assert.equal(resetRes.data.success, true);
    }
  });
});
