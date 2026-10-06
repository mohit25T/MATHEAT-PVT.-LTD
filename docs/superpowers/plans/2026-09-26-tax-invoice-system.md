# Tax Invoice System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete, production-grade Tax Invoice system (dynamic multi-item invoice builder modal, automated sequential numbering, state-aware GST calculations, invoice register, and 1-page A4 print modal modeled after Durga Manufactor) in MATHEAT's backend and frontend.

**Architecture:** 
- Backend: Upgrade `server/src/models/Invoice.js` with a comprehensive `items` line items schema, company/customer details, banking info, and GST splits. Expand `server/src/controllers/commercialController.js` and `server/src/routes/commercialRoutes.js` with endpoints for next invoice numbering, full CRUD, search, and filtering while preserving existing dispatch auto-invoicing.
- Frontend Client API: Update `client/src/api/client.js` `commercialApi` with invoice CRUD and next-number methods.
- Frontend UI: 
  1. Create `CreateTaxInvoiceModal.jsx` (modeled after Durga Manufactor's dynamic builder with item catalog/custom items, realtime GST recalculation, customer selector, freight & packaging charges).
  2. Create/enhance `TaxInvoicePrintModal.jsx` (modeled after Durga Manufactor's `InvoicePrintModal.jsx` with strict 1-page A4 print stylesheet, QR code, bank & terms boxes, and WhatsApp 1-click share).
  3. Integrate into `CommercialPage.jsx` with "+ Create Tax Invoice" actions, live invoice register table, and view/print triggers.

**Tech Stack:** React 19, Tailwind CSS, Lucide React, Node.js, Express, Mongoose, QRCode.

---

## Global Constraints
- Maintain complete backward compatibility with existing dispatch auto-invoicing in `commercialController.js`.
- Respect Gujarat vs Inter-state GST rules (Intra-state: CGST 9% + SGST 9%; Inter-state: IGST 18%).
- Strict 1-Page A4 print isolation with zero-margin print styling.
- All invoice tables and item rows must have transparent backgrounds as requested.

---

### Task 1: Backend Model & Schema Upgrade (`server/src/models/Invoice.js`)
- [x] Add `items` line items sub-document schema with fields: `name`, `hsnCode`, `quantity`, `unit`, `unitPrice`, `discountPercent`, `taxableAmount`, `gstRate`, `gstAmount`, `totalAmount`.
- [x] Expand `invoiceSchema` with customer fields (`customerName`, `companyName`, `phone`, `email`, `gstNumber`, `billingAddress`, `shippingAddress`, `city`, `state`, `pincode`), `transport` details, `freightCharges`, `packagingCharges`, `isInterstate`, `cgstAmount`, `sgstAmount`, `igstAmount`, `totalGst`, `grandTotal`, `amountInWords`, `bankDetails`, `notes`, and `status`.
- [x] Retain legacy fields (`dispatch`, `batchId`, `partNumber`, `heatNumber`, `billedQuantity`, `billedWeightKg`, `unitRate`) with optional validation so existing code does not break.

### Task 2: Backend Controller & Routes (`server/src/controllers/commercialController.js` & `server/src/routes/commercialRoutes.js`)
- [x] Implement `getNextInvoiceNumber`: calculate next sequential invoice number formatted as `INV-YYYY-XXXX`.
- [x] Implement `createInvoice`: validate incoming items, sanitize ObjectIds, compute/verify totals, save to DB, log audit.
- [x] Implement `getInvoiceById`, `updateInvoice`, and `deleteInvoice`.
- [x] Mount routes in `server/src/routes/commercialRoutes.js`:
  - `GET /invoices/next-number`
  - `GET /invoices`
  - `GET /invoices/:id`
  - `POST /invoices`
  - `PUT /invoices/:id`
  - `DELETE /invoices/:id`

### Task 3: Client API Service Update (`client/src/api/client.js`)
- [x] Add `getNextInvoiceNumber`, `createInvoice`, `getInvoiceById`, `updateInvoice`, `deleteInvoice` to `commercialApi`.

### Task 4: Shared Number to Words Utility (`client/src/utils/numberToWords.js`)
- [x] Create `numberToWords.js` supporting Indian numbering system (Lakhs, Crores, Thousands, Paise).

### Task 5: Dynamic Tax Invoice Creation Modal (`client/src/components/CreateTaxInvoiceModal.jsx`)
- [x] Build modal with customer selector (from existing customers or custom one-off entry).
- [x] Dynamic line items table with add/remove rows, description, HSN code, quantity, unit, rate, discount, GST %.
- [x] Real-time calculation hook `recalculateTotals` (taxable amount, GST amount, freight, packaging, CGST/SGST/IGST, grand total, amount in words).
- [x] Pre-populate MATHEAT bank details & payment terms.
- [x] Form submission handling with API integration and auto-refresh callback.

### Task 6: Dedicated A4 Tax Invoice Print Modal (`client/src/components/TaxInvoicePrintModal.jsx`)
- [x] Build modal modeled on Durga Manufactor's `InvoicePrintModal.jsx`.
- [x] Enforce strict 1-page A4 CSS print media query (`210mm x 297mm`, `margin: 0`).
- [x] Render MATHEAT official header with GSTIN, PAN, CIN, factory address.
- [x] Render side-by-side Billed To & Shipped To cards.
- [x] Render Line Items table with transparent rows and bold borders.
- [x] Render 2-tier summary: Tier 1 (Amount in words + financial breakdown), Tier 2 (GST & Bank details + Terms & Conditions).
- [x] Render Authorized Signatory section.
- [x] Include GST QR Code and 1-click WhatsApp share button.

### Task 7: Integrate into `CommercialPage.jsx` & Update Print Styles
- [x] Add "+ Create Tax Invoice" button in `CommercialPage.jsx` header and Invoice Register subtab.
- [x] Update Invoice Register table to display all created invoices with actions: View/Print, WhatsApp Share, and Delete.
- [x] Connect `CreateTaxInvoiceModal` and `TaxInvoicePrintModal` state.
- [x] Verify print styles in `client/src/index.css`.
- [x] Verify functionality and test end-to-end.
