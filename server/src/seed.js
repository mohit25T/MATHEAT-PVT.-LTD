import { User } from './models/User.js';
import { Customer } from './models/Customer.js';
import { Supplier } from './models/Supplier.js';
import { Part } from './models/Part.js';
import { ProcessMaster } from './models/ProcessMaster.js';
import { Furnace } from './models/Furnace.js';
import { Recipe } from './models/Recipe.js';
import { GRN } from './models/GRN.js';
import { JobOrder } from './models/JobOrder.js';
import { Batch } from './models/Batch.js';
import { FurnaceCycle } from './models/FurnaceCycle.js';
import { QCInspection } from './models/QCInspection.js';
import { Inventory, InventoryTransaction, Scrap } from './models/Inventory.js';
import { Calibration, MaintenanceLog } from './models/Maintenance.js';
import { Dispatch, Invoice, BatchCosting } from './models/Invoice.js';
import { ROLES, BATCH_STATUS, FURNACE_STATUS, JOB_STATUS } from './config/constants.js';

export const seedDatabase = async () => {
  console.log('[SEED] Checking database state...');

  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('[SEED] Database already populated. Skipping.');
    return;
  }

  console.log('[SEED] Seeding industrial Heat Treatment ERP demo dataset...');

  // 1. Users
  const admin = await User.create({
    username: 'admin',
    email: 'admin@matheat.com',
    password: 'password123',
    firstName: 'Mohit',
    lastName: 'Admin',
    role: ROLES.SUPER_ADMIN,
    phone: '+91 98765 43210',
    department: 'Management'
  });

  const prodMgr = await User.create({
    username: 'prodmgr',
    email: 'production@matheat.com',
    password: 'password123',
    firstName: 'Suresh',
    lastName: 'Patil',
    role: ROLES.PRODUCTION_MANAGER,
    department: 'Production'
  });

  const operator = await User.create({
    username: 'operator',
    email: 'operator@matheat.com',
    password: 'password123',
    firstName: 'Ramesh',
    lastName: 'Kumar',
    role: ROLES.FURNACE_OPERATOR,
    department: 'Furnace Shop Floor',
    badgeNumber: 'OP-104'
  });

  const qcMgr = await User.create({
    username: 'qcmgr',
    email: 'qc@matheat.com',
    password: 'password123',
    firstName: 'Er. Rajesh',
    lastName: 'Sharma',
    role: ROLES.QC_MANAGER,
    department: 'Metallurgical QA Lab'
  });

  const storeMgr = await User.create({
    username: 'storemgr',
    email: 'store@matheat.com',
    password: 'password123',
    firstName: 'Anil',
    lastName: 'Deshmukh',
    role: ROLES.STORE_MANAGER,
    department: 'Stores & Dispatch'
  });

  // 2. Customers
  const custTata = await Customer.create({
    customerCode: 'CUST-TATA',
    companyName: 'Tata Motors Ltd. - Powertrain Division',
    gstin: '27AAACT2727Q1ZW',
    billingAddress: {
      street: 'Pimpri Industrial Area',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411018'
    },
    contacts: [{ name: 'V. Kulkarni', designation: 'Purchase Manager', phone: '+91 98220 11223', email: 'vkulkarni@tatamotors.com', isPrimary: true }],
    paymentTerms: '30 Days Net',
    creditLimit: 2500000
  });

  const custSKF = await Customer.create({
    customerCode: 'CUST-SKF',
    companyName: 'SKF India Bearings Ltd.',
    gstin: '27AAACS1900K1Z9',
    billingAddress: {
      street: 'Chakan Industrial Corridor',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '410501'
    },
    contacts: [{ name: 'Amit Saxena', designation: 'Head Quality & SCM', phone: '+91 99300 44556', email: 'asaxena@skf.com', isPrimary: true }],
    paymentTerms: '45 Days Net',
    creditLimit: 3000000
  });

  // 3. Suppliers
  await Supplier.create({
    supplierCode: 'SUPP-JSW',
    name: 'JSW Steel Ltd. (Special Steel Plant)',
    category: 'STEEL_MILL',
    gstin: '27AABCS3310M1Z8',
    address: { city: 'Tarapur', state: 'Maharashtra', pincode: '401506' }
  });

  // 4. Parts
  const part6205 = await Part.create({
    partNumber: '6205-BRG-RING',
    partName: '6205 Deep Groove Ball Bearing Outer Ring',
    customer: custSKF._id,
    drawingNumber: 'DWG-6205-RevB',
    revision: 'R1',
    materialGrade: 'EN31',
    standard: 'IS 5517 / DIN 17230',
    weightPerPiece: 0.28,
    dimensions: { outerDiameter: 52, innerDiameter: 25, length: 15, description: 'OD 52mm x ID 25mm x W 15mm' },
    requiredProcess: 'Carburizing + Hardening + Tempering',
    hardnessSpec: { scale: 'HRC', min: 58, max: 62, target: 60 },
    coreHardnessSpec: { scale: 'HRC', min: 32, max: 40 },
    caseDepthSpec: { required: true, effectiveMin: 0.8, effectiveMax: 1.1, totalMin: 1.1, totalMax: 1.4, cutoffHardness: '50 HRC / 550 HV' },
    metallographySpec: { grainSize: 'ASTM 6-8', retainedAusteniteMax: 15, decarburizationMax: 0.05, structureRequired: 'Uniform Tempered Martensite' },
    nominalChemistry: { c: { min: 0.95, max: 1.1 }, mn: { min: 0.3, max: 0.75 }, cr: { min: 1.3, max: 1.6 } },
    unitRatePerKg: 32,
    unitRatePerPiece: 9
  });

  const partPinion = await Part.create({
    partNumber: 'PINION-24T-TATA',
    partName: 'Transmission Drive Pinion 24-Teeth',
    customer: custTata._id,
    drawingNumber: 'DWG-PIN-24T',
    revision: 'R2',
    materialGrade: '20MnCr5',
    standard: 'DIN EN 10084',
    weightPerPiece: 1.85,
    dimensions: { outerDiameter: 85, length: 140, description: 'Head Dia 85mm x Length 140mm' },
    requiredProcess: 'Carburizing + Hardening + Tempering',
    hardnessSpec: { scale: 'HRC', min: 59, max: 63, target: 61 },
    coreHardnessSpec: { scale: 'HRC', min: 35, max: 42 },
    caseDepthSpec: { required: true, effectiveMin: 1.0, effectiveMax: 1.3, cutoffHardness: '50 HRC' },
    unitRatePerKg: 36,
    unitRatePerPiece: 66
  });

  // 5. Process Masters
  const procCarb = await ProcessMaster.create({
    processCode: 'PROC-CARB-HT',
    processName: 'Carburizing + Hardening + Tempering',
    category: 'THERMO_CHEMICAL',
    defaultTempRange: { min: 820, max: 930 },
    defaultSoakingTime: 120,
    carbonPotentialRange: { min: 0.85, max: 1.05 },
    quenchMedium: 'OIL',
    defaultQuenchTemp: 60,
    temperingTemp: 180,
    temperingTime: 120
  });

  // 6. Furnaces
  const f01 = await Furnace.create({
    furnaceId: 'F-01',
    name: 'Sealed Quench Furnace #1 (SQF-01)',
    type: 'SEALED_QUENCH_FURNACE',
    capacityKg: 600,
    maxTemperature: 1050,
    currentStatus: FURNACE_STATUS.HEATING,
    currentTemperature: 852,
    targetTemperature: 855,
    currentCarbonPotential: 0.92,
    loadedWeightKg: 420,
    calibrationStatus: 'VALID',
    nextCalibrationDue: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000)
  });

  const f02 = await Furnace.create({
    furnaceId: 'F-02',
    name: 'Pit Carburizing Furnace #2 (PIT-02)',
    type: 'PIT_CARBURIZING',
    capacityKg: 1200,
    maxTemperature: 1000,
    currentStatus: FURNACE_STATUS.IDLE,
    currentTemperature: 45,
    loadedWeightKg: 0,
    calibrationStatus: 'EXPIRING_SOON', // Trigger 10-day alert
    nextCalibrationDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  const f03 = await Furnace.create({
    furnaceId: 'F-03',
    name: 'Continuous Mesh Belt Furnace #3',
    type: 'MESH_BELT',
    capacityKg: 400,
    currentStatus: FURNACE_STATUS.IDLE,
    currentTemperature: 28,
    loadedWeightKg: 0
  });

  const f04 = await Furnace.create({
    furnaceId: 'F-04',
    name: 'Tempering Oven #4 (TO-04)',
    type: 'TEMPERING_OVEN',
    capacityKg: 800,
    currentStatus: FURNACE_STATUS.IDLE,
    currentTemperature: 30,
    loadedWeightKg: 0
  });

  // 7. Approved Recipe
  const recipeEN31 = await Recipe.create({
    recipeCode: 'RCP-EN31-6205',
    recipeName: 'Standard Carburizing Cycle for EN31 Bearing Rings',
    process: procCarb._id,
    part: part6205._id,
    materialGrade: 'EN31',
    revision: 'V1',
    isApproved: true,
    targetTemperature: 850,
    soakingTimeMinutes: 90,
    carbonPotential: 0.90,
    quenchMedium: 'OIL',
    targetQuenchTemperature: 60,
    temperingTemperature: 180,
    temperingTimeMinutes: 120,
    approvedBy: qcMgr._id,
    approvalDate: new Date()
  });

  // 8. Material Inward (GRN) with Mandatory Heat Number
  const grn1 = await GRN.create({
    grnNumber: 'GRN-2026-0001',
    ownership: 'CUSTOMER',
    customer: custSKF._id,
    challanNumber: 'DC-SKF-8921',
    poNumber: 'PO-SKF-2026-901',
    part: part6205._id,
    partNumber: part6205.partNumber,
    partName: part6205.partName,
    materialGrade: 'EN31',
    heatNumber: 'H-45872', // Legendary Heat Number for Traceability
    castNumber: 'C-9021-B',
    millOrigin: 'JSW Steel Plant',
    chemicalComposition: { c: 0.98, mn: 0.45, si: 0.25, cr: 1.42, ni: 0.12, mo: 0.04, s: 0.015, p: 0.018 },
    receivedQuantity: 3000,
    receivedWeight: 840,
    acceptedQuantity: 3000,
    acceptedWeight: 840,
    issuedQuantity: 1500,
    issuedWeight: 420,
    storageLocation: 'CUSTOMER-BAY-SKF-01',
    inspectedBy: storeMgr._id
  });

  // 9. Job Order
  const jo1 = await JobOrder.create({
    jobOrderNumber: 'JO-2026-0001',
    customer: custSKF._id,
    customerPoNumber: 'PO-SKF-2026-901',
    part: part6205._id,
    grn: grn1._id,
    heatNumber: 'H-45872',
    targetQuantity: 1500,
    targetWeight: 420,
    requiredProcess: part6205.requiredProcess,
    requiredHardness: '58-62 HRC',
    requiredCaseDepth: '0.80 - 1.10 mm',
    deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'HIGH',
    status: JOB_STATUS.IN_PRODUCTION,
    createdBy: prodMgr._id
  });

  // 10. Batches
  // Batch 1: Currently running in Furnace F-01
  const batchRunning = await Batch.create({
    batchId: 'HT-2026-000125',
    jobOrder: jo1._id,
    customer: custSKF._id,
    part: part6205._id,
    grn: grn1._id,
    materialGrade: 'EN31',
    heatNumber: 'H-45872',
    furnace: f01._id,
    furnaceId: 'F-01',
    recipe: recipeEN31._id,
    recipeRevision: 'V1',
    operator: operator._id,
    inputQuantity: 1500,
    inputWeightKg: 420,
    productionDate: new Date(),
    status: BATCH_STATUS.HEATING,
    qcStatus: 'NOT_STARTED'
  });

  f01.currentBatch = batchRunning._id;
  f01.currentBatchId = batchRunning.batchId;
  await f01.save();

  // Furnace Cycle for Batch 1
  await FurnaceCycle.create({
    cycleId: 'FC-2026-0001',
    batch: batchRunning._id,
    batchId: batchRunning.batchId,
    furnace: f01._id,
    furnaceId: 'F-01',
    operator: operator._id,
    parameters: {
      heating: { targetTemp: 850, actualTemp: 852, targetHeatingTimeMinutes: 60, actualHeatingTimeMinutes: 58 },
      soaking: { targetTemp: 850, actualTemp: 852, targetSoakMinutes: 90, actualSoakMinutes: 92, targetCarbonPotential: 0.9, actualCarbonPotential: 0.91 },
      quenching: { quenchMedium: 'OIL', targetQuenchTemp: 60, actualQuenchTemp: 62, targetQuenchTimeMinutes: 15 },
      tempering: { targetTemp: 180, actualTemp: 182, targetTimeMinutes: 120, actualTimeMinutes: 120 }
    },
    cycleStatus: 'IN_PROGRESS'
  });

  // Batch 2: Completed, QC Approved, Certificate Available
  const batchCompleted = await Batch.create({
    batchId: 'HT-2026-000124',
    jobOrder: jo1._id,
    customer: custSKF._id,
    part: part6205._id,
    grn: grn1._id,
    materialGrade: 'EN31',
    heatNumber: 'H-45872',
    furnace: f01._id,
    furnaceId: 'F-01',
    recipe: recipeEN31._id,
    recipeRevision: 'V1',
    operator: operator._id,
    inputQuantity: 1500,
    inputWeightKg: 420,
    outputQuantity: 1495,
    outputWeightKg: 418.6,
    rejectionQuantity: 5,
    rejectionWeightKg: 1.4,
    status: BATCH_STATUS.READY_FOR_DISPATCH,
    qcStatus: 'PASS',
    certificateNumber: 'HTC-HT-2026-000124',
    certificateGeneratedAt: new Date()
  });

  // QC Inspection for Batch 2 (Fully parameter-packed with PASS)
  await QCInspection.create({
    inspectionId: 'QC-2026-0001',
    batch: batchCompleted._id,
    batchId: batchCompleted.batchId,
    jobOrder: jo1._id,
    part: part6205._id,
    heatNumber: 'H-45872',
    hardness: {
      scale: 'HRC',
      specifiedMin: 58,
      specifiedMax: 62,
      sampleReadings: [
        { sampleNumber: 1, location: 'Ring Surface - OD', value: 60.5 },
        { sampleNumber: 2, location: 'Ring Surface - Face', value: 60.2 },
        { sampleNumber: 3, location: 'Ring Surface - ID', value: 60.8 }
      ],
      averageValue: 60.5,
      coreSpecifiedMin: 32,
      coreSpecifiedMax: 40,
      coreReadings: [{ sampleNumber: 1, location: 'Core Section', value: 35.8 }],
      coreAverageValue: 35.8,
      result: 'PASS'
    },
    caseDepth: {
      required: true,
      specifiedEffectiveMin: 0.8,
      specifiedEffectiveMax: 1.1,
      actualEffectiveMm: 0.94,
      totalCaseDepthMm: 1.25,
      cutoffHardness: '50 HRC / 550 HV',
      result: 'PASS'
    },
    metallography: {
      required: true,
      microstructureObserved: 'Uniform Tempered Martensite with fine dispersed carbides',
      grainSizeAstm: 'ASTM 7',
      retainedAustenitePercent: 8,
      retainedAusteniteLimit: 15,
      decarburizationDepthMm: 0,
      result: 'PASS'
    },
    overallResult: 'PASS',
    isLocked: true,
    inspectedBy: qcMgr._id,
    inspectorName: 'Er. Rajesh Sharma',
    approvedBy: qcMgr._id,
    approverName: 'Er. Rajesh Sharma (Lead Metallurgist)',
    approvalDate: new Date()
  });

  // 11. Calibration Records
  await Calibration.create({
    calibrationId: 'CAL-2026-01',
    instrumentName: 'Furnace F-01 Zone 1 Control Thermocouple (Type S)',
    instrumentType: 'THERMOCOUPLE',
    serialNumber: 'TC-S-9912',
    linkedFurnace: f01._id,
    furnaceId: 'F-01',
    calibrationDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
    certificateNumber: 'NABL-CAL-4821',
    accuracyRange: '± 1.0 °C'
  });

  await Calibration.create({
    calibrationId: 'CAL-2026-02',
    instrumentName: 'Furnace F-02 Digital Temp Controller (Eurotherm)',
    instrumentType: 'TEMP_CONTROLLER',
    serialNumber: 'EUR-2408-77',
    linkedFurnace: f02._id,
    furnaceId: 'F-02',
    calibrationDate: new Date(Date.now() - 358 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expirating in 7 days!
    certificateNumber: 'NABL-CAL-3310',
    accuracyRange: '± 0.5 °C'
  });

  await Calibration.create({
    calibrationId: 'CAL-2026-03',
    instrumentName: 'Rockwell Hardness Tester (HT-RC-01)',
    instrumentType: 'HARDNESS_TESTER',
    serialNumber: 'RC-TEST-004',
    calibrationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 265 * 24 * 60 * 60 * 1000),
    certificateNumber: 'NABL-CAL-9921',
    accuracyRange: '± 0.5 HRC'
  });

  // 12. Batch Costing Demo
  await BatchCosting.create({
    batchId: 'HT-2026-000124',
    batchWeightKg: 420,
    batchPieces: 1500,
    electricityCost: 1980,
    gasFuelCost: 650,
    quenchOilConsumablesCost: 450,
    laborCost: 1200,
    furnaceDepreciationOverhead: 800,
    qcTestingCost: 500,
    totalBatchCost: 5580,
    costPerKg: 13.28,
    costPerPiece: 3.72,
    billingRevenue: 13440,
    grossMarginAmount: 7860,
    grossMarginPercentage: 58.5
  });

  // 13. Dispatch & Invoice Seed
  const dispatch1 = await Dispatch.create({
    dispatchNumber: 'DSP-2026-0001',
    customer: custSKF._id,
    batch: batchCompleted._id,
    batchId: batchCompleted.batchId,
    part: part6205._id,
    heatNumber: 'H-45872',
    quantityPcs: 1495,
    weightKg: 418.6,
    vehicleNumber: 'MH-20-DE-4412',
    transporterName: 'V-Trans Logistics Ltd.',
    lrNumber: 'LR-882109',
    qcApprovalVerified: true,
    preparedBy: storeMgr._id
  });

  await Invoice.create({
    invoiceNumber: 'INV-2026-0001',
    customer: custSKF._id,
    dispatch: dispatch1._id,
    batchId: batchCompleted.batchId,
    partNumber: part6205.partNumber,
    heatNumber: 'H-45872',
    billingType: 'PER_KG',
    billedQuantity: 1495,
    billedWeightKg: 418.6,
    unitRate: 32,
    subtotal: 13395,
    cgstAmount: 1205.55,
    sgstAmount: 1205.55,
    totalAmount: 15806.10,
    paymentTerms: '30 Days Net',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paymentStatus: 'PAID',
    amountPaid: 15806.10
  });

  console.log('[SEED] Demo dataset successfully seeded into database!');
};

