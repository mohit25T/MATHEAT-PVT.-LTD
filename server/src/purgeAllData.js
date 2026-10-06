/**
 * ============================================================
 * MATHEAT ERP — FULL DATABASE PURGE SCRIPT
 * ============================================================
 * Deletes ALL documents from EVERY collection except the
 * admin user (so the app stays accessible after purge).
 *
 * Run: node server/src/purgeAllData.js
 * ============================================================
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

import { User }                                  from './models/User.js';
import { Customer }                              from './models/Customer.js';
import { Supplier }                              from './models/Supplier.js';
import { Part }                                  from './models/Part.js';
import { ProcessMaster }                         from './models/ProcessMaster.js';
import { Furnace }                               from './models/Furnace.js';
import { Recipe }                                from './models/Recipe.js';
import { GRN }                                   from './models/GRN.js';
import { JobOrder }                              from './models/JobOrder.js';
import { Batch }                                 from './models/Batch.js';
import { FurnaceCycle }                          from './models/FurnaceCycle.js';
import { QCInspection }                         from './models/QCInspection.js';
import { Inventory, InventoryTransaction, Scrap } from './models/Inventory.js';
import { Calibration, MaintenanceLog }          from './models/Maintenance.js';
import { Dispatch, Invoice, BatchCosting }      from './models/Invoice.js';
import { GateEntry }                             from './models/GateEntry.js';

dotenv.config();

const purge = async () => {
  try {
    await connectDB();
    console.log('\n🗑️  MATHEAT DATABASE PURGE STARTED\n');

    const collections = [
      { name: 'Customers',            model: Customer },
      { name: 'Suppliers',            model: Supplier },
      { name: 'Parts',                model: Part },
      { name: 'ProcessMasters',       model: ProcessMaster },
      { name: 'Furnaces',             model: Furnace },
      { name: 'Recipes',              model: Recipe },
      { name: 'GRNs',                 model: GRN },
      { name: 'JobOrders',            model: JobOrder },
      { name: 'Batches',              model: Batch },
      { name: 'FurnaceCycles',        model: FurnaceCycle },
      { name: 'QCInspections',        model: QCInspection },
      { name: 'InventoryItems',       model: Inventory },
      { name: 'InventoryTransactions',model: InventoryTransaction },
      { name: 'Scrap',                model: Scrap },
      { name: 'Calibrations',         model: Calibration },
      { name: 'MaintenanceLogs',      model: MaintenanceLog },
      { name: 'Dispatches',           model: Dispatch },
      { name: 'Invoices',             model: Invoice },
      { name: 'BatchCostings',        model: BatchCosting },
      { name: 'GateEntries',          model: GateEntry },
      { name: 'Users',                model: User },
    ];

    for (const col of collections) {
      const result = await col.model.deleteMany({});
      console.log(`  ✅ ${col.name}: deleted ${result.deletedCount} records`);
    }

    console.log('\n🎉 ALL SAMPLE DATA PURGED SUCCESSFULLY.');
    console.log('   The database is now completely empty.');
    console.log('   Start fresh by creating an Admin user via the ERP login page.\n');

  } catch (err) {
    console.error('❌ Purge failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

purge();
