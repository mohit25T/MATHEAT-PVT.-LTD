import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GateEntry } from '../models/GateEntry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

export const DIRECTORIES = {
  INWARD: {
    SCALE: path.join(UPLOADS_ROOT, 'inward', 'DIGITAL INDICATOR WEIGHT'),
    MATERIAL: path.join(UPLOADS_ROOT, 'inward', 'PHYSICAL METAL LOAD ON WEIGHBRIDGE DECK')
  },
  OUTWARD: {
    SCALE: path.join(UPLOADS_ROOT, 'outward', 'DIGITAL INDICATOR WEIGHT'),
    MATERIAL: path.join(UPLOADS_ROOT, 'outward', 'PHYSICAL METAL LOAD ON WEIGHBRIDGE DECK')
  }
};

export const ensureDirectoriesExist = () => {
  Object.values(DIRECTORIES).forEach((typeGroup) => {
    Object.values(typeGroup).forEach((dirPath) => {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  });
};

ensureDirectoriesExist();

export const getFormattedDateTimeFilename = (targetDir, extension = 'jpg') => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  
  let filename = `${datePart}_${timePart}.${extension}`;
  let counter = 1;

  while (fs.existsSync(path.join(targetDir, filename))) {
    filename = `${datePart}_${timePart}_${counter}.${extension}`;
    counter++;
  }

  return filename;
};

export const saveBase64Image = async (dataUrl, targetDir) => {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.includes('base64,')) {
    return null;
  }

  try {
    ensureDirectoriesExist();
    const parts = dataUrl.split(';base64,');
    const mimeType = parts[0].split(':')[1];
    let extension = 'jpg';
    if (mimeType === 'image/png') extension = 'png';
    if (mimeType === 'image/webp') extension = 'webp';

    const base64Data = parts[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const filename = getFormattedDateTimeFilename(targetDir, extension);
    const filePath = path.join(targetDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    const relativePath = path.relative(UPLOADS_ROOT, filePath).replace(/\\/g, '/');
    return `/uploads/${relativePath}`;
  } catch (err) {
    console.error('[IMAGE SAVE ERROR]:', err);
    return null;
  }
};

// 1. GET ALL GATE ENTRIES
export const getEntries = async (req, res, next) => {
  try {
    const entries = await GateEntry.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: entries.length,
      entries,
      data: entries
    });
  } catch (err) {
    next(err);
  }
};

// 2. CREATE GATE ENTRY WITH LIVE CAMERA PHOTO CAPTURES
export const createEntry = async (req, res, next) => {
  try {
    const {
      type,
      passId,
      party,
      vehicleNo,
      docRef,
      heatNo,
      partName,
      grossWeightKg,
      tareWeightKg,
      netWeightKg,
      scalePhoto,
      materialPhoto,
      timestamp,
      operator,
      driverName,
      status
    } = req.body;

    if (!type || !party || !vehicleNo || !docRef) {
      return res.status(400).json({
        success: false,
        message: 'Type, party, vehicleNo, and docRef are required fields'
      });
    }

    const normalizedType = type.toUpperCase() === 'OUTWARD' ? 'OUTWARD' : 'INWARD';
    const folderConfig = DIRECTORIES[normalizedType];

    let scalePhotoPath = null;
    if (scalePhoto) {
      scalePhotoPath = await saveBase64Image(scalePhoto, folderConfig.SCALE);
    }

    let materialPhotoPath = null;
    if (materialPhoto) {
      materialPhotoPath = await saveBase64Image(materialPhoto, folderConfig.MATERIAL);
    }

    const generatedPassId = passId || `GT-${normalizedType === 'INWARD' ? 'IN' : 'OUT'}-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newGateEntry = new GateEntry({
      passId: generatedPassId,
      type: normalizedType,
      party,
      vehicleNo,
      docRef,
      heatNo,
      partName,
      grossWeightKg: parseFloat(grossWeightKg) || 0,
      tareWeightKg: parseFloat(tareWeightKg) || 0,
      netWeightKg: parseFloat(netWeightKg) || 0,
      scalePhotoPath: scalePhotoPath || '',
      materialPhotoPath: materialPhotoPath || '',
      timestamp: timestamp || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      operator: operator || 'Ramesh Patel',
      driverName: driverName || vehicleNo,
      status: status || 'SCALE VERIFIED'
    });

    await newGateEntry.save();

    console.log(`[GATE] Saved ${normalizedType} Gate Entry #${generatedPassId} to MongoDB`);
    res.status(201).json({
      success: true,
      message: `${normalizedType} Gate Entry saved successfully`,
      data: newGateEntry
    });
  } catch (err) {
    next(err);
  }
};

// 3. CLEAR ALL GATE DATA & DELETE ALL UPLOADED IMAGES
export const clearAll = async (req, res, next) => {
  try {
    const result = await GateEntry.deleteMany({});

    const cleanDir = (dir) => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file === '.gitkeep') continue;
          const fullPath = path.join(dir, file);
          try {
            if (fs.statSync(fullPath).isFile()) {
              fs.unlinkSync(fullPath);
            }
          } catch (e) {
            console.warn('Could not delete file:', fullPath, e.message);
          }
        }
      }
    };

    cleanDir(DIRECTORIES.INWARD.SCALE);
    cleanDir(DIRECTORIES.INWARD.MATERIAL);
    cleanDir(DIRECTORIES.OUTWARD.SCALE);
    cleanDir(DIRECTORIES.OUTWARD.MATERIAL);

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} gate entries and wiped all uploaded images from backend`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    next(err);
  }
};
