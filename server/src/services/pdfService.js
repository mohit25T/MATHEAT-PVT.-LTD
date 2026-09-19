import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.resolve(__dirname, '../../assets/matheat_logo.jpg');
const logoPngPath = path.resolve(__dirname, '../../assets/matheat_logo.png');
const furnaceImgPath = path.resolve(__dirname, '../../assets/furnace_banner.jpg');

/**
 * Renders the semi-transparent company watermark in the true center of the single-page invoice
 */
const renderWatermark = (doc) => {
  const activeLogo = fs.existsSync(logoPngPath) ? logoPngPath : logoPath;
  if (fs.existsSync(activeLogo)) {
    doc.save();
    doc.opacity(0.08); // Subtle, professional watermark opacity
    // True center of A4 (width: 595, height: 842)
    doc.image(activeLogo, 107, 240, { width: 380, align: 'center' });
    doc.restore();
    // Reset cursor to prevent PDFKit auto-page-break
    doc.x = 24;
    doc.y = 20;
  }
};

/**
 * Generates Dedicated All-Parameter Heat Treatment Certificate PDF
 */
export const generateCertificatePdf = async (data, res) => {
  const doc = new PDFDocument({ margin: 36, size: 'A4', bufferPages: true });

  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="HT-Certificate-${data.batchId || 'BATCH'}.pdf"`);
  }
  if (res) {
    doc.pipe(res);
  }

  // Generate QR Code for digital traceability verification
  const qrDataUrl = await QRCode.toDataURL(
    `MATHEAT-CERT|BATCH:${data.batchId}|HEAT:${data.heatNumber}|PART:${data.partNumber}|STATUS:PASS`
  );

  // Background Watermark
  renderWatermark(doc);

  // Header Section
  const activeLogo = fs.existsSync(logoPngPath) ? logoPngPath : logoPath;
  if (fs.existsSync(activeLogo)) {
    doc.image(activeLogo, 36, 24, { width: 140 });
  }

  doc.fillColor('#0b192c').fontSize(16).font('Helvetica-Bold').text('MATHEAT PVT. LTD.', 180, 26);
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#ff5500').text('INDUSTRIAL HEAT TREATMENT SPECIALISTS', 180, 44);
  doc.fontSize(8).font('Helvetica').fillColor('#475569')
    .text('Plot No. 42-45, Industrial Area Phase II, Aurangabad - 431001, Maharashtra, India', 180, 56)
    .text('Tel: +91 (240) 255-8900 | Email: qc@matheat.com | Web: www.matheat.com', 180, 68)
    .text('An ISO 9001:2015 & IATF 16949 Certified Heat Treatment Facility', 180, 80);

  // Certificate Badge Box
  doc.rect(430, 24, 145, 66).fillAndStroke('#f8fafc', '#cbd5e1');
  doc.fillColor('#0f2b5c').fontSize(9).font('Helvetica-Bold').text('CERTIFICATE NO.', 436, 30);
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#dc2626').text(data.certificateNumber || `HTC-${data.batchId}`, 436, 42);
  doc.fontSize(8).font('Helvetica').fillColor('#334155').text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 436, 56);
  doc.text(`Batch ID: ${data.batchId}`, 436, 68);
  doc.text(`QR Traceability: ACTIVE`, 436, 80);

  doc.moveTo(36, 98).lineTo(575, 98).strokeColor('#0f2b5c').lineWidth(1.5).stroke();

  // Document Title
  doc.rect(36, 104, 539, 20).fill('#0b192c');
  doc.fillColor('#ffffff').fontSize(10.5).font('Helvetica-Bold').text('HEAT TREATMENT INSPECTION & TEST CERTIFICATE', 40, 109, { align: 'center' });

  let y = 132;

  // SECTION 1: CUSTOMER & PART SPECIFICATIONS
  doc.rect(36, y, 539, 16).fill('#e2e8f0');
  doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text('1. CUSTOMER & COMPONENT SPECIFICATIONS', 42, y + 4);
  y += 20;

  const col1 = 40, col2 = 130, col3 = 310, col4 = 410;
  doc.fontSize(8).font('Helvetica');

  doc.font('Helvetica-Bold').fillColor('#334155').text('Customer Name:', col1, y);
  doc.font('Helvetica').fillColor('#000000').text(data.customerName || 'N/A', col2, y);
  doc.font('Helvetica-Bold').fillColor('#334155').text('Customer PO No:', col3, y);
  doc.font('Helvetica').fillColor('#000000').text(data.customerPoNumber || 'N/A', col4, y);
  y += 14;

  doc.font('Helvetica-Bold').fillColor('#334155').text('Part Number:', col1, y);
  doc.font('Helvetica-Bold').fillColor('#0b192c').text(data.partNumber || 'N/A', col2, y);
  doc.font('Helvetica-Bold').fillColor('#334155').text('Job Order No:', col3, y);
  doc.font('Helvetica').fillColor('#000000').text(data.jobOrderNumber || 'N/A', col4, y);
  y += 14;

  doc.font('Helvetica-Bold').fillColor('#334155').text('Part Description:', col1, y);
  doc.font('Helvetica').fillColor('#000000').text(data.partName || 'N/A', col2, y);
  doc.font('Helvetica-Bold').fillColor('#334155').text('Drawing & Rev:', col3, y);
  doc.font('Helvetica').fillColor('#000000').text(`${data.drawingNumber || 'DWG-6205'} (Rev ${data.revision || 'R0'})`, col4, y);
  y += 14;

  doc.font('Helvetica-Bold').fillColor('#334155').text('Quantity & Weight:', col1, y);
  doc.font('Helvetica').fillColor('#000000').text(`${data.quantity || 0} Pcs | ${data.weightKg || 0} Kg`, col2, y);
  doc.font('Helvetica-Bold').fillColor('#334155').text('Dimensions (mm):', col3, y);
  doc.font('Helvetica').fillColor('#000000').text(data.dimensionsText || 'OD: 52 mm, ID: 25 mm, W: 15 mm', col4, y);
  y += 20;

  // SECTION 2: RAW MATERIAL & CHEMICAL COMPOSITION
  doc.rect(36, y, 539, 16).fill('#e2e8f0');
  doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text('2. RAW MATERIAL & CHEMICAL COMPOSITION (MTC VERIFIED)', 42, y + 4);
  y += 20;

  doc.font('Helvetica-Bold').fillColor('#334155').text('Material Grade:', col1, y);
  doc.font('Helvetica-Bold').fillColor('#0f2b5c').text(data.materialGrade || 'EN31 / 100Cr6', col2, y);
  doc.font('Helvetica-Bold').fillColor('#334155').text('Raw Heat Number:', col3, y);
  doc.font('Helvetica-Bold').fillColor('#b91c1c').text(data.heatNumber || 'H-45872', col4, y);
  y += 14;

  doc.font('Helvetica-Bold').fillColor('#334155').text('Specification Standard:', col1, y);
  doc.font('Helvetica').fillColor('#000000').text(data.standard || 'IS 5517 / DIN 17230', col2, y);
  doc.font('Helvetica-Bold').fillColor('#334155').text('Cast / Coil No:', col3, y);
  doc.font('Helvetica').fillColor('#000000').text(data.castNumber || 'C-9021-B', col4, y);
  y += 18;

  // Chemistry Table
  const chemCols = [
    { label: '% C', val: data.chemistry?.c || 0.98 },
    { label: '% Mn', val: data.chemistry?.mn || 0.45 },
    { label: '% Si', val: data.chemistry?.si || 0.25 },
    { label: '% Cr', val: data.chemistry?.cr || 1.42 },
    { label: '% Ni', val: data.chemistry?.ni || 0.12 },
    { label: '% Mo', val: data.chemistry?.mo || 0.04 },
    { label: '% S', val: data.chemistry?.s || 0.015 },
    { label: '% P', val: data.chemistry?.p || 0.018 }
  ];

  doc.rect(36, y, 539, 28).stroke('#cbd5e1');
  doc.rect(36, y, 539, 14).fill('#f1f5f9');
  let chemX = 36;
  chemCols.forEach(col => {
    doc.fillColor('#334155').fontSize(7.5).font('Helvetica-Bold').text(col.label, chemX, y + 3, { width: 67, align: 'center' });
    doc.fillColor('#0f172a').fontSize(8).font('Helvetica').text(col.val.toFixed(3), chemX, y + 17, { width: 67, align: 'center' });
    chemX += 67.37;
  });

  y += 34;

  // SECTION 3: HEAT TREATMENT PROCESS EXECUTION
  doc.rect(36, y, 539, 16).fill('#e2e8f0');
  doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text('3. HEAT TREATMENT PROCESS CYCLE & PARAMETERS', 42, y + 4);
  y += 20;

  const cycleParams = [
    ['Hardening Temperature', `${data.cycle?.targetHardeningTemp || 850} °C`, `${data.cycle?.actualHardeningTemp || 852} °C`, '± 5 °C (Pass)'],
    ['Soaking Duration', `${data.cycle?.targetHardeningSoak || 90} Mins`, `${data.cycle?.actualHardeningSoak || 92} Mins`, 'Verified Complete'],
    ['Atmosphere / CP', data.cycle?.atmosphere || 'Endogas (0.90% CP)', data.cycle?.atmosphere || 'Endogas (0.90% CP)', 'Controlled'],
    ['Quench Media & Temp', `${data.cycle?.quenchMedium || 'ISO 32 Oil'} @ ${data.cycle?.targetQuenchTemp || 60} °C`, `${data.cycle?.actualQuenchTemp || 62} °C`, 'Agitated Quench'],
    ['Tempering Temperature', `${data.cycle?.targetTemperingTemp || 180} °C`, `${data.cycle?.actualTemperingTemp || 182} °C`, '± 3 °C (Pass)'],
    ['Tempering Duration', `${data.cycle?.targetTemperingTime || 120} Mins`, `${data.cycle?.actualTemperingTime || 120} Mins`, 'Stress Relieved']
  ];

  doc.rect(36, y, 539, 14).fill('#0f2b5c');
  doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold');
  doc.text('Cycle Parameter', 42, y + 3, { width: 160 });
  doc.text('Specified Target', 210, y + 3, { width: 100 });
  doc.text('Actual Recorded', 320, y + 3, { width: 100 });
  doc.text('Process Compliance', 430, y + 3, { width: 140 });
  y += 14;

  cycleParams.forEach(row => {
    doc.rect(36, y, 539, 13).stroke('#cbd5e1');
    doc.fillColor('#1e293b').fontSize(7.5).font('Helvetica').text(row[0], 42, y + 3, { width: 160 });
    doc.font('Helvetica-Bold').text(row[1], 210, y + 3, { width: 100 });
    doc.font('Helvetica-Bold').fillColor('#0284c7').text(row[2], 320, y + 3, { width: 100 });
    doc.font('Helvetica-Bold').fillColor('#16a34a').text(row[3], 430, y + 3, { width: 140 });
    y += 13;
  });

  y += 6;

  // SECTION 4: METALLURGICAL QC INSPECTION RESULTS
  doc.rect(36, y, 539, 16).fill('#e2e8f0');
  doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text('4. FINAL METALLURGICAL QC INSPECTION & HARDNESS TEST RESULTS', 42, y + 4);
  y += 20;

  const testParams = [
    ['Surface Hardness (HRC)', `${data.hardnessSpec?.min || 58} - ${data.hardnessSpec?.max || 62} HRC`, `${data.hardnessAvg || 60.5} HRC`, 'ACCEPTED / PASS'],
    ['Core Hardness (HRC)', `${data.coreHardnessSpec?.min || 32} - ${data.coreHardnessSpec?.max || 40} HRC`, `${data.coreHardnessAvg || 35.8} HRC`, 'ACCEPTED / PASS'],
    ['Effective Case Depth (ECD)', `${data.caseDepthSpec?.effectiveMin || 0.80} - ${data.caseDepthSpec?.effectiveMax || 1.10} mm`, `${data.actualCaseDepth || 0.94} mm @ 50 HRC`, 'ACCEPTED / PASS'],
    ['Total Case Depth (TCD)', '1.10 - 1.40 mm', `${data.totalCaseDepth || 1.25} mm`, 'ACCEPTED / PASS'],
    ['Microstructure / Matrix', 'Fine Tempered Martensite', 'Martensite + Carbides', 'VERIFIED (PASS)'],
    ['Grain Size (ASTM E112)', 'ASTM 6 or Finer', data.grainSize || 'ASTM 7', 'COMPLIANT'],
    ['Retained Austenite (% RA)', '< 10% RA', `${data.retainedAustenite || 8}% RA`, 'COMPLIANT']
  ];

  doc.rect(36, y, 539, 14).fill('#0f2b5c');
  doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold');
  doc.text('Inspection Test Parameter', 42, y + 3, { width: 160 });
  doc.text('Customer Specification', 210, y + 3, { width: 120 });
  doc.text('Observed Value (Actual)', 340, y + 3, { width: 120 });
  doc.text('QC Disposition', 470, y + 3, { width: 100 });
  y += 14;

  testParams.forEach(row => {
    doc.rect(36, y, 539, 13).stroke('#cbd5e1');
    doc.fillColor('#1e293b').fontSize(7.5).font('Helvetica').text(row[0], 42, y + 3, { width: 160 });
    doc.font('Helvetica-Bold').text(row[1], 210, y + 3, { width: 120 });
    doc.font('Helvetica-Bold').fillColor('#0f172a').text(row[2], 340, y + 3, { width: 120 });
    doc.font('Helvetica-Bold').fillColor('#16a34a').text(row[3], 470, y + 3, { width: 100 });
    y += 13;
  });

  y += 10;

  // SECTION 5: FINAL CONFORMANCE DECLARATION & SIGN-OFF
  doc.rect(36, y, 539, 78).fillAndStroke('#f8fafc', '#0f2b5c');
  doc.fillColor('#0b192c').fontSize(9).font('Helvetica-Bold').text('CERTIFICATE OF CONFORMANCE DECLARATION', 42, y + 6);
  doc.fontSize(7).font('Helvetica').fillColor('#334155').text(
    'We hereby certify that the components referenced above have been processed strictly in accordance with approved heat treatment recipe procedures, customer purchase specifications, and relevant international metallurgy standards. All test instruments and furnaces are calibrated against NABL-traceable national standards.',
    42, y + 18, { width: 360 }
  );

  doc.image(qrDataUrl, 410, y + 8, { width: 48 });
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#0f2b5c').text('SCAN TO VERIFY\nGENUINE CERTIFICATE', 465, y + 20);

  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#0f172a').text('Authorized QC Signatory:', 42, y + 54);
  doc.font('Helvetica').fillColor('#1e293b').text(data.inspectorName || 'Er. Rajesh Sharma (Head of Quality)', 150, y + 54);
  doc.font('Helvetica-Bold').fillColor('#16a34a').text('DISPOSITION: QC PASS VERIFIED', 410, y + 62);

  doc.end();
};

/**
 * Generates Exact Standard Tax Invoice PDF matching MATHEAT production format (STRICTLY 1 PAGE)
 */
export const generateInvoicePdf = async (invoice, res) => {
  // STRICT 1-PAGE A4 SETUP: Margins 18, autoFirstPage: true (fills full 595 x 842 pt A4 sheet)
  const doc = new PDFDocument({ margin: 18, size: 'A4', autoFirstPage: true });

  const cleanFilename = (invoice?.invoiceNumber || 'MH-25-26-0089').replace(/[\/\\?%*:|"<>]/g, '-');

  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${cleanFilename}.pdf"`);
  }
  if (res) {
    doc.pipe(res);
  }

  // 1. Center Background Watermark (Rendered with subtle opacity, locked to true center)
  renderWatermark(doc);

  const left = 24;
  const contentWidth = 547;
  let y = 18;

  // 2. HEADER SECTION (Left: Logo + Badges, Right: Furnace Banner)
  const headerLogo = fs.existsSync(logoPngPath) ? logoPngPath : logoPath;
  if (fs.existsSync(headerLogo)) {
    doc.image(headerLogo, left, y, { width: 145 });
  }

  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#0b2545').text('HEAT TREATMENT SOLUTIONS', left + 2, y + 42, { characterSpacing: 1.2 });

  // 3 Mini Badges under logo
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#0b2545');
  doc.text('⚙ UNIFORM HARDNESS   •   🌡 SUPERIOR STRENGTH   •   🛡 PRECISION PERFORMANCE', left + 2, y + 58);

  // Right Furnace Glow Banner
  const fW = 220, fH = 76;
  const fX = left + contentWidth - fW; // 24 + 547 - 220 = 351
  const fY = y;
  
  doc.save();
  doc.roundedRect(fX, fY, fW, fH, 5).clip();
  if (fs.existsSync(furnaceImgPath)) {
    doc.image(furnaceImgPath, fX, fY, { cover: [fW, fH], align: 'center', valign: 'center' });
    doc.rect(fX, fY, fW * 0.52, fH).fillColor('#000000').fillOpacity(0.55).fill();
  } else {
    doc.rect(fX, fY, fW, fH).fill('#090e17');
  }
  // Bottom-right flame orange wedge accent
  doc.polygon([fX + fW - 52, fY + fH], [fX + fW, fY + fH - 14], [fX + fW, fY + fH]).fillColor('#ea580c').fill();
  doc.restore();

  doc.fillOpacity(1);

  // Furnace Banner Text
  doc.fillColor('#f1f5f9').fontSize(7.5).font('Helvetica-Bold').text('METAL', fX + 12, fY + 8);
  doc.fillColor('#f8fafc').fontSize(10).font('Helvetica-Bold').text('STRONGER', fX + 12, fY + 18);
  doc.fillColor('#e2e8f0').fontSize(7).font('Helvetica-Bold').text('FOR A', fX + 12, fY + 31);
  doc.fillColor('#f8fafc').fontSize(9.5).font('Helvetica-Bold').text('BETTER', fX + 12, fY + 41);
  doc.fillColor('#f8fafc').fontSize(10.5).font('Helvetica-Bold').text('TOMORROW', fX + 12, fY + 53);

  y += fH + 10;
  doc.x = left;
  doc.y = y;

  // 3. TAX INVOICE RIBBON & METADATA BAR
  const barH = 42;
  // Navy Banner Left
  doc.polygon([left, y], [left + 152, y], [left + 165, y + barH], [left, y + barH]).fill('#0b2545');
  doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('TAX INVOICE', left + 10, y + 8);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#ffffff').text('ORIGINAL FOR RECIPIENT', left + 10, y + 26);

  // Center Metadata Box
  const metaX = left + 170;
  const metaW = 265;
  doc.rect(metaX, y, metaW, barH).fillAndStroke('#ffffff', '#cbd5e1');
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#475569');
  doc.text('Invoice No.', metaX + 10, y + 4);
  doc.text('Invoice Date', metaX + 10, y + 13);
  doc.text('Place of Supply', metaX + 10, y + 22);
  doc.text('Reverse Charge', metaX + 10, y + 31);

  doc.font('Helvetica-Bold').fillColor('#000000');
  doc.text(invoice?.invoiceNumber || 'MH/25-26/0089', metaX + 85, y + 4);
  doc.text(invoice?.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '17 Sep 2026', metaX + 85, y + 13);
  doc.text('Gujarat (24)', metaX + 85, y + 22);
  doc.text('No', metaX + 85, y + 31);

  // QR Code Box Right
  const qrBoxX = metaX + metaW + 5;
  const qrBoxW = contentWidth - (metaW + 175);
  doc.rect(qrBoxX, y, qrBoxW, barH).fillAndStroke('#ffffff', '#cbd5e1');
  const qrDataUrl = await QRCode.toDataURL(
    `GST|MH/25-26/0089|17-Sep-2026|129304.00|24AHMPT0206E1ZO|24AABCM8920C1Z4`,
    { margin: 1, width: 95 }
  );
  doc.image(qrDataUrl, qrBoxX + 4, y + 3, { width: 36, height: 36 });
  doc.fontSize(5.8).font('Helvetica-Bold').fillColor('#000000').text('Scan for\nInvoice Verification', qrBoxX + 42, y + 12, { width: qrBoxW - 46, align: 'center' });

  y += barH + 10;

  // 4. PARTY & LOGISTICS SECTION (3 Distinct Rounded Cards with Light Fill)
  const cardW = (contentWidth - 14) / 3;
  const cardH = 114;

  // Card 1: BILL TO
  doc.roundedRect(left, y, cardW, cardH, 5).fillAndStroke('#f4f7fa', '#cbd5e1');
  doc.fillColor('#ea580c').fontSize(8).font('Helvetica-Bold').text('👤 BILL TO', left + 8, y + 8);
  doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold').text(invoice?.customerName || 'DURGA MANUFACTURES', left + 8, y + 20);
  doc.font('Helvetica').fontSize(6.5).fillColor('#1e293b').text(
    'Plot No. A5, Sapar Main Road, Opp. Mahindra Gear, Decora Cement Campus, Shapar Veraval, Rajkot – 360024, Gujarat, India',
    left + 8, y + 34, { width: cardW - 16, lineGap: 2 }
  );
  doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#000000').text(`GSTIN : ${invoice?.customerGstin || '24AHMPT0206E1ZO'}`, left + 8, y + 74);
  doc.font('Helvetica').text('Contact : +91 98258 70821', left + 8, y + 86);
  doc.text('Email : info@durgamanufactures.com', left + 8, y + 98);

  // Card 2: SHIP TO (IF DIFFERENT)
  const c2X = left + cardW + 7;
  doc.roundedRect(c2X, y, cardW, cardH, 5).fillAndStroke('#f4f7fa', '#cbd5e1');
  doc.fillColor('#ea580c').fontSize(8).font('Helvetica-Bold').text('📍 SHIP TO (IF DIFFERENT)', c2X + 8, y + 8);
  doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold').text(invoice?.customerName || 'DURGA MANUFACTURES', c2X + 8, y + 20);
  doc.font('Helvetica').fontSize(6.5).fillColor('#1e293b').text(
    'Plot No. A5, Sapar Main Road, Opp. Mahindra Gear, Decora Cement Campus, Shapar Veraval, Rajkot – 360024, Gujarat, India',
    c2X + 8, y + 34, { width: cardW - 16, lineGap: 2 }
  );

  // Card 3: TRANSPORT & ORDER DETAILS
  const c3X = c2X + cardW + 7;
  doc.roundedRect(c3X, y, cardW, cardH, 5).fillAndStroke('#f4f7fa', '#cbd5e1');
  const tRows = [
    ['Customer PO No.', invoice?.customerPoNo || 'PO/DM/2026/145'],
    ['Job Order No.', invoice?.jobOrderNumber || 'JO/26/0178'],
    ['E-Way Bill No.', '612183521124'],
    ['LR No.', 'GJ03BU4179'],
    ['Transporter', 'Shree Roadlines'],
    ['Freight', 'Paid'],
    ['Payment Terms', invoice?.paymentTerms || '30 Days'],
    ['Due Date', '17 Oct 2026']
  ];

  let ty = y + 8;
  tRows.forEach(([lbl, val]) => {
    doc.fontSize(6.2).font('Helvetica').fillColor('#475569').text(lbl, c3X + 8, ty);
    doc.font('Helvetica-Bold').fillColor('#000000').text(val, c3X + 80, ty, { align: 'right', width: cardW - 88 });
    ty += 12.5;
  });

  y += cardH + 10;

  // 5. INVOICE ITEMS TABLE
  const tableCols = [
    { label: 'Sr. No.', width: 28, align: 'center' },
    { label: 'Description', width: 125, align: 'left' },
    { label: 'Part No. / Spec', width: 62, align: 'center' },
    { label: 'Process', width: 80, align: 'left' },
    { label: 'Batch No.', width: 50, align: 'center' },
    { label: 'Heat No.', width: 42, align: 'center' },
    { label: 'Qty (Kg)', width: 44, align: 'right' },
    { label: 'Rate (₹)', width: 38, align: 'right' },
    { label: 'GST', width: 26, align: 'center' },
    { label: 'Amount (₹)', width: 52, align: 'right' }
  ];

  // Table Header (Navy #0b2545)
  doc.rect(left, y, contentWidth, 18).fill('#0b2545');
  let thX = left;
  tableCols.forEach(col => {
    doc.fillColor('#ffffff').fontSize(6.8).font('Helvetica-Bold').text(col.label, thX + 2, y + 5.5, { width: col.width - 4, align: col.align });
    thX += col.width;
  });

  y += 18;

  const invoiceItems = [
    { sr: '1', desc: 'Rotor (Stamping)', spec: '140×70 = 110MM × 120 STATOR', part: 'HT-140-120', process: 'Hardening + Tempering', batch: 'B-2026-0178', heat: 'H45872', qty: '936.200', rate: '68.50', gst: '18%', amount: '64,129.70' },
    { sr: '2', desc: 'Rotor (Stamping)', spec: '140×70 = 132 ROTOR LOOSE', part: 'HT-140-132', process: 'Hardening + Tempering', batch: 'B-2026-0179', heat: 'H45873', qty: '237.600', rate: '68.50', gst: '18%', amount: '16,275.60' },
    { sr: '3', desc: 'Gear Component', spec: '', part: 'HT-GR-450', process: 'Carburizing + Hardening', batch: 'B-2026-0180', heat: 'H45874', qty: '150.000', rate: '72.00', gst: '18%', amount: '10,800.00' },
    { sr: '4', desc: 'Shaft', spec: '', part: 'HT-SH-320', process: 'Induction Hardening', batch: 'B-2026-0181', heat: 'H45875', qty: '85.000', rate: '75.00', gst: '18%', amount: '6,375.00' },
    { sr: '5', desc: 'Misc. Components', spec: '(As per PO)', part: 'HT-MC-001', process: 'Stress Relieving', batch: 'B-2026-0182', heat: 'H45876', qty: '200.000', rate: '60.00', gst: '18%', amount: '12,000.00' }
  ];

  invoiceItems.forEach(item => {
    const rowH = item.spec ? 26 : 20;
    doc.rect(left, y, contentWidth, rowH).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    let rx = left;
    const vals = [
      item.sr,
      item.desc,
      item.part,
      item.process,
      item.batch,
      item.heat,
      item.qty,
      item.rate,
      item.gst,
      item.amount
    ];

    vals.forEach((v, idx) => {
      doc.moveTo(rx, y).lineTo(rx, y + rowH).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
      doc.fillColor('#000000').fontSize(6.5).font(idx === 1 || idx === 9 ? 'Helvetica-Bold' : 'Helvetica');
      doc.text(v, rx + 2, y + (rowH > 20 ? 4 : 5.5), { width: tableCols[idx].width - 4, align: tableCols[idx].align });
      
      // Secondary spec line under description
      if (idx === 1 && item.spec) {
        doc.fillColor('#475569').fontSize(5.5).font('Helvetica').text(item.spec, rx + 2, y + 14, { width: tableCols[idx].width - 4 });
      }

      rx += tableCols[idx].width;
    });

    y += rowH;
  });

  // Total Quantity Row
  doc.rect(left, y, contentWidth, 16).fillAndStroke('#ffffff', '#0b2545');
  doc.fillColor('#000000').fontSize(7).font('Helvetica-Bold');
  doc.text('Total Quantity (Kg)', left + 180, y + 4.5, { align: 'right', width: 200 });
  doc.text('1,608.800', left + 387, y + 4.5, { align: 'right', width: 44 });

  y += 24;

  // 6. PROCESS SUMMARY & 4 VALUE PILLARS (4 Separate Rounded Badges)
  const pColW = (contentWidth - 12) / 4;
  const pCardH = 40;

  // Badge 1: Process Summary
  doc.roundedRect(left, y, pColW + 24, pCardH, 5).fillAndStroke('#f4f7fa', '#cbd5e1');
  doc.fillColor('#ea580c').fontSize(6.5).font('Helvetica-Bold').text('⚙ PROCESS SUMMARY', left + 6, y + 6);
  doc.fillColor('#1e293b').fontSize(5).font('Helvetica').text('Heat treatment processed under controlled atmosphere & calibrated furnaces.', left + 6, y + 17, { width: pColW + 14, lineGap: 1.5 });

  // Badge 2: Traceability
  const b2X = left + pColW + 28;
  doc.roundedRect(b2X, y, pColW - 8, pCardH, 5).fillAndStroke('#f4f7fa', '#cbd5e1');
  doc.fillColor('#0b2545').fontSize(6.5).font('Helvetica-Bold').text('🥞 TRACEABILITY', b2X + 6, y + 8);
  doc.fillColor('#000000').fontSize(6.2).font('Helvetica-Bold').text('Heat No. → Batch No. → Invoice', b2X + 6, y + 22);

  // Badge 3: Quality Assured
  const b3X = b2X + pColW - 4;
  doc.roundedRect(b3X, y, pColW - 8, pCardH, 5).fillAndStroke('#f4f7fa', '#cbd5e1');
  doc.fillColor('#0b2545').fontSize(6.5).font('Helvetica-Bold').text('🛡 QUALITY ASSURED', b3X + 6, y + 8);
  doc.fillColor('#000000').fontSize(6.2).font('Helvetica-Bold').text('Process Controlled & Tested', b3X + 6, y + 22);

  // Badge 4: Customer Focused
  const b4X = b3X + pColW - 4;
  doc.roundedRect(b4X, y, pColW - 8, pCardH, 5).fillAndStroke('#f4f7fa', '#cbd5e1');
  doc.fillColor('#0b2545').fontSize(6.5).font('Helvetica-Bold').text('👥 CUSTOMER FOCUSED', b4X + 6, y + 8);
  doc.fillColor('#000000').fontSize(6.2).font('Helvetica-Bold').text('On Time Delivery', b4X + 6, y + 22);

  y += pCardH + 10;

  // 7. LOWER GRID: BANK DETAILS | TERMS | FINANCIAL TOTALS (3 Rounded Cards)
  const bCardW = (contentWidth - 14) / 3;
  const bCardH = 144;

  // Bank Details Card
  doc.roundedRect(left, y, bCardW, bCardH, 5).fillAndStroke('#f4f7fa', '#cbd5e1');
  doc.fillColor('#000000').fontSize(7.5).font('Helvetica-Bold').text('🏛 Bank Details', left + 10, y + 8);
  doc.fontSize(6.5).font('Helvetica').fillColor('#475569');
  doc.text('Bank Name :', left + 10, y + 26);
  doc.text('A/C No. :', left + 10, y + 46);
  doc.text('IFSC Code :', left + 10, y + 66);
  doc.text('Branch :', left + 10, y + 86);

  doc.font('Helvetica-Bold').fillColor('#000000');
  doc.text('ICICI Bank Ltd.', left + 65, y + 26);
  doc.text('072805503144', left + 65, y + 46);
  doc.text('ICIC0000728', left + 65, y + 66);
  doc.text('Gondal Road, Rajkot', left + 65, y + 86);

  // Terms & Conditions Card
  const tcX = left + bCardW + 7;
  doc.roundedRect(tcX, y, bCardW, bCardH, 5).fillAndStroke('#f4f7fa', '#cbd5e1');
  doc.fillColor('#000000').fontSize(7.5).font('Helvetica-Bold').text('📜 Terms & Conditions', tcX + 10, y + 8);
  const terms = [
    '1. Goods once sold will not be taken back.',
    '2. Payment to be made within agreed credit period.',
    '3. Interest @ 24% p.a. will be charged on overdue payments.',
    '4. Our risk & responsibility ceases once goods leave premises.',
    '5. Subject to Rajkot Jurisdiction only.',
    '6. Computer generated invoice, no signature required.'
  ];
  let termY = y + 24;
  terms.forEach(t => {
    doc.fontSize(5.5).font('Helvetica').fillColor('#1e293b').text(t, tcX + 10, termY, { width: bCardW - 20, lineGap: 1.5 });
    termY += 18;
  });

  // Financial Calculations Card with Solid Orange Banner
  const fcX = tcX + bCardW + 7;
  doc.roundedRect(fcX, y, bCardW, bCardH, 5).fillAndStroke('#f4f7fa', '#cbd5e1');
  const cRows = [
    ['Sub Total', '1,09,580.30'],
    ['CGST @ 9%', '9,862.23'],
    ['SGST @ 9%', '9,862.23'],
    ['Round Off', '-0.76']
  ];
  let cy = y + 10;
  cRows.forEach(([cl, cv]) => {
    doc.fontSize(6.8).font('Helvetica-Bold').fillColor('#475569').text(cl, fcX + 10, cy);
    doc.font('Helvetica-Bold').fillColor('#000000').text(cv, fcX + 80, cy, { align: 'right', width: bCardW - 90 });
    cy += 19;
  });

  // Grand Total Solid Orange Banner
  doc.rect(fcX, y + 102, bCardW, 42).fill('#ea580c');
  doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold').text('Grand Total (₹)', fcX + 10, y + 116);
  doc.fontSize(11.5).text('1,29,304.00', fcX + 70, y + 114, { align: 'right', width: bCardW - 80 });

  y += bCardH + 10;

  // 8. AMOUNT IN WORDS & SIGNATORY/STAMP AREA
  const amtW = contentWidth - 195;
  const amtH = 80;
  doc.roundedRect(left, y, amtW, amtH, 5).fillAndStroke('#f4f7fa', '#cbd5e1');
  doc.fillColor('#ea580c').fontSize(7.5).font('Helvetica-Bold').text('📄 Amount in Words', left + 10, y + 10);
  doc.fillColor('#000000').fontSize(8.5).font('Helvetica-Bold').text(
    'Rupees One Lakh Twenty Nine Thousand Three Hundred Four Only',
    left + 10, y + 28, { width: amtW - 20, lineGap: 2.5 }
  );

  // Signatory & Stamp Right Area
  const sigX = left + amtW + 10;
  doc.fillColor('#000000').fontSize(7.5).font('Helvetica-Bold').text('For, MATHEAT PVT. LTD.', sigX, y + 6);
  
  // Realistic Vector Signature Stroke
  doc.moveTo(sigX + 2, y + 36)
    .bezierCurveTo(sigX + 15, y + 16, sigX + 25, y + 48, sigX + 45, y + 24)
    .bezierCurveTo(sigX + 60, y + 16, sigX + 75, y + 38, sigX + 95, y + 30)
    .strokeColor('#0b2545').lineWidth(1.3).stroke();
  doc.moveTo(sigX + 6, y + 42).lineTo(sigX + 90, y + 38).strokeColor('#0b2545').lineWidth(0.9).stroke();

  doc.font('Helvetica-Bold').fontSize(6.8).fillColor('#475569').text('Authorized Signatory', sigX, y + 54);

  // Circular Official Company Seal (Double concentric ring in Blue Ink)
  const stX = sigX + 138, stY = y + 38;
  doc.circle(stX, stY, 24).strokeColor('#1e3a8a').lineWidth(1.4).stroke();
  doc.circle(stX, stY, 20).strokeColor('#1e3a8a').lineWidth(0.7).stroke();
  doc.fontSize(5.2).font('Helvetica-Bold').fillColor('#1e3a8a').text('MATHEAT PVT. LTD.', stX - 25, stY - 11, { width: 50, align: 'center' });
  doc.fontSize(5.5).font('Helvetica-Bold').text('RAJKOT', stX - 25, stY - 1, { width: 50, align: 'center' });
  doc.fontSize(6).text('★', stX - 25, stY + 8, { width: 50, align: 'center' });

  y += amtH + 10;

  // 9. FOOTER BANNER (Flushes beautifully to y = 816 pt, exactly 26 pt from bottom of 842 pt A4)
  const footW = contentWidth - 145;
  const footH = 46;
  doc.rect(left, y, footW, footH).fill('#0b2545');
  doc.fillColor('#ffffff').fontSize(6.8).font('Helvetica').text('📍 Plot No. XX, Industrial Area, Rajkot – 360____, Gujarat, India', left + 10, y + 6);
  doc.fillColor('#ffffff').text('📞 +91 98258 70821   |   ✉ info@matheat.in   |   🌐 www.matheat.in', left + 10, y + 18);
  doc.fontSize(5.8).fillColor('#ffffff').text('CIN : U29299GJ2026PTCXXX0X  |  GSTIN : 24XXXXX0000X  |  IEC : XXXXXXXXXX', left + 10, y + 30);

  // Angled Flame Orange Banner Right
  doc.polygon([left + footW - 20, y], [left + contentWidth, y], [left + contentWidth, y + footH], [left + footW, y + footH]).fill('#ea580c');
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text('HEAT TODAY', left + footW + 6, y + 10, { align: 'right', width: 130 });
  doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold').text('A STRONGER TOMORROW', left + footW + 6, y + 24, { align: 'right', width: 130 });

  // Finish document (guaranteed 1 page)
  doc.end();
};
