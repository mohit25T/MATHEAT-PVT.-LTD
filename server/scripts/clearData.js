import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb+srv://mohittopiya2564_db_user:2564%40Mohit@apexit.2qbg0ge.mongodb.net/MATHEAT?retryWrites=true&w=majority&appName=apexit";

const cleanDir = (dir) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === '.gitkeep') continue; // Always preserve folder structure
      const fullPath = path.join(dir, file);
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          cleanDir(fullPath);
        } else {
          fs.unlinkSync(fullPath);
          console.log(`[DELETED FILE] ${fullPath}`);
        }
      } catch (err) {
        console.warn(`Could not delete: ${fullPath}`, err.message);
      }
    }
  }
};

const run = async () => {
  try {
    console.log(`Connecting to MongoDB Atlas...`);
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`Connected to Database: ${conn.connection.name}`);

    // Fetch ALL collections present in the database dynamically
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in database.`);

    for (const colInfo of collections) {
      const colName = colInfo.name;
      // Skip system collections if any
      if (colName.startsWith('system.')) continue;
      
      const col = conn.connection.db.collection(colName);
      const count = await col.countDocuments();
      if (count > 0) {
        const res = await col.deleteMany({});
        console.log(`[WIPED] ${colName}: ${res.deletedCount} documents deleted`);
      } else {
        console.log(`[ALREADY EMPTY] ${colName}: 0 documents`);
      }
    }

    // Clean uploads files while strictly preserving the directory structure
    const uploadsDir = path.join(__dirname, '../uploads');
    cleanDir(uploadsDir);

    // Explicitly guarantee inward and outward folders and subfolders exist permanently
    const requiredFolders = [
      path.join(uploadsDir, 'inward', 'DIGITAL INDICATOR WEIGHT'),
      path.join(uploadsDir, 'inward', 'PHYSICAL METAL LOAD ON WEIGHBRIDGE DECK'),
      path.join(uploadsDir, 'outward', 'DIGITAL INDICATOR WEIGHT'),
      path.join(uploadsDir, 'outward', 'PHYSICAL METAL LOAD ON WEIGHBRIDGE DECK')
    ];
    requiredFolders.forEach((f) => {
      if (!fs.existsSync(f)) {
        fs.mkdirSync(f, { recursive: true });
      }
    });
    console.log('[PRESERVED] Uploads inward and outward folders verified and preserved intact');

    console.log('\n--- VERIFYING ALL COLLECTIONS ARE EMPTY ---');
    const remainingCollections = await conn.connection.db.listCollections().toArray();
    let totalDocs = 0;
    for (const colInfo of remainingCollections) {
      if (colInfo.name.startsWith('system.')) continue;
      const count = await conn.connection.db.collection(colInfo.name).countDocuments();
      console.log(`Collection [${colInfo.name}]: ${count} docs`);
      totalDocs += count;
    }
    console.log(`\nTOTAL REMAINING DOCUMENTS ACROSS ENTIRE DATABASE: ${totalDocs}`);

    await mongoose.disconnect();
    console.log('✅ FULL DATABASE HAS BEEN COMPLETELY WIPED TO 0 RECORDS!');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing full database:', err);
    process.exit(1);
  }
};

run();
