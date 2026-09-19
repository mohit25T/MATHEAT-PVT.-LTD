import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7000;

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (such as company logo)
app.use('/assets', express.static(path.join(__dirname, '../assets')));

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

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    company: 'MATHEAT PVT. LTD.',
    system: 'Heat Treatment ERP + MES',
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

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🔥 MATHEAT Heat Treatment ERP + MES Server Running`);
      console.log(`🚀 Port: ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error(`Fatal Server Startup Error:`, err);
    process.exit(1);
  }
};

startServer();
