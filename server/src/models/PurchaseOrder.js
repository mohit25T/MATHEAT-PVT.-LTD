import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['QUENCH_OIL', 'PROCESS_GAS', 'HEAT_TREAT_SALT', 'SPARE_PARTS', 'REFRACTORY', 'LAB_CHEMICAL', 'GENERAL'], 
    default: 'GENERAL' 
  },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, enum: ['LITRES', 'KG', 'PCS', 'CYLINDERS', 'BARRELS', 'SETS'], default: 'KG' },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 }
});

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  supplierName: { type: String, required: true, trim: true },
  supplierGstin: { type: String, trim: true },
  supplierPhone: { type: String, trim: true },
  supplierAddress: { type: String, trim: true },
  orderDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  expectedDeliveryDate: { type: String },
  items: [purchaseItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  gstRate: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true, default: 0 },
  paymentTerms: { type: String, default: '30 Days Credit' },
  status: { 
    type: String, 
    enum: ['ORDERED', 'RECEIVED', 'CANCELLED'], 
    default: 'ORDERED' 
  },
  notes: { type: String, trim: true }
}, {
  timestamps: true
});

export const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
