# MATHEAT PVT. LTD. — Industrial Heat-Treatment ERP System Specification

**Document Version:** 1.0.0  
**Target Date:** 2026-10-06  
**System Name:** MATHEAT Heat-Treatment Operations & Manufacturing Execution System (ERP + MES)  
**Classification:** Architectural System Design  

---

## 1. Executive Summary & Core Principle

MATHEAT PVT. LTD. operates an industrial commercial heat-treatment plant delivering specialized metallurgical processes (Carburizing, Quenching & Tempering, Case Hardening, Annealing, Normalizing, Stress Relieving, Induction Hardening) on job-work customer materials.

### The Central Law of MATHEAT ERP: The Heat Number
The system is **NOT** centered around the sales invoice. It is centered around the **Heat Number (`HT-YYYY-XXXXXX`)**.
The Heat Number is the immutable, non-reusable production traceability key connecting:
```
CUSTOMER
  └── ENQUIRY / QUOTATION
        └── JOB ORDER
              └── MATERIAL RECEIPT NOTE (MRN) & INCOMING QC
                    └── JOB CARD (JC) & QR TRAVELER
                          └── BATCH (BAT)
                                └── HEAT NUMBER (HT) ── [FURNACE F-XX]
                                      ├── PROCESS PARAMETERS (Approved Spec)
                                      ├── OPERATOR & LOGS (Load, Heat, Soak, Quench, Temper)
                                      ├── RECONCILIATION (Input = Output + Scrap + Process Loss)
                                      ├── QC LAB INSPECTION (NABL Calibrated Instruments)
                                      ├── NCR / RE-TREATMENT (RT) [Preserves Parent History]
                                      ├── HEAT TREATMENT CERTIFICATE (HTC + Secure QR)
                                      └── DISPATCH (DC) & WEIGHBRIDGE
                                            └── TAX INVOICE (INV)
                                                  └── PAYMENT & LEDGER
```

Every historical, metallurgical, and commercial question can be answered in **0 clicks** from any Heat Number.

---

## 2. User Roles & Access Control (RBAC)

The system enforces 8 distinct operational roles across backend API authorization (`authorizeRoles`) and frontend route guards (`canAccess`):

1. **`SUPER_ADMIN`**: Full administrative authority. Manages users, permissions, system configuration, audit logs, and data purge utilities.
2. **`ADMIN` / Management**: Access to executive dashboards, customer master, job orders, furnace planning, QC lab, dispatches, invoices, and analytical reports. Cannot mutate core schema configuration without super-admin elevation.
3. **`SALES` / Office**: Customer master, enquiries, quotations, job orders, material inward monitoring, tax invoices, and payment follow-ups.
4. **`PRODUCTION_MANAGER`**: Job orders, job card issuance, batch creation, heat scheduling, furnace capacity & calibration planning, process parameter oversight, and live plant-floor monitoring.
5. **`FURNACE_OPERATOR`**: Dedicated, high-contrast, glove-friendly operator console. Can only view assigned furnace and assigned heat, log loading weights, monitor actual temps, log soaking, trigger quench transfer, log tempering, and submit output weights. **STRICT LOCKOUT**: Operators cannot alter approved recipe specifications.
6. **`QC_QUALITY`**: Incoming raw material inspection, in-process hardness, case depth, microhardness traverse, metallography, final QC approval, NCR issuance, rework authorization, and TC generation. Instrument calibration lockout is strictly enforced.
7. **`STORE_DISPATCH`**: Material inward (MRN), weighbridge camera captures, gate security, segregated customer material storage, finished goods storage, dispatch delivery challans, and transport logistics.
8. **`ACCOUNTS`**: Tax invoice generation (auto-pulled from completed dispatches), GST breakdown (CGST/SGST/IGST), payment receipts, bank reconciliation, outstanding tracking, and customer ledgers.

---

## 3. Master Data Architecture

### 3.1 Customer Master (`Customer.js`)
* `customerCode` (e.g. `CUS-000001`, sequential unique index)
* `companyName`, `tradeName`, `name` (contact person)
* `phone`, `email`
* `billingAddress` (Street, City, State, Pincode)
* `shippingAddress` / `addresses` (Multiple plant/warehouse shipping locations)
* `gstin` (15-character uppercase with automated state code extraction)
* `pan` (10-character uppercase)
* `state`, `stateCode`
* `paymentTerms` (e.g. `30 Days Net`, `Immediate`, `Letter of Credit`)
* `creditLimit` (₹)
* `customerType` (`JOB_WORK`, `OEM`, `TIER_1`, `REGULAR`, `EXPORT`)
* `isActive` (Boolean)

### 3.2 Component / Part Master (`Part.js`)
* `partNumber` (e.g. `PRT-GR-20MNCR5-01`, unique index)
* `partName` (e.g. `Helical Pinion Shaft 14T`)
* `customer` (ObjectId ref `Customer`)
* `drawingNumber` (e.g. `DWG-7742-B`), `revision` (`R0`, `R1`, `R2`)
* `materialGrade` (`20MnCr5`, `EN31`, `SAE 8620`, `42CrMo4`, `EN8`, `EN19`, `SCM420`)
* `standard` (`IS 5517`, `ASTM A29`, `DIN 17210`, `JIS G4053`)
* `componentType` (`Gear`, `Shaft`, `Bearing Ring`, `Pinion`, `Flange`, `Fastener`)
* `weightPerPiece` (kg)
* `dimensions` (`outerDiameter`, `innerDiameter`, `length`, `thickness`, `description`)
* `surfaceArea` (sq mm, for carburizing gas consumption estimation)
* `criticalDimensions` (tolerances before and after heat treatment)
* `existingHardness` (raw incoming state, e.g. `180–220 HB`)
* `requiredHardness` (e.g. `58–62 HRC` or `700–800 HV`)
* `requiredCaseDepth` (e.g. `0.80–1.10 mm` @ 50 HRC / 550 HV cutoff)
* `requiredProcess` (Process Master ref or name)
* `specialInstructions` (e.g. `Selective Carburizing with Copper Plating`, `No Decarb permitted`)
* `attachments` (Array of objects: `{ name, fileUrl, type, uploadedAt }` for Drawings, Specs, Photos)
* `isActive` (Boolean)

### 3.3 Heat-Treatment Process Master & Recipe Engine (`ProcessMaster.js` & `Recipe.js`)
* **Standard Processes**:
  * Carburizing + Hardening + Tempering (SQF)
  * Direct Hardening + Tempering
  * Carbonitriding
  * Case Hardening
  * Isothermal Annealing / Spheroidize Annealing
  * Normalizing
  * Stress Relieving
  * Induction Hardening
* **Process Parameters**:
  * `heating`: Target Temp (°C), Temp Tolerance (±°C), Heating Rate (°C/hr), Atmosphere Gas (Endothermic Gas / Nitrogen / LPG), Carbon Potential (% CP, e.g. 0.85–1.05%).
  * `soaking`: Target Soak Time (minutes), Soak Temp Tolerance, Lockout enforcement.
  * `quenching`: Quench Medium (`OIL`, `WATER`, `POLYMER`, `SALT`), Oil Type (`Fast Quench Oil ISO 32`), Quench Temp (°C, e.g. 60–80°C), Quench Duration (minutes), Agitation (`LOW`, `HIGH`), **Target Door-to-Quench Transfer Time** (seconds, e.g. ≤ 15s).
  * `tempering`: Furnace ID, Target Temp (°C), Tolerance, Soak Time (minutes), Cooling Method (`Still Air`, `Forced Air`).
  * `qcLimits`: Surface Hardness (Min/Max HRC), Core Hardness (Min/Max HRC), Effective Case Depth (Min/Max mm), Retained Austenite (% Max), Distortion Limit (mm).
* **Immutability & Revision History**:
  * Once a Process Recipe is approved (`isApproved = true`), it cannot be directly altered during an active Job Order.
  * Any metallurgical modification triggers a new version (`V1` → `V2`) with mandatory change reason and metallurgical approval signature.

### 3.4 Furnace Master (`Furnace.js`)
* `furnaceId` (e.g. `F-01`, `F-02`, `F-03`, `F-04`, unique)
* `name` (e.g. `Sealed Quench Furnace SQF-1 (600 kg)`)
* `type` (`SEALED_QUENCH_FURNACE`, `PIT_CARBURIZING`, `TEMPERING_OVEN`, `BOGIE_HEARTH`, `INDUCTION`)
* `manufacturer`, `model`, `serialNumber`
* `capacityKg` (Maximum safe batch weight in kg)
* `maxTemperature` (°C, e.g. 1050°C)
* `workingTempRange` (`min`: 750°C, `max`: 950°C)
* `heatingType` (`Electric Radiant Tubes`, `Gas-Fired Recuperative Burners`)
* `atmosphereCapability` (`Endogas + Methanol + Hydrocarbon Enriching`)
* `quenchTank` (`quenchMedium`, `capacityLiters`, `coolingSystem`, `agitationSpeed`)
* `calibrationStatus` (`VALID`, `EXPIRING_SOON`, `EXPIRED`)
* `lastCalibrationDate`, `nextCalibrationDue`
* `maintenanceStatus` (`HEALTHY`, `DUE_FOR_PM`, `UNDER_BREAKDOWN`, `UNDER_MAINTENANCE`)
* `currentStatus` (`IDLE`, `LOADING`, `HEATING`, `SOAKING`, `QUENCHING`, `TEMPERING`, `COOLING`, `QC_PENDING`, `MAINTENANCE`)
* `currentBatch` (ObjectId ref `Batch`), `currentBatchId`, `loadedWeightKg`

### 3.5 QC Instrument Master (`QCInstrument.js`)
* `instrumentId` (e.g. `INST-RC-01`, `INST-MIC-01`, `INST-WB-01`)
* `instrumentName` (Rockwell Hardness Tester, Microhardness Tester, Digital Pyrometer, Weighbridge Load Cells)
* `type` (`HARDNESS_TESTER`, `TEMPERATURE_SENSOR`, `THERMOCOUPLE`, `WEIGHING_SCALE`, `MICROSCOPE`, `DIMENSIONAL_GAUGE`)
* `manufacturer`, `model`, `serialNumber`
* `calibrationDate`, `calibrationDueDate`
* `calibrationAgency` (NABL Accredited Laboratory)
* `calibrationCertificateNumber`
* `status` (`ACTIVE`, `CALIBRATION_DUE`, `CALIBRATION_OVERDUE`, `OUT_OF_SERVICE`)
* **Validation Guard**: Disallows selection of `CALIBRATION_OVERDUE` instruments during QC sign-off without plant manager concession.

---

## 4. Operational Workflow & Strict State Machine

### 4.1 Sales Pipeline: Enquiry → Quotation → Job Order
* **Enquiry (`ENQ-YYYY-XXXXXX`)**:
  * Captures Customer, Part, Quantity, Weight, Material Grade, Required Process, Hardness & Case Depth specs, Delivery deadline.
  * Status: `DRAFT` → `SUBMITTED` → `REVIEW` → `QUOTED` → `WON` / `LOST`.
* **Quotation (`QT-YYYY-XXXXXX`)**:
  * Pulls from Enquiry. Details Process, Quantity, Rate Type (`PER_KG`, `PER_PIECE`, `FIXED_LOT`), Base Rate, Minimum Lot Charge, Setup Charge, Testing Charge, Packing, Transport, GST (18%).
  * Status: `DRAFT` → `SENT` → `ACCEPTED` → `REJECTED` → `EXPIRED`.
  * **Action**: On `ACCEPTED`, generates or links to a **Job Order**.

### 4.2 Job Order (`JO-YYYY-XXXXXX`)
* Central commercial production order.
* Status State Machine:
  ```
  DRAFT → CONFIRMED → MATERIAL_PENDING → MATERIAL_RECEIVED → READY_FOR_PRODUCTION → IN_PRODUCTION → QC → READY_FOR_DISPATCH → DISPATCHED → COMPLETED
  ```
* Validates customer PO, drawing revision, agreed process revision, and target delivery date.

### 4.3 Material Receiving Note (MRN / GRN) & Gate Entry
* Created upon physical receipt of customer metal at factory gate / weighbridge.
* Numbering: `MRN-YYYY-XXXXXX` (or `GRN-YYYY-XXXXXX`).
* Fields: Customer, Job Order, Part, Vehicle Number, Transporter, Customer Challan Number & Date, Package Count, Gross Weight, Tare Weight, Net Weight, Received By, Photo proofs (Weighbridge scale snapshot, live load image).
* **Material Condition Assessment**:
  * Options: `GOOD`, `DAMAGED`, `SHORT`, `EXCESS`, `RUSTED`, `MIXED`, `UNKNOWN`.
* **Ownership Segregation**: Tagged as `CUSTOMER_OWNED`. Never co-mingled with MATHEAT inventory accounting.

### 4.4 Incoming Quality Verification
* QC inspection conducted on raw incoming material prior to staging:
  * Verifies Part Number, physical count, weight check vs challan, visual rust/crack check, MTC chemistry check, and incoming hardness check.
  * Inspection Result: `ACCEPTED`, `PARTIALLY_ACCEPTED`, `REJECTED`, `HOLD`.
  * **Hard Business Rule**: Material marked `REJECTED` or `HOLD` cannot be issued to production.

### 4.5 Job Card Traveler (`JC-YYYY-XXXXXX`)
* Generated automatically once incoming material is `ACCEPTED`.
* Displays Customer, Job Order, Part, Material, Quantity, Net Weight, Process Code, Process Revision, Target Hardness, Target Case Depth, Priority, Delivery Date.
* Contains a high-resolution **QR Code / Barcode**: Scanning immediately displays the full live Job Traveler and metallurgical specification on any mobile or tablet terminal.

### 4.6 Batching & Heat Planning
* Large job orders are split into furnace batches (e.g. 5,000 pcs split into five 1,000 pc batches `BAT-YYYY-XXXXXX`).
* **Heat Planning Validation Engine**:
  1. **Capacity Check**: `Batch Input Weight (kg) <= Furnace Rated Capacity (kg)` (Warns if overloaded).
  2. **Capability Check**: Does the planned process temperature and atmosphere match furnace limits?
  3. **Furnace Availability**: Furnace must be `IDLE` (not `MAINTENANCE` or `BREAKDOWN`).
  4. **Calibration Validity**: Furnace thermocouples and instruments must have valid calibration.
  5. **Quench Medium**: Quench tank oil/medium must match recipe requirements.

### 4.7 Production Execution & Operator Console
* **Glove-Friendly Touch Interface**:
  * Minimalist layout designed for dirty hands / mobile / rugged shop-floor tablets.
  * Large digital status banners: Current Furnace, Heat Number (`HT-YYYY-XXXXXX`), Job Card Number, Part, Target Temperature, Target Soak Time.
* **Phase Progressions**:
  1. **Loading Phase**: Log Actual Loaded Weight (kg), Component Count, Basket ID, Loading Operator, optional basket photo. Status → `LOADING`.
  2. **Heating Phase**: Target Temp vs Actual Temp. Heating rate monitor. Atmosphere generator on. Status → `HEATING`.
  3. **Soaking Phase**: Begins when furnace reaches setpoint temperature. Auto-countdown timer. **LOCKOUT RULE**: Operator cannot mark cycle complete before target soak time expires without supervisor authorization override. Status → `SOAKING`.
  4. **Quenching Phase**: Furnace door opens, basket transferred to quench tank. **Automatic Calculation of Door-to-Quench Transfer Time (seconds)**. Logs Quench Medium, Quench Temp, Quench Duration, Agitation. Status → `QUENCHING`.
  5. **Tempering Phase**: Secondary furnace assignment (`F-03`). Target Tempering Temp (°C), Actual Temp, Soak Duration, Cooling Method. Status → `TEMPERING` → `COOLING`.
* **Production Reconciliation & Conservation of Mass**:
  * At cycle completion, operator/supervisor logs:
    * Input Weight (kg)
    * Output Weight (kg)
    * Rejected Weight (kg)
    * Scrap Weight (kg)
    * Accepted Quantity (pcs)
    * Rejected Quantity (pcs)
  * **Validation Formula**:
    $$\text{Output Weight} + \text{Scrap Weight} + \text{Process Loss} = \text{Input Weight} \quad (\pm \text{configured tolerance, e.g. 1\%})$$
  * Impossible counts (e.g. Output > Input) are rejected by server validation.

---

## 5. Quality Assurance, NCR, Rework & Certification

### 5.1 Quality Control Inspection (`QCInspection.js`)
* Triggered automatically when Heat cycle finishes and moves to `QC_PENDING`.
* **Testing Suite**:
  1. **Hardness Testing**: Surface Hardness readings (multi-point samples across hub, flange, tooth), Rockwell HRC / Vickers HV scale, Core Hardness readings, Average calculations vs specification tolerance.
  2. **Case Depth Testing**: Effective Case Depth (ECD @ 50 HRC / 550 HV cutoff), Total Case Depth (TCD), testing method (Microhardness Traverse).
  3. **Metallography & Microstructure**: Microstructure observed (e.g. *Tempered Martensite with fine uniformly dispersed carbides*), ASTM Grain Size (e.g. *ASTM 7–8*), Retained Austenite (% max), Decarburization depth (0 mm).
  4. **Dimensional & Visual**: Distortion check, runout check, surface finish, crack detection (MPI / Dye Penetrant).
  5. **Instrument Linkage**: Inspector selects calibrated instrument IDs (`INST-RC-01`, etc.).
* **Result**: `PASS`, `FAIL`, or `HOLD`.
* Once approved by QC Inspector / Metallurgist, the record is locked permanently.

### 5.2 Non-Conformance Management (NCR)
* If any test fails, system generates `NCR-YYYY-XXXXX`.
* Logs Heat Number, Job Order, Customer, Part, Defect Category, Failure Parameter, Specified vs Actual, Root Cause Analysis, Corrective & Preventive Action (CAPA).
* **Dispositions**: `REWORK / RE-TREAT`, `SORTING`, `SCRAP`, `CUSTOMER_CONCESSION`, `USE_AS_IS`.
* Requires management / metallurgist authorization before closure.

### 5.3 Rework / Re-Treatment Cycle (`Rework.js`)
* **Strict Traceability Rule**: The original Heat Number (`HT-2026-000125`) history is **NEVER** overwritten.
* Creates a child linked rework record: `RT-YYYY-XXXXXX` (or `HT-2026-000125-R01`).
* Specifies rework parameters (e.g. *Re-temper at 220°C for 90 mins* or *Re-quench*), assigns furnace, records re-treatment cycle, and routes back to QC.

### 5.4 Heat-Treatment Certificate (`HTC-YYYY-XXXXXX`)
* Generated **ONLY** after QC status is `PASS`.
* Standard format incorporating:
  * Official MATHEAT header, ISO/IEC certification badges, plant address.
  * Customer Name, PO Number, Delivery Challan Number.
  * Job Order Number, Job Card Number, Batch ID, Heat Number.
  * Part Number, Part Name, Material Grade, Drawing Number & Revision.
  * Process Name, Heating Temp, Soaking Time, Quench Medium, Quench Temp, Tempering Temp, Tempering Time.
  * Inspection Readings: Surface Hardness, Core Hardness, Case Depth, Microstructure, Visual.
  * Inspector Name, Metallurgist Signature, Authorized Signatory.
  * **Dynamic Security QR Code**: Scanning the QR opens a public certificate verification page verifying authenticity against MATHEAT's live database.

---

## 6. Commercial, Dispatch, Invoicing & Payments

### 6.1 Dispatch & Delivery Challan (`DC-YYYY-XXXXXX`)
* Ready for dispatch only after Certificate is generated and approved.
* Records: Customer, Job Order, Heat Number, Dispatch Quantity, Net Weight, Packing Type, Transporter Name, Vehicle Number, LR Number, E-Way Bill Number.
* Weighbridge gross/tare/net weight verification with gate camera image capture.
* Generates official printable **Delivery Challan (DC)**.

### 6.2 Tax Invoice (`INV-YYYY-XXXXXX`)
* Auto-generated from completed dispatches / job orders.
* **Zero Manual Re-Entry**: Automatically pulls Customer GSTIN, Billing/Shipping addresses, Part description, Heat-treatment SAC code (`998873` / `9988`), Process, Quantity, Net Weight, Agreed Rate, Testing charges, Freight, and Packaging.
* **GST Calculation**:
  * Intra-state (Gujarat): CGST 9% + SGST 9%.
  * Inter-state: IGST 18%.
* Status: `DRAFT` → `APPROVED` → `ISSUED` → `PARTIALLY_PAID` → `PAID` → `OVERDUE`.
* Strict 1-Page A4 high-contrast print layout with GST QR code and banking details.

### 6.3 Payment Recording & Ledgers (`PAY-YYYY-XXXXXX`)
* Records Invoice Number, Customer, Amount Received, Payment Date, Payment Mode (`NEFT`, `RTGS`, `CHEQUE`, `UPI`), Transaction Reference Number, Bank Name.
* Real-time ledger computation: Total Invoiced, Amount Collected, Outstanding Balance, Overdue Ageing.

---

## 7. Plant Management, Segregated Inventory & Maintenance

### 7.1 Segregated Inventory System
* **Customer-Owned Material**: Tracked by Weight (kg) and Pieces (pcs) per Customer and Heat Number. Explicitly flagged as non-company assets.
* **Company Consumables**:
  * Quenchant (Quench Oil ISO 32, Polymer Quenchant)
  * Industrial Gases (LPG, Propane, Methanol, Nitrogen)
  * Furnace Spares (Heating elements, Radiant tubes, Thermocouples, Ceramic fibers)
  * Packing Material (Anti-rust VCI paper, Wooden crates, Pallets)
* Tracks Opening, Receipts (Purchase Orders), Floor Consumption, Adjustments, and Closing balance.

### 7.2 Furnace Maintenance & Downtime Tracking (`Maintenance.js`)
* Maintenance Types: `PREVENTIVE`, `BREAKDOWN`, `CALIBRATION`, `INSPECTION`.
* Records Furnace ID, Issue Description, Downtime Hours, Technician, Spare Parts Consumed, Resolution Notes, and Next Scheduled PM Date.
* **Automatic Status Sync**: Marking a furnace as `UNDER_MAINTENANCE` or `BREAKDOWN` immediately prevents production planners from scheduling new heats into that furnace.

### 7.3 NABL Instrument Calibration Tracking
* Tracks calibration status and due dates across all plant sensors, pyrometers, hardness testers, and weighbridges.
* Automated dashboard alerts for `CALIBRATION_DUE` (≤ 15 days) and `CALIBRATION_OVERDUE`.

---

## 8. Dashboards, Traceability Timeline & Global Search

### 8.1 Management Operations Dashboard
* Real-time metrics: Today's Active Heats, Furnaces Running vs Idle, Material Pending Processing, QC Pending, Today's Dispatches, Today's Invoicing, Outstanding Payments.
* System Alert Strip: Calibration Due Warnings, Maintenance Overdue, QC Failures / Open NCRs.

### 8.2 Live Furnace Status Board
* High-visibility color-coded matrix of all furnaces:
  * `F-01` [🔥 HEATING] — Heat: `HT-2026-000125` | Temp: `842°C` / `860°C` | Batch: 850 kg
  * `F-02` [🟢 IDLE] — Available for planning
  * `F-03` [🔥 TEMPERING] — Temp: `180°C` | Soak: 45 / 120 mins
  * `F-04` [⚠️ MAINTENANCE] — Thermocouple replacement

### 8.3 Central Heat Traceability View
* Interactive visual node timeline showing the entire lifecycle of any component by entering:
  * Heat Number (`HT-2026-000125`), Job Order (`JO-2026-000001`), Job Card (`JC-2026-000125`), or Certificate (`HTC-2026-000125`).
* Shows chronological milestones with exact timestamps, operator names, sensor curves, QC hardness values, and invoice status.

---

## 9. Verification & Quality Gates

1. **Schema Integrity**: Mongoose models validate required fields and enforce unique indices.
2. **Business Rule Gates**:
   * Block Heat start without valid Job Card.
   * Block Job Card issue without accepted MRN.
   * Block Furnace scheduling if under maintenance or calibration expired.
   * Block Operator alteration of approved recipe targets.
   * Block Certificate generation without QC `PASS`.
   * Block Dispatch without approved Certificate.
   * Block production close if weight conservation fails (`Output + Scrap + Loss != Input`).
3. **Build & Performance**: Client builds cleanly with zero errors (`npm run build`). Fast cache hydration (0ms) ensures responsive performance on factory floor tablets.
