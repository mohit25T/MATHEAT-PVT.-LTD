import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GateEntry } from '../models/GateEntry.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload Directories
const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

const DIRECTORIES = {
  INWARD: {
    SCALE: path.join(UPLOADS_ROOT, 'inward', 'DIGITAL INDICATOR WEIGHT'),
    MATERIAL: path.join(UPLOADS_ROOT, 'inward', 'PHYSICAL METAL LOAD ON WEIGHBRIDGE DECK')
  },
  OUTWARD: {
    SCALE: path.join(UPLOADS_ROOT, 'outward', 'DIGITAL INDICATOR WEIGHT'),
    MATERIAL: path.join(UPLOADS_ROOT, 'outward', 'PHYSICAL METAL LOAD ON WEIGHBRIDGE DECK')
  }
};

// Ensure all destination folders exist
const ensureDirectoriesExist = () => {
  Object.values(DIRECTORIES).forEach((typeGroup) => {
    Object.values(typeGroup).forEach((dirPath) => {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  });
};

ensureDirectoriesExist();

// Helper to format filename as that day's date and current time (e.g. 2026-09-20_10-15-30.jpg)
const getFormattedDateTimeFilename = (targetDir, extension = 'jpg') => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  
  let filename = `${datePart}_${timePart}.${extension}`;
  let counter = 1;

  // Avoid collision if fired in the exact same second
  while (fs.existsSync(path.join(targetDir, filename))) {
    filename = `${datePart}_${timePart}_${counter}.${extension}`;
    counter++;
  }

  return filename;
};

// Helper to save base64 data to target folder
const saveBase64Image = async (dataUrl, targetDir) => {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.includes('base64,')) {
    return null;
  }

  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const ext = matches && matches[1] ? matches[1].split('/')[1] || 'jpg' : 'jpg';
    const cleanExt = ext === 'jpeg' ? 'jpg' : ext;
    const base64Data = matches ? matches[2] : dataUrl.split('base64,')[1];

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filename = getFormattedDateTimeFilename(targetDir, cleanExt);
    const filePath = path.join(targetDir, filename);

    await fs.promises.writeFile(filePath, Buffer.from(base64Data, 'base64'));

    // Construct relative public URL path
    const relativePath = path.relative(path.join(__dirname, '../..'), filePath).replace(/\\/g, '/');
    return `/${relativePath}`;
  } catch (err) {
    console.error('Error saving image to disk:', err);
    return null;
  }
};

// 1. GET ALL GATE ENTRIES
router.get('/entries', async (req, res) => {
  try {
    const entries = await GateEntry.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: entries.length, data: entries });
  } catch (err) {
    console.error('Error fetching gate entries:', err);
    res.status(500).json({ success: false, message: 'Server error fetching gate entries', error: err.message });
  }
});

// 2. CREATE NEW GATE ENTRY (INWARD / OUTWARD) WITH IMAGE PERSISTENCE
router.post('/entry', async (req, res) => {
  try {
    const {
      passId,
      type,
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

    // Save Digital Indicator Weight Photo to its dedicated folder
    let scalePhotoPath = null;
    if (scalePhoto) {
      scalePhotoPath = await saveBase64Image(scalePhoto, folderConfig.SCALE);
    }

    // Save Physical Metal Load Photo to its dedicated folder
    let materialPhotoPath = null;
    if (materialPhoto) {
      materialPhotoPath = await saveBase64Image(materialPhoto, folderConfig.MATERIAL);
    }

    // Generate passId if not passed
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
    console.log(`[GATE] Scale Image: ${scalePhotoPath}`);
    console.log(`[GATE] Load Image: ${materialPhotoPath}`);

    res.status(201).json({
      success: true,
      message: `${normalizedType} Gate Entry saved successfully`,
      data: newGateEntry
    });
  } catch (err) {
    console.error('Error creating gate entry:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create gate entry',
      error: err.message
    });
  }
});

// 3. CLEAR ALL GATE DATA & DELETE ALL UPLOADED IMAGES
router.delete('/clear-all', async (req, res) => {
  try {
    const result = await GateEntry.deleteMany({});

    // Wipe all image files inside uploads folders, leaving directories and .gitkeep intact
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

    console.log(`[GATE] Cleared all gate entries (${result.deletedCount} deleted) and wiped uploaded images.`);

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} gate entries and wiped all uploaded images from backend`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error clearing data:', err);
    res.status(500).json({ success: false, message: 'Failed to clear data', error: err.message });
  }
});

export default router;
