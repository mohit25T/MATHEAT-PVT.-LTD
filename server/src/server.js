import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import { connectDB } from './config/db.js';
import { seedDatabase } from './seed.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import masterRoutes from './routes/masterRoutes.js';
import grnRoutes from './routes/grnRoutes.js';
import jobOrderRoutes from './routes/jobOrderRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import qcRoutes from './routes/qcRoutes.js';
import ncrRoutes from './routes/ncrRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import commercialRoutes from './routes/commercialRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import traceabilityRoutes from './routes/traceabilityRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import gateRoutes from './routes/gateRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import gstRoutes from './routes/gstRoutes.js';
import furnaceRoutes from './routes/furnaceRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import dropdownRoutes from './routes/dropdownRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import instrumentRoutes from './routes/instrumentRoutes.js';
import reworkRoutes from './routes/reworkRoutes.js';
import jobCardRoutes from './routes/jobCardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7000;

// Standard Middlewares (with 50mb limit for camera base64 images)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request Logging Middleware (logs every API call with DB name)
app.use((req, res, next) => {
  const dbName = mongoose.connection.name || 'MATHEAT';
  console.log(`[API CALL] ${req.method} ${req.originalUrl} | Database: ${dbName}`);
  next();
});

// Serve static assets (such as company logo)
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Serve uploaded weighing machine & load CCTV images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/grn', grnRoutes);
app.use('/api/job-orders', jobOrderRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/qc', qcRoutes);
app.use('/api/ncr', ncrRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/commercial', commercialRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/traceability', traceabilityRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/gate', gateRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/furnaces', furnaceRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/dropdowns', dropdownRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/instruments', instrumentRoutes);
app.use('/api/rework', reworkRoutes);
app.use('/api/job-cards', jobCardRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check Endpoint (returns DB name and status)
app.get('/api/health', (req, res) => {
  const dbName = mongoose.connection.name || 'MATHEAT';
  const dbHost = mongoose.connection.host || 'apexit.2qbg0ge.mongodb.net';
  res.json({
    status: 'OK',
    company: 'MATHEAT PVT. LTD.',
    system: 'Heat Treatment ERP + MES',
    dbName: dbName,
    dbHost: dbHost,
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server & Database
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`====================================================`);
      console.log(`🔥 MATHEAT Heat Treatment ERP + MES Server Running`);
      console.log(`🚀 Port: ${PORT} (Bound to 0.0.0.0 for LAN Network Access)`);
      console.log(`🗄️ Database Connected: ${mongoose.connection.name || 'MATHEAT'}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`⚠️ Port ${PORT} is temporarily busy. Retrying in 1.5s...`);
        setTimeout(() => {
          server.close();
          server.listen(PORT, '0.0.0.0');
        }, 1500);
      } else {
        console.error(`Fatal Server Listen Error:`, err);
      }
    });

    const gracefulShutdown = () => {
      server.close(() => {
        process.kill(process.pid, 'SIGUSR2');
      });
    };

    process.once('SIGUSR2', gracefulShutdown);
    process.on('SIGINT', () => server.close(() => process.exit(0)));
    process.on('SIGTERM', () => server.close(() => process.exit(0)));
    return server;
  } catch (err) {
    console.error(`Fatal Server Startup Error:`, err);
    process.exit(1);
  }
};

const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('server.js') || 
  process.argv[1].endsWith('server')
);

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer };
export default app;
