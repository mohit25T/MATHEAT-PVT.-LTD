import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[DB] Attempting connection to configured MongoDB: ${uri}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[DB] Could not connect to configured MongoDB URI (${err.message}). Falling back to in-memory database...`);
    }
  }

  try {
    console.log('[DB] Starting Embedded In-Memory MongoDB Server for MATHEAT ERP...');
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'matheat_erp'
      }
    });
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[DB] Connected to In-Memory MongoDB: ${memoryUri}`);
    return conn;
  } catch (error) {
    console.error(`[DB] Critical Error starting database: ${error.message}`);
    throw error;
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
