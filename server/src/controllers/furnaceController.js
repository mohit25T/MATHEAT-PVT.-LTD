import mongoose from 'mongoose';
import { Furnace } from '../models/Furnace.js';

export const findFurnaceQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { furnaceId: id.toUpperCase() }] };
  }
  return { furnaceId: id.toUpperCase() };
};

// 1. GET ALL FURNACES
export const getAll = async (req, res, next) => {
  try {
    const furnaces = await Furnace.find().sort({ furnaceId: 1 });
    res.json({ success: true, count: furnaces.length, furnaces, data: furnaces });
  } catch (err) {
    next(err);
  }
};

// 2. GET SINGLE FURNACE
export const getById = async (req, res, next) => {
  try {
    const furnace = await Furnace.findOne(findFurnaceQuery(req.params.id));
    if (!furnace) {
      return res.status(404).json({ success: false, message: 'Furnace not found' });
    }
    res.json({ success: true, furnace });
  } catch (err) {
    next(err);
  }
};

// 3. CREATE NEW FURNACE
export const create = async (req, res, next) => {
  try {
    const {
      furnaceId,
      name,
      type,
      capacityKg,
      maxTemperature,
      quenchMedium,
      heatingType,
      ratedPowerKw,
      manufacturer,
      model
    } = req.body;

    if (!furnaceId || !name || !capacityKg) {
      return res.status(400).json({
        success: false,
        message: 'Furnace ID, Name, and Capacity (kg) are required fields.'
      });
    }

    const cleanId = furnaceId.trim().toUpperCase();

    const existing = await Furnace.findOne({ furnaceId: cleanId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Furnace with ID "${cleanId}" already exists.`
      });
    }

    const furnace = await Furnace.create({
      furnaceId: cleanId,
      name: name.trim(),
      type: type || 'SEALED_QUENCH_FURNACE',
      capacityKg: Number(capacityKg),
      maxTemperature: maxTemperature ? Number(maxTemperature) : 1050,
      quenchMedium: quenchMedium || 'OIL',
      heatingType: heatingType || 'Electric Radiant Tubes',
      ratedPowerKw: ratedPowerKw ? Number(ratedPowerKw) : 95,
      manufacturer: manufacturer || 'Plant Installed',
      model: model || 'Custom Unit',
      currentStatus: 'IDLE',
      currentTemperature: 28,
      loadedWeightKg: 0
    });

    console.log(`[FURNACE CREATED] #${furnace.furnaceId} - ${furnace.name} (${furnace.capacityKg} kg)`);
    res.status(201).json({
      success: true,
      message: 'Furnace registered successfully',
      furnace
    });
  } catch (err) {
    next(err);
  }
};

// 4. UPDATE FURNACE
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    if (body.furnaceId) body.furnaceId = body.furnaceId.trim().toUpperCase();

    const updated = await Furnace.findOneAndUpdate(
      findFurnaceQuery(id),
      body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Furnace not found' });
    }

    res.json({
      success: true,
      message: 'Furnace updated successfully',
      furnace: updated
    });
  } catch (err) {
    next(err);
  }
};

// 5. DELETE FURNACE
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Furnace.findOneAndDelete(findFurnaceQuery(id));

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Furnace not found' });
    }

    console.log(`[FURNACE DELETED] #${deleted.furnaceId} - ${deleted.name}`);
    res.json({
      success: true,
      message: `Furnace "${deleted.furnaceId}" removed successfully`,
      furnace: deleted
    });
  } catch (err) {
    next(err);
  }
};
