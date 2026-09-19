import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  recipeCode: { type: String, required: true, uppercase: true }, // e.g. RCP-EN31-CARB
  recipeName: { type: String, required: true },
  process: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcessMaster',
    required: true
  },
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part'
  },
  materialGrade: { type: String, required: true, uppercase: true },
  revision: { type: String, default: 'V1', uppercase: true }, // V1, V2, V3
  isApproved: { type: Boolean, default: false },
  
  // Furnace Cycle Target Parameters
  targetTemperature: { type: Number, required: true }, // e.g. 860 °C
  tempTolerance: { type: Number, default: 5 }, // ±5 °C
  heatingTimeMinutes: { type: Number, default: 60 },
  soakingTimeMinutes: { type: Number, required: true }, // e.g. 120 min
  soakToleranceMinutes: { type: Number, default: 5 },
  atmosphere: { type: String, default: 'Endothermic Gas' },
  carbonPotential: { type: Number, default: 0.9 }, // 0.90 %
  carbonPotentialTolerance: { type: Number, default: 0.05 },
  
  // Quenching
  quenchMedium: { type: String, enum: ['OIL', 'WATER', 'POLYMER', 'AIR', 'NONE'], default: 'OIL' },
  quenchOilType: { type: String, default: 'Fast Quench Oil (ISO 32)' },
  targetQuenchTemperature: { type: Number, default: 65 }, // °C
  quenchTimeMinutes: { type: Number, default: 15 },
  
  // Tempering
  temperingTemperature: { type: Number, required: true }, // e.g. 180 °C
  temperingTempTolerance: { type: Number, default: 5 },
  temperingTimeMinutes: { type: Number, required: true }, // e.g. 120 min
  coolingMethod: { type: String, default: 'Still Air Cool to Room Temp' },
  
  specialInstructions: { type: String },
  revisionReason: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: { type: Date }
}, {
  timestamps: true
});

// Composite unique constraint: recipeCode + revision
recipeSchema.index({ recipeCode: 1, revision: 1 }, { unique: true });

export const Recipe = mongoose.model('Recipe', recipeSchema);
