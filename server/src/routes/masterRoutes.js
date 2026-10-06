import express from 'express';
import * as masterController from '../controllers/masterController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// CUSTOMERS
router.get('/customers', masterController.getCustomers);
router.post('/customers', masterController.createCustomer);

// SUPPLIERS
router.get('/suppliers', masterController.getSuppliers);
router.post('/suppliers', masterController.createSupplier);
router.delete('/suppliers/:id', masterController.deleteSupplier);

// PARTS
router.get('/parts', masterController.getParts);
router.get('/parts/:id', masterController.getPartById);
router.post('/parts', masterController.createPart);
router.put('/parts/:id', masterController.updatePart);
router.delete('/parts/:id', masterController.deletePart);

// PROCESSES / SERVICES
router.get('/processes', masterController.getProcesses);
router.post('/processes', masterController.createProcess);
router.put('/processes/:id', masterController.updateProcess);
router.delete('/processes/:id', masterController.deleteProcess);

// FURNACES
router.get('/furnaces', masterController.getFurnaces);
router.put('/furnaces/:id/telemetry', masterController.updateFurnaceTelemetry);

export default router;
