import { Customer } from '../models/Customer.js';
import { Supplier } from '../models/Supplier.js';
import { Part } from '../models/Part.js';
import { Furnace } from '../models/Furnace.js';
import { ProcessMaster } from '../models/ProcessMaster.js';
import { logAudit } from '../middleware/audit.js';

export const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ companyName: 1 });
    res.json({ success: true, count: customers.length, customers });
  } catch (error) { next(error); }
};

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    if (req.user) {
      await logAudit({ req, action: 'CREATE', module: 'CUSTOMERS', recordId: customer._id, entityType: 'Customer', newValue: customer });
    }
    res.status(201).json({ success: true, customer });
  } catch (error) { next(error); }
};

export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json({ success: true, count: suppliers.length, suppliers, data: suppliers });
  } catch (error) { next(error); }
};

export const createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, supplier });
  } catch (error) { next(error); }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (error) { next(error); }
};

export const getParts = async (req, res, next) => {
  try {
    const parts = await Part.find().populate('customer', 'companyName customerCode').sort({ partNumber: 1 });
    res.json({ success: true, count: parts.length, parts, data: parts });
  } catch (error) { next(error); }
};

export const getPartById = async (req, res, next) => {
  try {
    const part = await Part.findById(req.params.id).populate('customer', 'companyName customerCode');
    if (!part) return res.status(404).json({ success: false, message: 'Part not found' });
    res.json({ success: true, part, data: part });
  } catch (error) { next(error); }
};

export const updatePart = async (req, res, next) => {
  try {
    const part = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!part) return res.status(404).json({ success: false, message: 'Part not found' });
    if (req.user) {
      await logAudit({ req, action: 'UPDATE', module: 'PARTS', recordId: part._id, entityType: 'Part', newValue: part });
    }
    res.json({ success: true, message: 'Part updated successfully', part, data: part });
  } catch (error) { next(error); }
};

export const deletePart = async (req, res, next) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part) return res.status(404).json({ success: false, message: 'Part not found' });
    res.json({ success: true, message: 'Part deleted successfully' });
  } catch (error) { next(error); }
};

export const createPart = async (req, res, next) => {
  try {
    const part = await Part.create(req.body);
    if (req.user) {
      await logAudit({ req, action: 'CREATE', module: 'PARTS', recordId: part._id, entityType: 'Part', newValue: part });
    }
    res.status(201).json({ success: true, part });
  } catch (error) { next(error); }
};

export const getProcesses = async (req, res, next) => {
  try {
    const processes = await ProcessMaster.find().sort({ processName: 1 });
    res.json({ success: true, count: processes.length, processes, data: processes });
  } catch (error) { next(error); }
};

export const createProcess = async (req, res, next) => {
  try {
    const process = await ProcessMaster.create(req.body);
    res.status(201).json({ success: true, process });
  } catch (error) { next(error); }
};

export const updateProcess = async (req, res, next) => {
  try {
    const process = await ProcessMaster.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!process) return res.status(404).json({ success: false, message: 'Process not found' });
    res.json({ success: true, process });
  } catch (error) { next(error); }
};

export const deleteProcess = async (req, res, next) => {
  try {
    const process = await ProcessMaster.findByIdAndDelete(req.params.id);
    if (!process) return res.status(404).json({ success: false, message: 'Process not found' });
    res.json({ success: true, message: 'Process deleted' });
  } catch (error) { next(error); }
};

export const getFurnaces = async (req, res, next) => {
  try {
    const furnaces = await Furnace.find()
      .populate('currentBatch')
      .populate('currentOperator', 'firstName lastName')
      .sort({ furnaceId: 1 });
    res.json({ success: true, count: furnaces.length, furnaces });
  } catch (error) { next(error); }
};

export const updateFurnaceTelemetry = async (req, res, next) => {
  try {
    const { currentTemperature, currentCarbonPotential, status } = req.body;
    const furnace = await Furnace.findById(req.params.id);
    if (!furnace) return res.status(404).json({ success: false, message: 'Furnace not found' });

    if (currentTemperature !== undefined) furnace.currentTemperature = currentTemperature;
    if (currentCarbonPotential !== undefined) furnace.currentCarbonPotential = currentCarbonPotential;
    if (status) furnace.currentStatus = status;

    await furnace.save();
    res.json({ success: true, furnace });
  } catch (error) { next(error); }
};
