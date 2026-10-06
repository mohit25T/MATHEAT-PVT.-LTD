import mongoose from 'mongoose';

const gateEntrySchema = new mongoose.Schema({
  passId: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  type: { 
    type: String, 
    enum: ['INWARD', 'OUTWARD'], 
    required: true 
  },
  party: { 
    type: String, 
    required: true, 
    trim: true 
  },
  vehicleNo: { 
    type: String, 
    required: true, 
    uppercase: true, 
    trim: true 
  },
  docRef: { 
    type: String, 
    required: true, 
    trim: true 
  },
  heatNo: { 
    type: String, 
    uppercase: true, 
    trim: true 
  },
  partName: { 
    type: String, 
    trim: true 
  },
  grossWeightKg: { 
    type: Number, 
    required: true 
  },
  tareWeightKg: { 
    type: Number, 
    required: true 
  },
  netWeightKg: { 
    type: Number, 
    required: true 
  },
  scalePhotoPath: { 
    type: String 
  },
  materialPhotoPath: { 
    type: String 
  },
  timestamp: { 
    type: String 
  },
  operator: { 
    type: String, 
    default: 'Ramesh Patel' 
  },
  driverName: { 
    type: String 
  },
  securityOfficer: { 
    type: String, 
    default: 'MATHEAT Main Gate' 
  },
  status: { 
    type: String, 
    default: 'SCALE VERIFIED' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const GateEntry = mongoose.model('GateEntry', gateEntrySchema);
