# MATHEAT PVT. LTD. — Heat-Treatment ERP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, production-grade, end-to-end industrial Heat-Treatment ERP + MES for **MATHEAT PVT. LTD.** centered entirely around the Heat Number (`HT-YYYY-XXXXXX`), guaranteeing full metallurgical traceability from Customer PO to final Payment.

**Architecture:** 
- Unified Heat Engine: Relational links from Customer → Job Order → MRN → Job Card → Batch → Heat Number → Furnace → Logs (Load, Heat, Soak, Quench, Temper) → QC → Certificate → Dispatch → Tax Invoice → Payment.
- Backend: Express, Mongoose / MongoDB Atlas, strict Business Rule validation middleware, sequential numbering utilities, and PDF/QR generation.
- Frontend: Vite, React 19, Tailwind CSS, Lucide icons, high-contrast industrial UI (Deep Navy `#0f172a`, MATHEAT Orange `#ea580c`), zero-latency cache hydration, and dedicated glove-friendly operator console.

**Tech Stack:** Node.js, Express, MongoDB/Mongoose, React 19, Tailwind CSS, Lucide React, QRCode, PDFKit.

**Spec:** [`docs/superpowers/specs/2026-10-06-heat-treatment-erp-design.md`](file:///c:/Users/mohit/OneDrive/Desktop/MATHEAT%20PVT.%20LTD/docs/superpowers/specs/2026-10-06-heat-treatment-erp-design.md)

## Global Constraints
- Do not break existing API routes or UI page functionality.
- Heat Number (`HT-YYYY-XXXXXX`) must NEVER be reused or silently overwritten.
- Once a Process Recipe is approved for a Job Order, operators cannot edit approved parameters.
- Furnace cannot be assigned if calibration is expired or maintenance status is not healthy.
- Operator cannot mark soaking complete before minimum soak time without supervisor override.
- Conservation of mass: Output + Scrap + Loss must reconcile with Input weight within tolerance.
- QC testing requires active, non-expired NABL calibrated instruments.
- Heat Treatment Certificate (`HTC-`) and Dispatch (`DC-`) require passing QC.
- Customer-owned material must remain strictly segregated from company consumables.

---

### Task 1: Backend RBAC Matrix, User Roles & Authorization Guard Middleware

**Files:**
- Modify: `server/src/config/constants.js`
- Modify: `server/src/middleware/auth.js`
- Modify: `server/src/controllers/authController.js`
- Modify: `client/src/context/AuthContext.jsx`

**Interfaces:**
- Consumes: User JWT token with `role`
- Produces: `ROLES` constant enum matching the 8 factory roles; `authorizeRoles(...roles)` Express middleware; frontend `ROLE_PERMISSIONS` and `canAccess(user, moduleId)`

- [ ] **Step 1: Update ROLES constant enum in `server/src/config/constants.js`**
Ensure the 8 canonical roles are present:
`SUPER_ADMIN`, `ADMIN`, `SALES`, `PRODUCTION_MANAGER`, `FURNACE_OPERATOR`, `QC_QUALITY`, `STORE_DISPATCH`, `ACCOUNTS`. Maintain backward compatibility aliases (`COMMERCIAL`, `PLANT_MANAGER`, `QUALITY_INSPECTOR`).

- [ ] **Step 2: Update `server/src/middleware/auth.js`**
Ensure `authorizeRoles(...allowedRoles)` correctly evaluates wildcard permissions (`SUPER_ADMIN`, `ADMIN`) and specific role arrays, returning HTTP 403 with detailed error message when unauthorized.

- [ ] **Step 3: Update `client/src/context/AuthContext.jsx`**
Map the 8 roles to their exact permitted navigation tab IDs. For `FURNACE_OPERATOR`, strictly restrict navigation to `['operator', 'furnaces']`.

- [ ] **Step 4: Verify Auth & Role Guard**
Run test script / health check to ensure auth routes and role permissions function without errors.

- [ ] **Step 5: Commit changes**
`git add server/src/config/constants.js server/src/middleware/auth.js server/src/controllers/authController.js client/src/context/AuthContext.jsx; git commit -m "feat(auth): enforce 8 factory roles and RBAC permissions"`

---

### Task 2: Master Data Schemas: Customer, Part, ProcessMaster, Recipe, Furnace & QC Instrument

**Files:**
- Modify: `server/src/models/Customer.js`
- Modify: `server/src/models/Part.js`
- Modify: `server/src/models/ProcessMaster.js`
- Modify: `server/src/models/Recipe.js`
- Modify: `server/src/models/Furnace.js`
- Modify: `server/src/models/QCInstrument.js`

**Interfaces:**
- Consumes: Mongoose Schema
- Produces: Versioned `Part` with drawing & customer spec attachments; `ProcessMaster` with full parameter sets; `Recipe` with revision locking; `Furnace` with quench tank & calibration details; `QCInstrument` with calibration expiry status.

- [ ] **Step 1: Enhance `server/src/models/Part.js`**
Add `customer` ref, `drawingNumber`, `revision`, `componentType`, `dimensions`, `surfaceArea`, `criticalDimensions`, `existingHardness`, `requiredHardness`, `requiredCaseDepth`, `requiredProcess`, `specialInstructions`, `attachments` array (`name`, `fileUrl`, `type`, `uploadedAt`), `isActive`.

- [ ] **Step 2: Enhance `server/src/models/ProcessMaster.js` & `server/src/models/Recipe.js`**
Add parameters for heating rate, carbon potential tolerance, quench medium (`OIL`, `WATER`, `POLYMER`, `SALT`), quench oil type, quench temperature, agitation speed, **maxTransferTimeSeconds**, tempering parameters, distortion limits, and revision audit reasons.

- [ ] **Step 3: Enhance `server/src/models/Furnace.js` & `server/src/models/QCInstrument.js`**
Ensure `Furnace` has `quenchTankCapacityLiters`, `quenchMedium`, `calibrationStatus` (`VALID`, `EXPIRING_SOON`, `EXPIRED`), `maintenanceStatus` (`HEALTHY`, `DUE_FOR_PM`, `UNDER_BREAKDOWN`). Ensure `QCInstrument` has `calibrationDueDate` and `status` (`ACTIVE`, `CALIBRATION_OVERDUE`).

- [ ] **Step 4: Test Schema Loading**
Verify `node --check server/src/models/*.js` runs cleanly.

- [ ] **Step 5: Commit changes**
`git add server/src/models/Part.js server/src/models/ProcessMaster.js server/src/models/Recipe.js server/src/models/Furnace.js server/src/models/QCInstrument.js; git commit -m "feat(models): upgrade Part, Recipe, Furnace and QCInstrument master schemas"`

---

### Task 3: Master Data Controllers & Frontend Masters & Recipe Studio Integration

**Files:**
- Modify: `server/src/controllers/masterController.js`
- Modify: `server/src/controllers/recipeController.js`
- Modify: `client/src/pages/MastersPage.jsx`
- Modify: `client/src/pages/RecipesPage.jsx`

**Interfaces:**
- Consumes: REST APIs `/api/masters/*`, `/api/recipes/*`
- Produces: Parts catalog with document uploads, Process Master library, Recipe approval workflow with revision locking.

- [ ] **Step 1: Update `server/src/controllers/masterController.js`**
Ensure CRUD endpoints for Parts, Customers, Suppliers, and Processes support document attachments, revision bumping, and active filtering.

- [ ] **Step 2: Update `server/src/controllers/recipeController.js`**
Add revision locking: if a recipe is already approved or referenced in active batches, modifying it generates a new revision record (`V2`, `V3`) with mandatory `revisionReason` and author logging.

- [ ] **Step 3: Enhance `client/src/pages/MastersPage.jsx`**
Provide tabs for Customers, Parts, Users, and Processes. Include drawing upload field and customer specification attachment preview.

- [ ] **Step 4: Enhance `client/src/pages/RecipesPage.jsx`**
Display complete heat-treatment parameters: Heating rate, Soaking time, Carbon Potential, Quenching medium, Quench temp, Max transfer time, Tempering cycle, and Hardness/Case depth targets.

- [ ] **Step 5: Commit changes**
`git add server/src/controllers/masterController.js server/src/controllers/recipeController.js client/src/pages/MastersPage.jsx client/src/pages/RecipesPage.jsx; git commit -m "feat(masters): implement versioned part drawings and recipe parameter controls"`

---

### Task 4: Sales Pipeline: Enquiry & Quotation Flow with Sequential Numbering

**Files:**
- Modify: `server/src/models/Enquiry.js`
- Modify: `server/src/models/Quotation.js`
- Modify: `server/src/controllers/salesController.js`
- Modify: `client/src/pages/SalesPage.jsx`

**Interfaces:**
- Consumes: Customer RFQ, part requirements
- Produces: `ENQ-YYYY-XXXXXX`, `QT-YYYY-XXXXXX`, and conversion trigger to `JO-YYYY-XXXXXX`.

- [ ] **Step 1: Ensure Sequential Numbering in `salesController.js`**
Implement `getNextEnquiryNumber` (`ENQ-YYYY-XXXXXX`) and `getNextQuotationNumber` (`QT-YYYY-XXXXXX`).

- [ ] **Step 2: Add Quotation Breakdown Calculation**
In `createQuotation`: calculate Subtotal, Rate type (`PER_KG`, `PER_PIECE`, `FIXED_LOT`), Minimum Job Charge, Testing Charge, Packing, Transport, GST (18%), and Grand Total.

- [ ] **Step 3: Implement `convertToJobOrder` in `salesController.js`**
When Quotation status is marked `ACCEPTED`, provide endpoint `POST /api/sales/quotations/:id/convert-job-order` that auto-generates a confirmed `JobOrder` record (`JO-YYYY-XXXXXX`).

- [ ] **Step 4: Update `client/src/pages/SalesPage.jsx`**
Add "Convert to Job Order" 1-click button on accepted quotations, triggering job order creation and navigation.

- [ ] **Step 5: Commit changes**
`git add server/src/models/Enquiry.js server/src/models/Quotation.js server/src/controllers/salesController.js client/src/pages/SalesPage.jsx; git commit -m "feat(sales): implement enquiry quotation pipeline with automated job order conversion"`

---

### Task 5: Job Order State Machine & Material Receipt Note (MRN) with Condition Flags

**Files:**
- Modify: `server/src/models/JobOrder.js`
- Modify: `server/src/models/GRN.js`
- Modify: `server/src/controllers/jobOrderController.js`
- Modify: `server/src/controllers/grnController.js`
- Modify: `client/src/pages/GrnPage.jsx`
- Modify: `client/src/pages/JobOrdersPage.jsx`

**Interfaces:**
- Consumes: Customer Delivery Challan, Job Order ref
- Produces: `MRN-YYYY-XXXXXX` (or `GRN-YYYY-XXXXXX`), Material Condition evaluation (`GOOD`, `DAMAGED`, `SHORT`, `EXCESS`, `RUSTED`, `MIXED`, `UNKNOWN`), Weighbridge camera proof, Incoming QC result.

- [ ] **Step 1: Update `JobOrder` schema & controller**
Add status transition validation:
`DRAFT` → `CONFIRMED` → `MATERIAL_PENDING` → `MATERIAL_RECEIVED` → `READY_FOR_PRODUCTION` → `IN_PRODUCTION` → `QC` → `READY_FOR_DISPATCH` → `DISPATCHED` → `COMPLETED`.
Add `grn` reference and sequential numbering `JO-YYYY-XXXXXX`.

- [ ] **Step 2: Update `GRN` schema & `grnController.js`**
Ensure fields: `grnNumber` (`MRN-YYYY-XXXXXX` / `GRN-YYYY-XXXXXX`), `ownership: 'CUSTOMER'`, `customer`, `jobOrder`, `part`, `vehicleNumber`, `challanNumber`, `challanDate`, `packageCount`, `grossWeightKg`, `tareWeightKg`, `netWeightKg`, `receivedQuantity`, `scalePhoto`, `materialPhoto`, `materialCondition` (`GOOD`, `DAMAGED`, `SHORT`, `EXCESS`, `RUSTED`, `MIXED`, `UNKNOWN`), `inspectionStatus` (`PENDING`, `ACCEPTED`, `PARTIALLY_ACCEPTED`, `REJECTED`, `HOLD`).

- [ ] **Step 3: Update `GrnPage.jsx`**
Enhance Material Inward form with material condition radio buttons, photo proofs, and automatic linkage to open Job Orders. When inward inspection is `ACCEPTED`, update Job Order status to `MATERIAL_RECEIVED`.

- [ ] **Step 4: Commit changes**
`git add server/src/models/JobOrder.js server/src/models/GRN.js server/src/controllers/jobOrderController.js server/src/controllers/grnController.js client/src/pages/GrnPage.jsx client/src/pages/JobOrdersPage.jsx; git commit -m "feat(inward): implement MRN material receiving with condition assessment and PO linkage"`

---

### Task 6: Job Card Traveler Generation with QR Codes (`JC-YYYY-XXXXXX`)

**Files:**
- Modify: `server/src/models/JobCard.js`
- Modify: `server/src/controllers/jobCardController.js`
- Modify: `client/src/pages/JobOrdersPage.jsx`

**Interfaces:**
- Consumes: Accepted Job Order and MRN
- Produces: `JC-YYYY-XXXXXX`, Printable Shop Traveler with high-density QR code.

- [ ] **Step 1: Sequential Numbering in `jobCardController.js`**
Generate sequential `JC-YYYY-XXXXXX`. Validate that linked Job Order has accepted material before issuing Job Card.

- [ ] **Step 2: Embed QR Code Payload in Job Card**
Generate QR code data containing:
`MATHEAT|JC:{jobCardNumber}|JO:{jobOrderNumber}|HEAT:{heatNumber}|PART:{partNumber}|QTY:{quantityPcs}|WT:{weightKg}|PROC:{requiredProcess}|HARD:{requiredHardness}`.

- [ ] **Step 3: Update Job Traveler Modal in `JobOrdersPage.jsx`**
Ensure Job Card modal displays full metallurgical specifications, drawing number, barcode/QR code, and a clean "Print Traveler" stylesheet for shop-floor distribution.

- [ ] **Step 4: Commit changes**
`git add server/src/models/JobCard.js server/src/controllers/jobCardController.js client/src/pages/JobOrdersPage.jsx; git commit -m "feat(jobcard): implement sequential job card traveler with QR code tracking"`

---

### Task 7: Batch Creation, Heat Planning & Furnace Capacity & Calibration Validation

**Files:**
- Modify: `server/src/models/Batch.js`
- Modify: `server/src/controllers/batchController.js`
- Modify: `client/src/pages/BatchesPage.jsx`
- Modify: `client/src/pages/FurnacesPage.jsx`

**Interfaces:**
- Consumes: Job Card, Furnace Master, Recipe
- Produces: `BAT-YYYY-XXXXXX`, Unique non-reusable Heat Number `HT-YYYY-XXXXXX`, Furnace assignment validation.

- [ ] **Step 1: Enforce Unique Heat Number (`HT-YYYY-XXXXXX`) in `batchController.js`**
Ensure every batch cycle receives a unique `heatNumber` (`HT-YYYY-XXXXXX`). Index `heatNumber` uniquely.

- [ ] **Step 2: Implement Heat Planning Validation Rules in `batchController.js`**
Before assigning a furnace to a heat:
1. Validate `batchWeightKg <= furnace.capacityKg`.
2. Validate furnace is not in `MAINTENANCE` or `BREAKDOWN`.
3. Validate furnace `calibrationStatus !== 'EXPIRED'`.
4. Validate furnace quench medium matches recipe requirements.
Return clear HTTP 400 validation error if any rule is violated.

- [ ] **Step 3: Update `BatchesPage.jsx` & `FurnacesPage.jsx`**
Render furnace capacity progress bar, calibration status pills, and prevent dispatching heats to expired or overloaded furnaces.

- [ ] **Step 4: Commit changes**
`git add server/src/models/Batch.js server/src/controllers/batchController.js client/src/pages/BatchesPage.jsx client/src/pages/FurnacesPage.jsx; git commit -m "feat(batch): enforce unique heat numbers and furnace capacity/calibration validations"`

---

### Task 8: Dedicated Glove-Friendly Operator Interface with Stage Lockouts & Mass Reconciliation

**Files:**
- Modify: `server/src/models/FurnaceCycle.js`
- Modify: `server/src/controllers/batchController.js`
- Modify: `client/src/pages/OperatorPage.jsx`

**Interfaces:**
- Consumes: Assigned Furnace, Assigned Heat Number
- Produces: Cycle telemetry logs, calculated Door-to-Quench Transfer Time (sec), Mass-balance reconciliation (`Input = Output + Scrap + Loss`).

- [ ] **Step 1: Update `FurnaceCycle` model & controller endpoints**
Add phase transition endpoints:
`POST /api/batches/:id/operator/start-loading`
`POST /api/batches/:id/operator/start-heating`
`POST /api/batches/:id/operator/start-soaking`
`POST /api/batches/:id/operator/quench` (calculates `transferTimeSeconds = quenchStartTime - doorOpenTime`)
`POST /api/batches/:id/operator/temper`
`POST /api/batches/:id/operator/complete` (enforces reconciliation equation).

- [ ] **Step 2: Implement Mass Reconciliation Validation on Server**
In `completeBatch`:
$$\text{Tolerance} = 0.02 \times \text{Input Weight}$$
$$|\text{Input Weight} - (\text{Output Weight} + \text{Scrap Weight} + \text{Process Loss})| \le \text{Tolerance}$$
Reject impossible counts (e.g., Output > Input or Sum != Input).

- [ ] **Step 3: Enhance `OperatorPage.jsx`**
1. Large high-contrast touch cards for industrial tablet use.
2. Operator cannot edit target temperature or target soak time.
3. Soaking countdown timer: button to advance is locked until soak time elapses (unless supervisor override toggle is activated).
4. Live Transfer Time counter during quench door open.
5. Reconciliation calculator showing real-time balance.

- [ ] **Step 4: Commit changes**
`git add server/src/models/FurnaceCycle.js server/src/controllers/batchController.js client/src/pages/OperatorPage.jsx; git commit -m "feat(operator): build glove-friendly operator console with soak lock and mass reconciliation"`

---

### Task 9: Multi-Parameter QC Lab Inspection with Instrument Calibration Lockouts

**Files:**
- Modify: `server/src/models/QCInspection.js`
- Modify: `server/src/controllers/qcController.js`
- Modify: `server/src/services/qcEngine.js`
- Modify: `client/src/pages/QcLabPage.jsx`

**Interfaces:**
- Consumes: Completed Heat Number, Calibrated QC Instruments
- Produces: `QC-YYYY-XXXXXX`, multi-point hardness evaluation, microhardness case depth traverse, microstructure pass/fail, permanent record lock.

- [ ] **Step 1: Instrument Calibration Check in `qcController.js`**
When recording inspection readings:
Verify selected `instrumentId` in `QCInstrument` has `calibrationDueDate >= Date.now()`. Block selection of expired instruments.

- [ ] **Step 2: Multi-Parameter Evaluation Engine in `qcEngine.js`**
Evaluate:
1. Surface Hardness: Multi-sample average within `[specifiedMin, specifiedMax]`.
2. Core Hardness: Reading within `[coreMin, coreMax]`.
3. Case Depth: Effective case depth within tolerance.
4. Metallography: Grain size ASTM 5-8, Retained Austenite <= 15%, zero decarb.
5. Dimensional & Visual: Crack detection (PASS/FAIL).
Compute overall result: `PASS`, `FAIL`, or `HOLD`.

- [ ] **Step 3: Update `QcLabPage.jsx`**
Provide clean sample point adder, instrument selector with calibration status warning, real-time average calculation, and sign-off locking.

- [ ] **Step 4: Commit changes**
`git add server/src/models/QCInspection.js server/src/controllers/qcController.js server/src/services/qcEngine.js client/src/pages/QcLabPage.jsx; git commit -m "feat(qc): implement multi-point testing with instrument calibration guard"`

---

### Task 10: NCR Dispositions & Child Rework (`RT-`) Preserving Original Heat History

**Files:**
- Modify: `server/src/models/NCR.js`
- Modify: `server/src/models/Rework.js`
- Modify: `server/src/controllers/ncrController.js`
- Modify: `server/src/controllers/reworkController.js`
- Modify: `client/src/pages/NcrPage.jsx`

**Interfaces:**
- Consumes: Failed QC Inspection
- Produces: `NCR-YYYY-XXXXXX`, Authorized Disposition, Child Rework record `RT-YYYY-XXXXXX` preserving original Heat history.

- [ ] **Step 1: Auto-generate NCR on QC Failure**
In `qcController.js`: When inspection result is `FAIL`, automatically generate open `NCR-YYYY-XXXXXX` capturing Heat Number, Part, Failure parameter, Root cause, and Defect category.

- [ ] **Step 2: Disposition & Rework Creation in `ncrController.js`**
When disposition is `REWORK` / `RE-TREAT`:
Generate `Rework` record (`RT-YYYY-XXXXXX`) linked to parent `batchId` / `heatNumber`. The parent batch's historical heat logs remain untouched.

- [ ] **Step 3: Update `NcrPage.jsx`**
Render root cause analysis, CAPA entry, management authorization, and 1-click "Issue Re-Treatment Order".

- [ ] **Step 4: Commit changes**
`git add server/src/models/NCR.js server/src/models/Rework.js server/src/controllers/ncrController.js server/src/controllers/reworkController.js client/src/pages/NcrPage.jsx; git commit -m "feat(ncr): implement NCR disposition workflow and non-destructive linked rework"`

---

### Task 11: Official Heat Treatment Certificate (`HTC-YYYY-XXXXXX`) with Dynamic Security QR

**Files:**
- Modify: `server/src/services/pdfService.js`
- Modify: `server/src/controllers/batchController.js`
- Modify: `server/src/controllers/documentController.js`
- Modify: `client/src/pages/CertificatePage.jsx`

**Interfaces:**
- Consumes: QC Passed Heat Number
- Produces: `HTC-YYYY-XXXXXX`, Public Verification Endpoint, High-Resolution PDF Certificate.

- [ ] **Step 1: Hard Business Rule Guard in `batchController.js`**
Block certificate generation if `batch.qcStatus !== 'PASS'`. Return HTTP 400: "Cannot issue certificate for uninspected or failed heat".

- [ ] **Step 2: Public Verification API Endpoint in `documentController.js`**
Implement `GET /api/documents/verify/:certificateNumber`:
Returns verified JSON / view with Heat Number, Customer, Part, Process, Hardness result, and inspection date.

- [ ] **Step 3: Enhance PDF Certificate Generator in `pdfService.js`**
Render MATHEAT logo, official ISO headers, heat-treatment furnace parameters, actual hardness/case depth test readings, authorized signatures, and embedded verification QR code.

- [ ] **Step 4: Enhance `CertificatePage.jsx`**
Provide high-resolution certificate preview, QR code scanner verification link, print stylesheet, and PDF download.

- [ ] **Step 5: Commit changes**
`git add server/src/services/pdfService.js server/src/controllers/batchController.js server/src/controllers/documentController.js client/src/pages/CertificatePage.jsx; git commit -m "feat(certificate): implement secure heat-treatment certificate with QR verification"`

---

### Task 12: Dispatch Delivery Challan (`DC-YYYY-XXXXXX`) & Weighbridge Verification

**Files:**
- Modify: `server/src/models/Invoice.js` (Dispatch Schema)
- Modify: `server/src/controllers/commercialController.js`
- Modify: `client/src/pages/CommercialPage.jsx`

**Interfaces:**
- Consumes: Certified Heat Number
- Produces: `DC-YYYY-XXXXXX`, Delivery Challan PDF/print, Batch status → `READY_FOR_DISPATCH` / `DISPATCHED`.

- [ ] **Step 1: Hard Business Rule Guard in `commercialController.js`**
In `createDispatch`: Verify that linked batch has `qcStatus === 'PASS'` and certificate issued. Block dispatch if QC is pending.

- [ ] **Step 2: Generate Delivery Challan Number (`DC-YYYY-XXXXXX`)**
Capture Vehicle Number, Transporter, LR Number, Gross/Tare/Net weight, Packing type, and gate weighbridge verification.

- [ ] **Step 3: Update `CommercialPage.jsx` Dispatch Register**
Render printable Delivery Challan with MATHEAT header, customer shipping address, heat number, part description, weight, and gate pass.

- [ ] **Step 4: Commit changes**
`git add server/src/models/Invoice.js server/src/controllers/commercialController.js client/src/pages/CommercialPage.jsx; git commit -m "feat(dispatch): implement delivery challan with weighbridge verification"`

---

### Task 13: Auto-Populated Tax Invoice (`INV-YYYY-XXXXXX`) & Payment Ledgers

**Files:**
- Modify: `server/src/models/Invoice.js`
- Modify: `server/src/models/Payment.js`
- Modify: `server/src/controllers/commercialController.js`
- Modify: `server/src/controllers/paymentController.js`
- Modify: `client/src/pages/CommercialPage.jsx`
- Modify: `client/src/components/CreateTaxInvoiceModal.jsx`
- Modify: `client/src/components/TaxInvoiceViewer.jsx`

**Interfaces:**
- Consumes: Completed Dispatch / Job Order
- Produces: `INV-YYYY-XXXXXX` (GST Compliant), Intra-state (CGST 9% + SGST 9%) vs Inter-state (IGST 18%), `PAY-YYYY-XXXXXX`, Outstanding ledgers.

- [ ] **Step 1: Auto-Pull Production Data into Invoice in `commercialController.js`**
When invoicing a dispatch: automatically pull Customer GSTIN, Billing/Shipping addresses, Part name, SAC code `998873`, Net Weight, Quantity, Agreed Job Work Rate, and Heat Number. Zero manual re-typing.

- [ ] **Step 2: Sequential Numbering & GST Calculation**
Implement sequential `INV-YYYY-XXXXXX`. Calculate CGST + SGST for Gujarat (State Code 24) or IGST for inter-state customers.

- [ ] **Step 3: Payment Recording in `paymentController.js`**
Record payment against invoice (`PAY-YYYY-XXXXXX`), updating `amountPaid`, `paymentStatus` (`UNPAID`, `PARTIALLY_PAID`, `PAID`), and updating customer outstanding ledger.

- [ ] **Step 4: Update `CommercialPage.jsx`, `CreateTaxInvoiceModal.jsx` & `TaxInvoiceViewer.jsx`**
Verify invoice creation, 1-page A4 print modal, payment recording modal, and ledger summary.

- [ ] **Step 5: Commit changes**
`git add server/src/models/Invoice.js server/src/models/Payment.js server/src/controllers/commercialController.js server/src/controllers/paymentController.js client/src/pages/CommercialPage.jsx client/src/components/CreateTaxInvoiceModal.jsx client/src/components/TaxInvoiceViewer.jsx; git commit -m "feat(billing): implement automated dispatch invoicing and payment ledgers"`

---

### Task 14: Segregated Customer Inventory & Furnace Maintenance Downtime Tracking

**Files:**
- Modify: `server/src/models/Inventory.js`
- Modify: `server/src/models/Maintenance.js`
- Modify: `server/src/controllers/inventoryController.js`
- Modify: `server/src/controllers/maintenanceController.js`
- Modify: `client/src/pages/InventoryPage.jsx`
- Modify: `client/src/pages/MaintenancePage.jsx`

**Interfaces:**
- Consumes: Inventory transactions, Maintenance logs
- Produces: Segregated Customer-owned stock balance vs MATHEAT consumables; Furnace availability sync.

- [ ] **Step 1: Customer Material Segregation in `Inventory` & `inventoryController.js`**
Enforce `ownership: 'CUSTOMER'` for customer metal, tracked by customer code and heat number. Never merge into MATHEAT consumable valuation.

- [ ] **Step 2: Furnace Maintenance & Status Sync in `maintenanceController.js`**
When maintenance log is created with status `UNDER_MAINTENANCE` or `BREAKDOWN`, automatically update the corresponding `Furnace` record to `MAINTENANCE` or `BREAKDOWN`, removing it from production availability.

- [ ] **Step 3: Update `InventoryPage.jsx` & `MaintenancePage.jsx`**
Render distinct tabs for "Customer Materials" vs "Factory Consumables" in Inventory. Render downtime hours, spare parts, and calibration logs in Maintenance.

- [ ] **Step 4: Commit changes**
`git add server/src/models/Inventory.js server/src/models/Maintenance.js server/src/controllers/inventoryController.js server/src/controllers/maintenanceController.js client/src/pages/InventoryPage.jsx client/src/pages/MaintenancePage.jsx; git commit -m "feat(inventory): segregate customer inventory and link maintenance downtime to furnace state"`

---

### Task 15: Plant Reports Module

**Files:**
- Modify: `server/src/controllers/traceabilityController.js` (or create `server/src/controllers/reportController.js`)
- Modify: `server/src/routes/traceabilityRoutes.js`
- Modify: `client/src/pages/DashboardPage.jsx`

**Interfaces:**
- Consumes: Production, QC, Billing and Maintenance collections
- Produces: Aggregated analytics: Daily Production, Heat-wise tonnage, Furnace Utilization, QC Pass Rate, Rework Rate, Outstanding Billing.

- [ ] **Step 1: Implement Aggregation Endpoints**
Provide endpoints for:
1. Daily / Monthly processed weight (kg).
2. Furnace utilization percentages.
3. First-time QC pass rate vs rework rate.
4. Customer-wise billing and outstanding balances.

- [ ] **Step 2: Update `DashboardPage.jsx`**
Display operational metrics cards, furnace utilization meters, quality KPIs, and quick-filter date ranges.

- [ ] **Step 3: Commit changes**
`git add server/src/controllers/traceabilityController.js server/src/routes/traceabilityRoutes.js client/src/pages/DashboardPage.jsx; git commit -m "feat(reports): implement metallurgical and commercial operational reports"`

---

### Task 16: Interactive Traceability Visual Timeline & Fast Global Search

**Files:**
- Modify: `server/src/services/traceabilityService.js`
- Modify: `server/src/controllers/traceabilityController.js`
- Modify: `client/src/pages/TraceabilityPage.jsx`
- Modify: `client/src/components/Navbar.jsx`

**Interfaces:**
- Consumes: Any Query (`HT-2026-000125`, `JO-2026-000001`, `JC-2026-000125`, `HTC-2026-000125`)
- Produces: Complete end-to-end metallurgical timeline from Customer PO to final payment in 0 clicks.

- [ ] **Step 1: Enhance `traceabilityService.js`**
Query and assemble the complete tree for any search identifier:
Customer → Job Order → MRN → Job Card → Batch → Heat Number → Furnace Cycle & Telemetry → Quench & Temper → QC Readings → NCR/Rework → Certificate → Dispatch → Tax Invoice → Payment.

- [ ] **Step 2: Connect Global Search in `Navbar.jsx`**
Ensure pressing Enter on the top search bar immediately navigates to `TraceabilityPage` with the search query loaded.

- [ ] **Step 3: Update `TraceabilityPage.jsx`**
Render a high-contrast industrial visual timeline node tree with timestamps, operator signatures, sensor graphs, and printable audit trail.

- [ ] **Step 4: Commit changes**
`git add server/src/services/traceabilityService.js server/src/controllers/traceabilityController.js client/src/pages/TraceabilityPage.jsx client/src/components/Navbar.jsx; git commit -m "feat(traceability): complete interactive heat number timeline and global search"`

---

### Task 17: Notification Alert Engine & Live Furnace Board Sync

**Files:**
- Modify: `server/src/models/Notification.js`
- Modify: `server/src/controllers/notificationController.js`
- Modify: `client/src/components/Navbar.jsx`
- Modify: `client/src/pages/FurnacesPage.jsx`

**Interfaces:**
- Consumes: Milestone events (Heat started, Heat completed, QC failed, Calibration due)
- Produces: Notification badges, Live floor status indicators.

- [ ] **Step 1: Trigger Notifications in Controllers**
Trigger alerts when:
1. Calibration is due or overdue.
2. Heat finishes and awaits QC.
3. QC fails and generates NCR.
4. Furnace enters breakdown.

- [ ] **Step 2: Update Notification Dropdown in `Navbar.jsx`**
Render notification counter badge, categorized alert items (Quality, Furnace, Billing), and "Mark as Read".

- [ ] **Step 3: Enhance Live Furnace Board in `FurnacesPage.jsx`**
Display live status indicators (`HEATING`, `SOAKING`, `QUENCHING`, `TEMPERING`, `IDLE`, `MAINTENANCE`) with real-time temperature values.

- [ ] **Step 4: Commit changes**
`git add server/src/models/Notification.js server/src/controllers/notificationController.js client/src/components/Navbar.jsx client/src/pages/FurnacesPage.jsx; git commit -m "feat(alerts): add live industrial alerts and real-time furnace status board"`

---

### Task 18: End-to-End System Verification, Automated Test Runs & Production Build

**Files:**
- Create: `server/tests/erpWorkflow.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: Complete API test suite and Vite build pipeline
- Produces: Verified passing test output and clean production frontend bundle.

- [ ] **Step 1: Write End-to-End Integration Test in `server/tests/erpWorkflow.test.js`**
Automate test verifying the full lifecycle:
1. Create Customer & Part.
2. Create Process Recipe.
3. Create Job Order.
4. Record MRN with accepted material.
5. Issue Job Card.
6. Create Batch & Heat Number.
7. Execute Furnace cycle (Heating, Soaking, Quenching, Tempering) & reconcile mass.
8. Perform QC inspection (PASS).
9. Generate Heat Treatment Certificate.
10. Dispatch with Delivery Challan.
11. Generate Tax Invoice & Record Payment.
12. Verify Traceability tree returns all linked records.

- [ ] **Step 2: Run Backend Tests**
Run `node --test server/tests/erpWorkflow.test.js` to ensure all transitions pass.

- [ ] **Step 3: Run Frontend Production Build**
Run `npm --prefix client run build` to verify zero bundle errors or lint warnings.

- [ ] **Step 4: Final Commit & Summary**
`git add server/tests/erpWorkflow.test.js; git commit -m "test: add comprehensive end-to-end heat-treatment ERP lifecycle test"`
