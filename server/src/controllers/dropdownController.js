import { Dropdown } from '../models/Dropdown.js';
import { Customer } from '../models/Customer.js';
import { Furnace } from '../models/Furnace.js';
import { Part } from '../models/Part.js';
import { Supplier } from '../models/Supplier.js';
import { Recipe } from '../models/Recipe.js';

// Pre-defined seed templates for standard heat treatment industry dropdowns
export const DEFAULT_DROPDOWNS = [
  {
    key: 'ownership',
    label: 'Material Ownership',
    options: [
      { value: 'CUSTOMER OWNED', label: 'CUSTOMER OWNED (Job Work Material)' },
      { value: 'INTERNAL STOCK', label: 'INTERNAL STOCK (Plant Ingot/Raw)' },
      { value: 'COMMERCIAL PURCHASE', label: 'COMMERCIAL PURCHASE (Trading)' }
    ]
  },
  {
    key: 'storagelocation',
    label: 'Storage Bay / Warehouse Location',
    options: [
      { value: 'CUSTOMER-BAY-01', label: 'Customer Raw Material Bay 01' },
      { value: 'CUSTOMER-BAY-02', label: 'Customer Raw Material Bay 02' },
      { value: 'QUENCH-BAY-01', label: 'Quench Floor Storage Bay 01' },
      { value: 'FORGING-STORE-A', label: 'Forging Inward Warehouse Store A' },
      { value: 'DISPATCH-HOLDING-BAY', label: 'QC Passed Dispatch Holding Bay' },
      { value: 'RAW-INGOT-YARD', label: 'Heavy Raw Ingot Yard' }
    ]
  },
  {
    key: 'materialgrade',
    label: 'Steel & Alloy Material Grade',
    options: [
      { value: '20MnCr5', label: '20MnCr5 (Case Hardening Steel)' },
      { value: 'EN31', label: 'EN31 / 100Cr6 (High Carbon Bearing Steel)' },
      { value: 'EN8', label: 'EN8 / AISI 1040 (Unalloyed Medium Carbon)' },
      { value: 'EN19', label: 'EN19 / AISI 4140 (Cr-Mo High Tensile)' },
      { value: 'EN24', label: 'EN24 / AISI 4340 (Ni-Cr-Mo High Tensile)' },
      { value: '8620', label: 'SAE 8620 (Carburizing Gear Steel)' },
      { value: '16MnCr5', label: '16MnCr5 (Automotive Gear Steel)' },
      { value: 'C45', label: 'C45 (Medium Carbon Steel)' },
      { value: 'D2', label: 'D2 High Carbon High Chromium Tool Steel' },
      { value: 'H13', label: 'H13 Hot Work Die Steel' }
    ]
  },
  {
    key: 'quenchmedium',
    label: 'Quenching Medium',
    options: [
      { value: 'OIL', label: 'Quench Oil (Cold 60°C)' },
      { value: 'HOT_OIL', label: 'Hot Martempering Oil (150°C)' },
      { value: 'POLYMER', label: 'Polymer / Water Spray' },
      { value: 'SALT_BATH', label: 'Salt Bath (Isothermal Austempering)' },
      { value: 'WATER', label: 'Water Spray / Tank' },
      { value: 'AIR', label: 'Forced Air Convection' },
      { value: 'NONE', label: 'None / Furnace Cool' }
    ]
  },
  {
    key: 'paymentterms',
    label: 'Commercial Payment Terms',
    options: [
      { value: '30 Days Net', label: '30 Days Net' },
      { value: '45 Days Net', label: '45 Days Net' },
      { value: '60 Days Net', label: '60 Days Net' },
      { value: 'Immediate / Advance', label: 'Immediate / Advance Payment' },
      { value: 'Against Delivery (COD)', label: 'Against Delivery (COD / PDC)' },
      { value: '15 Days PDC', label: '15 Days Post-Dated Cheque' },
      { value: '90 Days LC', label: '90 Days Letter of Credit (LC)' }
    ]
  },
  {
    key: 'requiredprocess',
    label: 'Required Heat Treatment Process',
    options: [
      { value: 'Gas Carburizing & Quench', label: 'Gas Carburizing & Oil Quench (H&T)' },
      { value: 'Through Hardening', label: 'Through Hardening & High Tempering' },
      { value: 'Carbonitriding', label: 'Carbonitriding & Oil Quench' },
      { value: 'Isothermal Annealing', label: 'Isothermal / Full Annealing' },
      { value: 'Normalizing', label: 'Normalizing' },
      { value: 'Stress Relieving', label: 'Sub-Critical Stress Relieving' },
      { value: 'Induction Hardening', label: 'Induction Hardening Job Work' },
      { value: 'Tempering Only', label: 'Tempering Only' }
    ]
  },
  {
    key: 'productionpriority',
    label: 'Production Priority',
    options: [
      { value: 'STANDARD', label: 'Standard Production Queue' },
      { value: 'URGENT', label: 'Urgent Processing' },
      { value: 'CRITICAL', label: 'Critical Line-Stop Emergency' }
    ]
  },
  {
    key: 'furnacetype',
    label: 'Furnace Architectural Type',
    options: [
      { value: 'SEALED_QUENCH_FURNACE', label: 'Sealed Quench Furnace (SQF)' },
      { value: 'PIT_CARBURIZING', label: 'Pit Carburizing Furnace' },
      { value: 'MESH_BELT', label: 'Continuous Mesh Belt Furnace' },
      { value: 'TEMPERING_OVEN', label: 'Tempering / Annealing Oven' },
      { value: 'BOGIE_HEARTH', label: 'Bogie Hearth Furnace' },
      { value: 'INDUCTION', label: 'Induction Hardening Unit' }
    ]
  },
  {
    key: 'heatingsystem',
    label: 'Heating System & Elements',
    options: [
      { value: 'Electric Radiant Tubes (120 kW)', label: 'Electric Radiant Tubes (120 kW)' },
      { value: 'Gas Fired Recuperative Radiant Tubes', label: 'Gas Fired Recuperative Radiant Tubes' },
      { value: 'Nichrome / Kanthal Metallic Resistance Elements', label: 'Nichrome / Kanthal Metallic Resistance Elements' },
      { value: 'Silicon Carbide (SiC) Heating Elements', label: 'Silicon Carbide (SiC) Heating Elements' },
      { value: 'Direct Gas Fired High-Velocity Burners', label: 'Direct Gas Fired High-Velocity Burners' }
    ]
  },
  {
    key: 'instrumentname',
    label: 'Instrument Name & Description',
    options: [
      { value: 'Furnace Control Thermocouple (Type S Pt/Rh)', label: 'Furnace Control Thermocouple (Type S Pt/Rh)' },
      { value: 'High-Temp Monitoring Thermocouple (Type K)', label: 'High-Temp Monitoring Thermocouple (Type K)' },
      { value: 'Quench Oil Tank Temperature Sensor', label: 'Quench Oil Tank Temperature Sensor' },
      { value: 'Rockwell Hardness Tester (Scale C/B)', label: 'Rockwell Hardness Tester (Scale C/B)' },
      { value: 'Vickers Microhardness Tester (HV 0.5kg)', label: 'Vickers Microhardness Tester (HV 0.5kg)' },
      { value: '50-Ton Digital Weighbridge Load Cells', label: '50-Ton Digital Weighbridge Load Cells' },
      { value: 'Endo-Gas Generator Carbon Potential Oxygen Probe', label: 'Endo-Gas Generator Carbon Potential Oxygen Probe' },
      { value: 'Ammonia Dissociator Nitrogen Pressure Sensor', label: 'Ammonia Dissociator Nitrogen Pressure Sensor' },
      { value: 'PID Automatic Temperature Controller (Eurotherm/Honeywell)', label: 'PID Automatic Temperature Controller (Eurotherm/Honeywell)' }
    ]
  },
  {
    key: 'instrumenttype',
    label: 'Instrument Type',
    options: [
      { value: 'THERMOCOUPLE', label: 'Thermocouple (Type S/R/K/N)' },
      { value: 'TEMP_CONTROLLER', label: 'Digital Temperature / PID Controller' },
      { value: 'HARDNESS_TESTER', label: 'Rockwell / Vickers Hardness Tester' },
      { value: 'PYROMETER', label: 'Optical / Infrared Pyrometer' },
      { value: 'WEIGHING_SCALE', label: 'Weighbridge / Crane Load Scale' },
      { value: 'PRESSURE_GAUGE', label: 'Gas Pressure Transducer' }
    ]
  },
  {
    key: 'accuracytolerance',
    label: 'Certified Accuracy Tolerance',
    options: [
      { value: '± 1.0 °C', label: '± 1.0 °C' },
      { value: '± 0.5 °C', label: '± 0.5 °C' },
      { value: '± 2.0 °C', label: '± 2.0 °C' },
      { value: '± 0.5 HRC', label: '± 0.5 HRC' },
      { value: '± 1.0 HRC', label: '± 1.0 HRC' },
      { value: '± 0.05 mm', label: '± 0.05 mm' },
      { value: '± 5 kg (Weighbridge)', label: '± 5 kg (Weighbridge)' }
    ]
  },
  {
    key: 'calibrationagency',
    label: 'Accredited Calibration Agency',
    options: [
      { value: 'National Accreditation Board for Testing and Calibration Labs (NABL)', label: 'National Accreditation Board for Testing and Calibration Labs (NABL)' },
      { value: 'Electronics & Quality Development Centre (EQDC), Gandhinagar', label: 'Electronics & Quality Development Centre (EQDC), Gandhinagar' },
      { value: 'SGS India Metrology Services Pvt. Ltd.', label: 'SGS India Metrology Services Pvt. Ltd.' },
      { value: 'TUV India Calibration Division', label: 'TUV India Calibration Division' },
      { value: 'Apex Metrology & Calibration Labs Ltd.', label: 'Apex Metrology & Calibration Labs Ltd.' }
    ]
  },
  {
    key: 'grainsize',
    label: 'Austenitic Grain Size (ASTM)',
    options: [
      { value: 'ASTM 5', label: 'ASTM 5 (Coarse Grain)' },
      { value: 'ASTM 6', label: 'ASTM 6 (Nominal Fine)' },
      { value: 'ASTM 7', label: 'ASTM 7 (Standard Fine Grain - Nominal)' },
      { value: 'ASTM 8', label: 'ASTM 8 (Fine Grain)' },
      { value: 'ASTM 9', label: 'ASTM 9 (Extra Fine Grain)' },
      { value: 'ASTM 10', label: 'ASTM 10 (Ultra Fine Grain)' }
    ]
  },
  {
    key: 'microstructure',
    label: 'Microstructure Observed',
    options: [
      { value: 'Tempered Martensite with fine dispersed spheroidal carbides. Free from network carbides.', label: 'Tempered Martensite with fine dispersed spheroidal carbides (Standard)' },
      { value: 'Fine Tempered Martensite & lower bainite with uniform case transition.', label: 'Fine Tempered Martensite & lower bainite' },
      { value: 'Fully transformed Lower Bainitic matrix free from retained austenite.', label: 'Fully transformed Lower Bainitic matrix' },
      { value: 'Uniform Spheroidized Pearlitic matrix with fine grain boundary ferrite.', label: 'Uniform Spheroidized Pearlitic matrix (Annealed)' }
    ]
  },
  {
    key: 'servicecategory',
    label: 'Heat Treatment Service Category',
    options: [
      { value: 'THERMO_CHEMICAL', label: 'Case Hardening / Carburizing' },
      { value: 'THERMAL_HARDENING', label: 'Through Hardening & Tempering' },
      { value: 'ANNEALING', label: 'Annealing / Normalizing' },
      { value: 'STRESS_RELIEF', label: 'Stress Relieving' },
      { value: 'TEMPERING', label: 'Tempering Only' }
    ]
  },
  {
    key: 'serviceprocessname',
    label: 'Heat Treatment Process Service Name',
    options: [
      { value: 'Gas Carburizing & Oil Quench (H&T)', label: 'Gas Carburizing & Oil Quench (H&T)' },
      { value: 'Carbonitriding & Oil Quench', label: 'Carbonitriding & Oil Quench' },
      { value: 'Through Hardening & High Tempering', label: 'Through Hardening & High Tempering' },
      { value: 'Isothermal / Full Annealing', label: 'Isothermal / Full Annealing' },
      { value: 'Sub-Critical Stress Relieving', label: 'Sub-Critical Stress Relieving' },
      { value: 'Normalizing', label: 'Normalizing' },
      { value: 'Solution Annealing', label: 'Solution Annealing' },
      { value: 'Liquid / Salt Bath Carburizing', label: 'Liquid / Salt Bath Carburizing' },
      { value: 'Gas Nitriding / Nitrocarburizing', label: 'Gas Nitriding / Nitrocarburizing' },
      { value: 'Induction Hardening Job Work', label: 'Induction Hardening Job Work' },
      { value: 'Shot Blasting / Surface Cleaning', label: 'Shot Blasting / Surface Cleaning' },
      { value: 'Tempering Only', label: 'Tempering Only' }
    ]
  },
  {
    key: 'department',
    label: 'Enterprise Department',
    options: [
      { value: 'Operations', label: 'Operations & Production Floor' },
      { value: 'Metallurgy & Lab', label: 'Metallurgy & Quality Lab' },
      { value: 'Quality Control', label: 'Quality Control & Inspection' },
      { value: 'Maintenance', label: 'Plant Maintenance & Instrumentation' },
      { value: 'Security & Gate', label: 'Security & Gate Weighbridge' },
      { value: 'Stores & Warehouse', label: 'Stores & Raw Material Warehouse' },
      { value: 'Commercial & Billing', label: 'Commercial, Dispatch & Invoicing' },
      { value: 'Management', label: 'Plant Management & Directors' }
    ]
  },
  {
    key: 'accessrole',
    label: 'Access Role',
    options: [
      { value: 'SUPER_ADMIN', label: 'SUPER ADMIN (Owner Access)' },
      { value: 'ADMIN', label: 'ADMIN (Full Access)' },
      { value: 'PLANT_MANAGER', label: 'PLANT MANAGER' },
      { value: 'PRODUCTION_MANAGER', label: 'PRODUCTION MANAGER' },
      { value: 'METALLURGIST', label: 'METALLURGIST (Recipes & CQI-9)' },
      { value: 'FURNACE_OPERATOR', label: 'FURNACE OPERATOR' },
      { value: 'QC_MANAGER', label: 'QC MANAGER' },
      { value: 'QUALITY_INSPECTOR', label: 'QUALITY INSPECTOR (QC Lab)' },
      { value: 'MAINTENANCE_ENGINEER', label: 'MAINTENANCE ENGINEER' },
      { value: 'MAINTENANCE_MANAGER', label: 'MAINTENANCE MANAGER' },
      { value: 'GATE_SECURITY', label: 'GATE SECURITY (Weighbridge)' },
      { value: 'STORE_KEEPER', label: 'STORE KEEPER (GRN / Inward)' },
      { value: 'STORE_MANAGER', label: 'STORE MANAGER' },
      { value: 'COMMERCIAL', label: 'COMMERCIAL (Dispatch & Billing)' },
      { value: 'ACCOUNTS', label: 'ACCOUNTS' }
    ]
  },
  {
    key: 'suppliercategory',
    label: 'Supplier Category',
    options: [
      { value: 'Consumables & Furnace Salts', label: 'Consumables & Furnace Salts' },
      { value: 'Quench Oils & Lubricants', label: 'Quench Oils & Lubricants' },
      { value: 'Alloy Steels & Raw Materials', label: 'Alloy Steels & Raw Materials' },
      { value: 'Calibration & Maintenance', label: 'Calibration & Maintenance Services' },
      { value: 'Refractory & Heating Elements', label: 'Refractory, Muffle & Heating Elements' }
    ]
  },
  {
    key: 'poitemcategory',
    label: 'Purchase Item Category',
    options: [
      { value: 'FURNACE_SALT', label: 'Furnace Salt' },
      { value: 'QUENCH_OIL', label: 'Quenching Oil' },
      { value: 'SPARE_PARTS', label: 'Equipment Spare Parts' },
      { value: 'RAW_STEEL', label: 'Raw Steel Material' },
      { value: 'PACKAGING', label: 'Packaging Materials' },
      { value: 'GENERAL', label: 'General Consumables' }
    ]
  },
  {
    key: 'poitemunit',
    label: 'Purchase Unit of Measure',
    options: [
      { value: 'KG', label: 'Kilograms (Kg)' },
      { value: 'LITERS', label: 'Liters (L)' },
      { value: 'PIECES', label: 'Pieces (Pcs)' },
      { value: 'SETS', label: 'Sets' },
      { value: 'BAGS', label: 'Bags (50 Kg)' },
      { value: 'METERS', label: 'Meters (m)' }
    ]
  },
  {
    key: 'soakminutes',
    label: 'Soak Time Duration (Minutes)',
    options: [
      { value: '45', label: '45 min' },
      { value: '60', label: '60 min (1 hr)' },
      { value: '90', label: '90 min (1.5 hrs)' },
      { value: '120', label: '120 min (2 hrs)' },
      { value: '180', label: '180 min (3 hrs)' },
      { value: '240', label: '240 min (4 hrs)' }
    ]
  },
  {
    key: 'carbonpotential',
    label: 'Atmosphere Carbon Potential (%CP)',
    options: [
      { value: '0.75', label: '0.75 % CP' },
      { value: '0.80', label: '0.80 % CP' },
      { value: '0.85', label: '0.85 % CP' },
      { value: '0.90', label: '0.90 % CP (Nominal)' },
      { value: '0.95', label: '0.95 % CP' },
      { value: '1.00', label: '1.00 % CP' }
    ]
  },
  {
    key: 'temperingtime',
    label: 'Tempering Time Duration (Minutes)',
    options: [
      { value: '60', label: '60 min (1 hr)' },
      { value: '90', label: '90 min (1.5 hrs)' },
      { value: '120', label: '120 min (2 hrs)' },
      { value: '180', label: '180 min (3 hrs)' },
      { value: '240', label: '240 min (4 hrs)' }
    ]
  },
  {
    key: 'addressnodetype',
    label: 'Address Node Type',
    options: [
      { value: 'both', label: 'Both (Billing & Shipping)' },
      { value: 'shipping', label: 'Shipping Destination Only' },
      { value: 'billing', label: 'Billing Destination Only' }
    ]
  }
];

/**
 * Seed initial dropdowns in MongoDB Atlas if missing
 */
export const seedDropdowns = async () => {
  try {
    for (const item of DEFAULT_DROPDOWNS) {
      const existing = await Dropdown.findOne({ key: item.key.toLowerCase() });
      if (!existing) {
        await Dropdown.create({
          key: item.key.toLowerCase(),
          label: item.label,
          options: item.options
        });
        console.log(`[DROPDOWN SEED] Created dropdown: ${item.key} (${item.options.length} options)`);
      }
    }
  } catch (err) {
    console.warn('[DROPDOWN SEED] Error seeding dropdowns:', err.message);
  }
};

/**
 * GET /api/dropdowns
 * Retrieves all dropdown categories and their options from MongoDB.
 * Also dynamically includes options from live collections (Customers, Parts, Furnaces, Suppliers, Recipes)
 */
export const getAllDropdowns = async (req, res, next) => {
  try {
    const list = await Dropdown.find({}).lean();
    const dictionary = {};

    list.forEach((doc) => {
      dictionary[doc.key] = doc.options || [];
    });

    // Dynamically augment with live business entities from DB
    try {
      // 1. Customers
      const customers = await Customer.find({}, 'companyName company name').lean();
      const customerOpts = (dictionary['customer'] || []);
      customers.forEach((c) => {
        const val = c.companyName || c.company || c.name;
        if (val && !customerOpts.some((o) => o.value.toLowerCase() === val.toLowerCase())) {
          customerOpts.push({ value: val, label: val });
        }
      });
      dictionary['customer'] = customerOpts;

      // 2. Parts
      const parts = await Part.find({}, 'partNumber partName materialGrade').lean();
      const partOpts = (dictionary['partnumber'] || []);
      parts.forEach((p) => {
        if (p.partNumber && !partOpts.some((o) => o.value.toLowerCase() === p.partNumber.toLowerCase())) {
          partOpts.push({ value: p.partNumber, label: `${p.partNumber} - ${p.partName || ''}`.trim() });
        }
      });
      dictionary['partnumber'] = partOpts;

      // 3. Furnaces
      const furnaces = await Furnace.find({}, 'furnaceId name').lean();
      const furnaceOpts = (dictionary['furnaceunit'] || []);
      furnaces.forEach((f) => {
        if (f.furnaceId && !furnaceOpts.some((o) => o.value.toLowerCase() === f.furnaceId.toLowerCase())) {
          furnaceOpts.push({ value: f.furnaceId, label: `${f.furnaceId} - ${f.name || ''}`.trim() });
        }
      });
      dictionary['furnaceunit'] = furnaceOpts;

      // 4. Recipes
      const recipes = await Recipe.find({}, 'code name').lean();
      const recipeOpts = (dictionary['recipe'] || []);
      recipes.forEach((r) => {
        if (r.code && !recipeOpts.some((o) => o.value.toLowerCase() === r.code.toLowerCase())) {
          recipeOpts.push({ value: r.code, label: `${r.code} - ${r.name || ''}`.trim() });
        }
      });
      dictionary['recipe'] = recipeOpts;

      // 5. Suppliers
      const suppliers = await Supplier.find({}, 'name companyName').lean();
      const supplierOpts = (dictionary['supplier'] || []);
      suppliers.forEach((s) => {
        const sVal = s.name || s.companyName;
        if (sVal && !supplierOpts.some((o) => o.value.toLowerCase() === sVal.toLowerCase())) {
          supplierOpts.push({ value: sVal, label: sVal });
        }
      });
      dictionary['supplier'] = supplierOpts;
    } catch (dynamicErr) {
      console.warn('[DROPDOWNS] Dynamic entity merge error:', dynamicErr.message);
    }

    res.json({
      success: true,
      data: dictionary
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dropdowns/:key
 * Retrieves options for a specific dropdown key from database.
 */
export const getDropdownByKey = async (req, res, next) => {
  try {
    const rawKey = req.params.key.toLowerCase().trim();
    let dropdown = await Dropdown.findOne({ key: rawKey }).lean();

    if (!dropdown) {
      // Find matching default template if not yet seeded
      const defaultTemplate = DEFAULT_DROPDOWNS.find((d) => d.key === rawKey);
      if (defaultTemplate) {
        dropdown = await Dropdown.create({
          key: defaultTemplate.key,
          label: defaultTemplate.label,
          options: defaultTemplate.options
        });
      } else {
        dropdown = await Dropdown.create({
          key: rawKey,
          label: rawKey,
          options: []
        });
      }
    }

    res.json({
      success: true,
      key: dropdown.key,
      label: dropdown.label,
      options: dropdown.options || []
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/dropdowns/:key/options
 * Adds and stores a new custom option into the database for a dropdown key.
 */
export const addDropdownOption = async (req, res, next) => {
  try {
    const rawKey = req.params.key.toLowerCase().trim();
    const { value, label } = req.body;

    if (!value || typeof value !== 'string' || !value.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Option value is required'
      });
    }

    const trimmedValue = value.trim();
    const trimmedLabel = label && typeof label === 'string' && label.trim() ? label.trim() : trimmedValue;

    let dropdown = await Dropdown.findOne({ key: rawKey });

    if (!dropdown) {
      dropdown = new Dropdown({
        key: rawKey,
        label: rawKey.charAt(0).toUpperCase() + rawKey.slice(1),
        options: []
      });
    }

    // Check if option already exists (case-insensitive)
    const exists = dropdown.options.some(
      (opt) => opt.value.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (!exists) {
      dropdown.options.push({
        value: trimmedValue,
        label: trimmedLabel,
        isDefault: false
      });
      await dropdown.save();
      console.log(`[DROPDOWN DB] Stored new option "${trimmedValue}" in dropdown "${rawKey}"`);
    }

    res.status(201).json({
      success: true,
      message: `Option "${trimmedValue}" stored in database for "${rawKey}"`,
      data: dropdown.options
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/dropdowns/:key/options/:value
 * Removes an option from a dropdown in database.
 */
export const deleteDropdownOption = async (req, res, next) => {
  try {
    const rawKey = req.params.key.toLowerCase().trim();
    const valToRemove = req.params.value.trim();

    const dropdown = await Dropdown.findOne({ key: rawKey });
    if (!dropdown) {
      return res.status(404).json({ success: false, message: 'Dropdown not found' });
    }

    dropdown.options = dropdown.options.filter(
      (opt) => opt.value.toLowerCase() !== valToRemove.toLowerCase()
    );
    await dropdown.save();

    res.json({
      success: true,
      message: `Option removed from "${rawKey}"`,
      data: dropdown.options
    });
  } catch (err) {
    next(err);
  }
};
